import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/options';
import connectToDatabase from '@/lib/mongoose';
import Team from '@/models/Team';
import Store from '@/models/store';


export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }




    const { invitationToken } = await req.json();

    // In a real app, you would verify the invitation token here
    // For simplicity, we'll just find by email and storeId

    await connectToDatabase();

    const store = await Store.findOne({ userId: session.user.id });

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 404 })
    }

    const teamMember = await Team.findOne({
      storeId: store._id,
      email: session.user.email,
      status: 'pending',
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Invitation not found or already accepted' },
        { status: 404 }
      );
    }

    // Update to active status and add user ID
    teamMember.status = 'active';
    teamMember.userId = session.user.id;
    if (!teamMember.name) {
      teamMember.name = session.user.name;
    }
    if (!teamMember.avatar) {
      teamMember.avatar = session.user.image;
    }

    await teamMember.save();

    return NextResponse.json(teamMember);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}