import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/options';
import User from '@/models/user';
import connectToDatabase from '@/lib/mongoose';
import { UploadFile } from '@/lib/cloudinary/cloud-fun';


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
    }

    // Upload to Cloudinary
    const secure_url = await UploadFile(file);

    // Update user's avatar in database
    await User.findByIdAndUpdate(session.user.id, { avatar: secure_url });

    return NextResponse.json({ avatar: secure_url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}