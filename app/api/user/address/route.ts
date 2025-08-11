import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongoose';
import { options } from '../../auth/options';
import AddressModel from '@/models/address';


interface Address {
  _id: string;
  fullName: string;
  type: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const validateAddress = (address: any) => {
  const requiredFields = ['fullName', 'type', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
  const missingFields = requiredFields.filter(field => !address[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userAddress = await AddressModel.findOne({ userId: session.user.id });

    if (!userAddress) {
      return NextResponse.json({ addresses: [] });
    }

    return NextResponse.json({ addresses: userAddress.addresses });
  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressData = await request.json();
    
    try {
      validateAddress(addressData);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await connectToDatabase();

    let userAddress = await AddressModel.findOne({ userId: session.user.id });

    // Remove _id if it exists (let MongoDB generate it)
    const { _id, ...cleanAddressData } = addressData;

    if (!userAddress) {
      // If no addresses exist, this will be the default
      cleanAddressData.isDefault = true;
      
      userAddress = new AddressModel({
        userId: session.user.id,
        addresses: [cleanAddressData]
      });
    } else {
      // If setting as default, unset any existing default
      if (cleanAddressData.isDefault) {
        userAddress.addresses = userAddress.addresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      } else if (userAddress.addresses.length === 0) {
        // If this is the first address, it must be default
        cleanAddressData.isDefault = true;
      }
      
      userAddress.addresses.push(cleanAddressData);
    }

    await userAddress.save();

    return NextResponse.json({ addresses: userAddress.addresses });
  } catch (error: any) {
    console.error('Address create error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const addressId = url.searchParams.get('addressId');
    const updateData = await request.json();

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    try {
      validateAddress(updateData);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await connectToDatabase();

    const userAddress = await AddressModel.findOne({ userId: session.user.id });
    if (!userAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const addressIndex = userAddress.addresses.findIndex(
      (addr: any) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset any existing default
    if (updateData.isDefault) {
      userAddress.addresses = userAddress.addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }

    // Update the address
    userAddress.addresses[addressIndex] = {
      ...userAddress.addresses[addressIndex],
      ...updateData
    };

    await userAddress.save();

    return NextResponse.json({ addresses: userAddress.addresses });
  } catch (error: any) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const addressId = url.searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const userAddress = await AddressModel.findOne({ userId: session.user.id });
    if (!userAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Check if this is the default address
    const isDefault = userAddress.addresses.some(
      (addr: any) => addr._id.toString() === addressId && addr.isDefault
    );

    // Filter out the address to delete
    userAddress.addresses = userAddress.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );

    // If we deleted the default address and there are other addresses, set the first one as default
    if (isDefault && userAddress.addresses.length > 0) {
      userAddress.addresses[0].isDefault = true;
    }

    await userAddress.save();

    return NextResponse.json({ addresses: userAddress.addresses });
  } catch (error: any) {
    console.error('Address delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}