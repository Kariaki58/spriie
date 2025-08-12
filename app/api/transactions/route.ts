import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/options";
import Transaction from "@/models/transaction";
import connectToDatabase from "@/lib/mongoose";


export async function GET(request: Request) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get current session
    const session = await getServerSession(options);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this data." },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate sort parameters
    const allowedSortFields = ['createdAt', 'amount', 'type', 'status'];
    const allowedSortOrders = ['asc', 'desc'];
    
    if (!allowedSortFields.includes(sortField)) {
      return NextResponse.json(
        { error: "Invalid sort field" },
        { status: 400 }
      );
    }

    if (!allowedSortOrders.includes(sortOrder)) {
      return NextResponse.json(
        { error: "Invalid sort order" },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {
      $or: [
        { fromUserId: session.user.id },
        { toUserId: session.user.id }
      ]
    };

    // Add filters if provided
    if (type) query.type = type;
    if (status) query.status = status;

    // Create sort object
    const sort: any = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Get paginated and sorted transactions
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      },
      sort: {
        field: sortField,
        order: sortOrder
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}