import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongoose";
import Store from "@/models/store";

type Credentials = {
    email: string;
    password: string;
};

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            name: string;
            email: string;
            image: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}

export const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
            profile: async (profile: GoogleProfile): Promise<NextAuthUser | null> => {
                try {
                    await connectToDatabase();
                    let userRole = "buyer";

                    let user = await User.findOne({ email: profile?.email }).exec();

                    if (!user) {
                        user = await User.create({
                            name: profile?.name,
                            email: profile?.email,
                            googleId: profile?.sub,
                            avatar: profile?.picture,
                            isVerified: true,
                            role: userRole,
                            authMethod: "google",
                        });
                    } else {
                        const store = await Store.findOne({ userId: user._id })

                        if (store) {
                            userRole = "seller";
                        }
                    }

                    if (user.authMethod !== "google") {
                        return null;
                    }

                    return {
                        ...profile,
                        id: user._id.toString(),
                        role: user.role,
                        image: profile?.picture,
                    } as NextAuthUser;
                } catch (error) {
                    console.log(error)
                    return null;
                }
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your-email" },
                password: { label: "Password", type: "password", placeholder: "your-password" },
            },
            async authorize(credentials: Partial<Credentials> | undefined) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email or password");
                }

                try {
                    await connectToDatabase();

                    const user = await User.findOne({ email: credentials.email }).exec();

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
                }

            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                console.log("Session update triggered");
                token.role = session.user.role;
            }
            else if (user) {
                const customUser = user as { id: string; role: string };
                token.role = customUser.role;
                token.id = customUser.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
