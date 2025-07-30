import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import User from "@/models/user";
import connectToDatabase from "./mongoose";

export async function generateResetToken(email: string) {
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = addHours(new Date(), 1);
    
    await connectToDatabase();
    await User.findOneAndUpdate(
        { email },
        { 
            resetToken,
            resetTokenExpires 
        }
    );
    
    return resetToken;
}

export async function validateResetToken(token: string) {
    await connectToDatabase()
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: new Date() }
    });
    
    if (!user) return null;
    
    return {
        email: user.email,
        userId: user._id
    };
}

export async function clearResetToken(userId: string) {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
        $unset: {
            resetToken: "",
            resetTokenExpires: ""
        }
    });
}