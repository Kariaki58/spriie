import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Escrow from '@/models/EscrowTransaction'
import Order from '@/models/order'
import { getServerSession } from 'next-auth'
import { options } from '@/app/api/auth/options'


export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    const session = await getServerSession(options);

    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "you are not logged in" }, { status: 400 })
    }


    await connectToDatabase()
    
    const { id: orderId } = await params
    const { confirmToken } = await req.json()

    console.log(orderId)
    console.log(confirmToken)
    // Validate input
    if (!orderId || !confirmToken) {
      return NextResponse.json(
        { isValid: false, error: 'Missing order ID or token' },
        { status: 400 }
      )
    }

    // Find the escrow record with orderId
    const escrow = await Escrow.findOne({ orderId, buyerId: session.user.id })
      .populate('buyerId sellerId')
      .exec()

    if (!escrow) {
      return NextResponse.json(
        { isValid: false, error: 'Escrow record not found' },
        { status: 404 }
      )
    }

    const isTokenValid = (
      escrow.confirmationToken === confirmToken &&
      escrow.confirmationTokenExpires &&
      new Date(escrow.confirmationTokenExpires) > new Date()
    )
    console.log(escrow.confirmationToken === confirmToken)
    console.log(escrow.confirmationTokenExpires &&
      new Date(escrow.confirmationTokenExpires) > new Date())


    

    if (!isTokenValid) {
        return NextResponse.json(
            { 
            isValid: false,
            error: escrow.confirmationTokenExpires && new Date(escrow.confirmationTokenExpires) <= new Date()
                ? 'Confirmation link has expired'
                : 'Invalid confirmation token'
            },
            { status: 401 }
        )
    }

    const order = await Order.findById(orderId).select('status').exec()

    return NextResponse.json({
      isValid: true,
      escrowStatus: escrow.status,
      orderStatus: order?.status || 'unknown',
      paymentMethod: escrow.paymentMethod,
      amount: escrow.amount,
      seller: {
        id: escrow.sellerId._id,
        name: escrow.sellerId.name
      },
      buyer: {
        id: escrow.buyerId._id,
        name: escrow.buyerId.name
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { isValid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}