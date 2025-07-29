import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { options } from "../auth/options";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required")
});

const contactSchema = z.object({
  email: z.string().email("Invalid email format"),
  phone: z.string().min(6, "Phone number too short")
});

const colorSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid primary color format"),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid secondary color format"),
  accent: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid accent color format")
});

const openingDaySchema = z.object({
  day: z.string(),
  open: z.boolean(),
  openingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  closingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
});

const socialMediaSchema = z.object({
  maps: z.string().optional(),
  facebook: z.string().url("Invalid Facebook URL").optional(),
  instagram: z.string().url("Invalid Instagram URL").optional(),
  twitter: z.string().url("Invalid Twitter URL").optional()
});

const faqSchema = z.object({
  question: z.string().min(5, "Question too short"),
  answer: z.string().min(10, "Answer too short")
});

const storeSchema = z.object({
  storeName: z.string().min(3, "Store name too short").max(50, "Store name too long"),
  description: z.string().min(20, "Description too short").max(1000, "Description too long"),
  logo: z.string().url("Invalid logo URL"),
  banner: z.string().url("Invalid banner URL"),
  categories: z.array(z.string().min(1)).min(1, "At least one category required"),
  address: addressSchema,
  contact: contactSchema,
  colors: colorSchema, // Added to store schema
  openingHours: z.array(openingDaySchema).length(7, "Need all 7 days"),
  paymentMethods: z.array(z.string()).optional(),
  about: z.string().min(20).optional(),
  socialMedia: socialMediaSchema.optional(),
  faqs: z.array(faqSchema).optional()
});

export async function GET(req: NextRequest) {
    return NextResponse.json({
        message: "this is your store"
    }, { status: 200 })
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(options);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized: Please log in" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const userId = session.user?.id;
        console.log(userId)
        console.log(session)
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({
                error: "Invalid user"
            }, { status: 404 })
        }

        const userStore = await Store.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (userStore) {
            return NextResponse.json(
                { error: "You can only have one store per account" },
                { status: 400 }
            );
        }

        const body = await req.json();

        // Validate input data
        const validationResult = storeSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: "Validation failed",
                    details: validationResult.error.flatten()
                },
                { status: 400 }
            );
        }

        // Check for unique store name
        const existingStore = await Store.findOne({ 
            storeName: { $regex: new RegExp(`^${body.storeName}$`, 'i') }
        });
        
        if (existingStore) {
            return NextResponse.json(
                { error: "Store name already exists" },
                { status: 409 }
            );
        }

        // Transform opening hours
        const openingHours = {
            monday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Monday')),
            tuesday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Tuesday')),
            wednesday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Wednesday')),
            thursday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Thursday')),
            friday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Friday')),
            saturday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Saturday')),
            sunday: formatOpeningHour(body.openingHours.find((day: any) => day.day === 'Sunday'))
        };

        // Create store document with colors included
        const storeData = {
            userId: new mongoose.Types.ObjectId(userId),
            storeName: body.storeName,
            category: body.categories,
            banner: body.banner,
            logo: body.logo,
            description: body.description,
            address: `${body.address.street}, ${body.address.city}, ${body.address.state}, ${body.address.country}`,
            phone: body.contact.phone,
            email: body.contact.email,
            colors: { // Added colors object
                primary: body.colors.primary,
                secondary: body.colors.secondary,
                accent: body.colors.accent
            },
            openingHours,
            paymentMethods: body.paymentMethods || [],
            about: body.about || body.description,
            social: {
                facebook: body.socialMedia?.facebook || '',
                twitter: body.socialMedia?.twitter || '',
                instagram: body.socialMedia?.instagram || '',
                googleMaps: body.socialMedia?.maps || ''
            },
            faq: body.faqs?.map((faq: any) => ({
                question: faq.question,
                answer: faq.answer
            })) || [],
            storeUrl: generateUniqueStoreUrl(body.storeName)
        };

        // Save to database
        const newStore = await Store.create(storeData);

        // Update user role to seller
        user.role = "seller";
        await user.save();

        const updatedToken = {
            ...session, 
            user: {
                ...session.user,
                role: "seller", // Update the role
                // Add any additional store-related info you want in the session
                storeId: newStore._id.toString(),
                storeName: newStore.storeName
            }
        };

        return NextResponse.json(
            { 
                message: "Store created successfully",
                store: {
                    id: newStore._id,
                    name: newStore.storeName,
                    url: newStore.storeUrl,
                    colors: newStore.colors // Include colors in response
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Store creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function formatOpeningHour(dayData: any) {
  if (!dayData || !dayData.open) {
    return { closed: true };
  }
  
  return {
    open: dayData.openingTime,
    close: dayData.closingTime,
    closed: false
  };
}

function generateUniqueStoreUrl(storeName: string) {
  const subdomain = storeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

  return `${subdomain}.${process.env.NEXT_PUBLIC_DOMAIN_NAME}`;
}