import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../auth/options';
import Team from '@/models/Team';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/user';
import Store from '@/models/store';
import crypto from 'crypto';
import { resend } from '@/lib/email/resend';
import { teamInvitationEmail } from '@/lib/email/email-templates';


const verificationToken = crypto.randomBytes(32).toString('hex');

// Helper function to verify user has permission to manage team
async function verifyTeamAccess(userId: string, storeId: string) {
  const teamMember = await Team.findOne({
    storeId,
    userId,
    status: 'active',
    $or: [{ role: 'owner' }, { role: 'admin' }],
  });
  
  if (!teamMember) {
    throw new Error('Unauthorized: You do not have permission to manage this team');
  }
  return teamMember;
}

// GET all team members for a store
export async function GET(req: NextRequest) {
  try {
    console.log('here')
    await connectToDatabase();
    const session = await getServerSession(options);
    console.log(session?.user)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const store = await Store.findOne({ userId: session.user.id });
    
    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 404 })
    }


    // Verify user has access to this store's team
    await verifyTeamAccess(session.user.id, store._id);

    const teamMembers = await Team.find({ storeId: store._id })
      .populate('userId', 'name email image')
      .populate('invitedBy', 'name email');
    

    console.log("******************")
    
    
    console.log(teamMembers)

    return NextResponse.json({ teamMembers, storeId: store._id }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST invite a new team member
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const store = await Store.findOne({ userId: session.user.id });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    await verifyTeamAccess(session.user.id, store._id);

    // Check for existing invitation
    const existingInvite = await Team.findOne({ storeId: store._id, email });
    if (existingInvite) {
      return NextResponse.json(
        { error: "This user has already been invited" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create team member
    const newMember = await Team.create({
      storeId: store._id,
      email,
      role,
      invitedBy: session.user.id,
      verificationToken,
      tokenExpires,
      status: "pending",
    });

    // Get inviter details
    const inviter = await User.findById(session.user.id);

    // Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_API_URL}/verify-invitation?token=${verificationToken}&email=${email}`;
    
    const { error } = await resend.emails.send({
      from: 'Spriie <contact@spriie.com>',
      to: email,
      ...teamInvitationEmail(
        inviter?.name || "A team member",
        store.storeName,
        inviteLink,
        role,
        "24 hours"
      ),
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json({ error: "Failed to send initation email" }, { status: 400 })
    }

    return NextResponse.json({
      _id: newMember._id,
      email: newMember.email,
      role: newMember.role,
      status: newMember.status,
      userId: newMember.userId || null,
      // Include other necessary fields
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// PATCH update a team member's role
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, role, storeId } = await req.json();

    console.log(memberId, role, storeId)

    if (!memberId || !role || !storeId) {
      return NextResponse.json(
        { error: 'Member ID, role, and store ID are required' },
        { status: 400 }
      );
    }

    // Verify user has permission to update members
    await verifyTeamAccess(session.user.id, storeId);

    // Prevent modifying owners
    const memberToUpdate = await Team.findById(memberId);
    if (memberToUpdate.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot modify the owner role' },
        { status: 403 }
      );
    }

    const updatedMember = await Team.findByIdAndUpdate(
      memberId,
      { role },
      { new: true }
    );

    return NextResponse.json(updatedMember);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE remove a team member
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    console.log(searchParams)
    const memberId = searchParams.get('memberId');
    const storeId = searchParams.get('storeId');

    if (!memberId || !storeId) {
      return NextResponse.json(
        { error: 'Member ID and store ID are required' },
        { status: 400 }
      );
    }

    // Verify user has permission to remove members
    await verifyTeamAccess(session.user.id, storeId);

    // Prevent removing owners
    const memberToDelete = await Team.findById(memberId);
    if (memberToDelete.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the store owner' },
        { status: 403 }
      );
    }

    await Team.findByIdAndDelete(memberId);

    return NextResponse.json(
      { message: 'Team member removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}