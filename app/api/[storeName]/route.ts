import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/product";
import Store from "@/models/store";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongoose";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";


interface IStoreName {
    params: {
        storeName: string
    }
}

function isValidURL(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}


export async function GET(request: Request,
  { params }: { params: { storeName: string } }) {
    try {
        console.log("line 31")
        await connectToDatabase();

        const dataset = await params;

        const subdomain = `${dataset.storeName}.${process.env.NEXT_PUBLIC_DOMAIN_NAME}`

        console.log({subdomain})

        const store = await Store.findOne({ storeUrl: subdomain }).populate("products").exec()

        console.log({store})


        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        const products = await Product.find({ _id: { $in: store.products } }).exec();


        store.products = products;

        console.log("*******************************")
        console.log({ store });
        console.log("*******************************")


        return NextResponse.json(store, { status: 200 });
    } catch (error: any){
        console.error(error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
    // return NextResponse.json({ message: "Hello world!"}, { status: 200 })
}

export async function POST(req: NextRequest, { params }: IStoreName) {
    try {
        const session = await getServerSession(options); // Get the session
        const body = await req.json();
        const { uid } = body; // Get the user ID from the request body
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }
        const userId = session?.user?.id || uid;

        await connectToDatabase()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { storeName } = await params;

        if (!storeName) {
            return NextResponse.json({ error: "Missing store name" }, { status: 400 });
        }

        const {
            category,
            banner,
            logo,
            description,
            address,
            phone,
            email,
            openingHours,
            about,
            social,
            faq
        } = body;

        if (!category || !banner || !logo || !description || !address || !phone || !email || !openingHours || !about || !social || !faq) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (!Array.isArray(category) || !Array.isArray(faq)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }
        if (!isValidURL(banner) || !isValidURL(logo)) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }
        if (typeof description !== "string" || typeof address !== "string" || typeof phone !== "string" || typeof email !== "string" || typeof about !== "string") {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }
        if (typeof openingHours !== "object" || typeof social !== "object") {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }
        if (Object.keys(openingHours).length !== 7) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const formattedStoreName = storeName.toLowerCase().replace(/\s+/g, "-");
        const subdomain = `${formattedStoreName}.${process.env.NEXT_PUBLIC_API_URL}`;
        const existingStore = await Store.findOne({ 
            $or: [{ storeUrl: subdomain }, { userId: uid }] 
        });

        if (existingStore) {
            return NextResponse.json({ error: "Bad Request, store name has been talking or you already have a store" }, { status: 400 });
        }

        const store = new Store({
            userId: new ObjectId(userId),
            storeName,
            category,
            banner,
            logo,
            description,
            address,
            phone,
            email,
            openingHours,
            about,
            social,
            faq,
            storeUrl: subdomain
        });
        await store.save();

        return NextResponse.json({ message: "Success"}, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();
        const { storeId, customDomain } = await req.json();

        if (!storeId || !customDomain) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

        if (!domainRegex.test(customDomain)) {
            return NextResponse.json({ message: "Invalid domain format" }, { status: 400 });
        }
        const existingDomain = await Store.findOne({ customDomain });

        if (existingDomain) {
            return NextResponse.json({ message: "Domain already in use" }, { status: 400 });
        }

        const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            { customDomain },
            { new: true }
        );
        return NextResponse.json({ message: "Success", updatedStore }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}