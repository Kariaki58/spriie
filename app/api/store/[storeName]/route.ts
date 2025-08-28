import { NextResponse, NextRequest } from "next/server";
import Product from "@/models/product";
import Store from "@/models/store";
import connectToDatabase from "@/lib/mongoose";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  category: string;
  inStock: boolean;
}


export async function GET(req: NextRequest, { params }: { params: { storeName: string } }) {
    try {
        await connectToDatabase();
        const { storeName } = await params;
        console.log({ storeName })
        const subdomain = `${storeName.toLocaleLowerCase()}.${process.env.NEXT_PUBLIC_DOMAIN}`;
        console.log(subdomain)
        const store = await Store.findOne({ storeUrl: subdomain })

        console.log({store})

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        const products = await Product.find({ _id: { $in: store.products } }).exec();
        // const productUpdate: Product[] = [];
        console.log("products in store")
        console.log(products)
        console.log("end of product in store")


        store.products = products;

        return NextResponse.json(store, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}