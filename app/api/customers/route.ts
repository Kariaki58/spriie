import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import Customer from "@/models/customer";
import Store from "@/models/store";


export async function GET() {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await Store.findOne({ userId: session.user.id })

  try {
    const customers = await Customer.find({ storeId: store._id })
      .sort({ lastPurchase: -1 })
      .lean();
    
    console.log(customers)

    const formattedCustomers = customers.map((customer) => ({
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      avatar: customer.avatar,
      orders: customer.totalOrders,
      productsBought: customer.totalProducts,
      totalSpent: customer.totalSpent,
      lastPurchase: customer.lastPurchase?.toISOString(),
    }));

    return NextResponse.json({ customers: formattedCustomers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}