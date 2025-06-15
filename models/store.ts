import mongoose, { Document } from "mongoose";


export interface IStore extends Document {
    userId: mongoose.Types.ObjectId;
    storeName: string;
    category: string[];
    banner: string;
    logo: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    openingHours: Object;
    paymentMethods: string[];
    about: string;
    social: {
        facebook: string;
        twitter: string;
        instagram: string;
        pinterest: string;
        youtube: string;
        linkedin: string;
        googleMaps: string;
        whatsapp: string;
        tiktok: string;
    };
    faq: {
        question: string;
        answer: string;
    }[];
    products: mongoose.Types.ObjectId[];
    productPage: mongoose.Types.ObjectId;
    videoId: mongoose.Types.ObjectId;
    storeUrl: string;
}


const StoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    storeName: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        required: true
    },
    banner: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    openingHours: {
        type: Object,
        required: true,
        properties: {
            monday: {
                type: Object,
                properties: {
                    open: {
                        type: String
                    },
                    close: {
                        type: String
                    },
                    closed: {
                        type: Boolean
                    }
                },
                required: true
            },
            tuesday: {
                type: Object,
                properties: {
                    open: { type: String },
                    close: { type: String },
                    closed: { type: Boolean }
                },
                required: true
            },
            wednesday: {
                type: Object,
                properties: {
                    open: { type: String },
                    close: { type: String },
                    closed: { type: Boolean }
                },
                required: true
            },
            thursday: {
                type: Object,
                properties: {
                    open: { type: String },
                    close: { type: String },
                    closed: { type: Boolean } },
                    required: true
                },
            friday: {
                type: Object,
                properties: {
                    open: { type: String },
                    close: { type: String },
                    closed: { type: Boolean }
                },
                required: true
            },
            saturday: {
                type: Object,
                properties: {
                    open: { type: String },
                    close: { type: String },
                    closed: { type: Boolean }
                },
                required: true
            },
            sunday: {
                type: Object,
                properties: {
                    open: { type: String },
                    close: { type: String },
                    closed: { type: Boolean }
                },
                required: true
            }
        }
    },
    paymentMethods: {
        type: [String],
    },
    about: {
        type: String,
        required: true
    },
    social: {
        facebook: {
            type: String
        },
        twitter: {
            type: String
        },
        instagram: {
            type: String
        },
        pinterest: {
            type: String
        },
        youtube: {
            type: String
        },
        linkedin: {
            type: String
        },
        googleMaps: {
            type: String
        },
        whatsapp: {
            type: String
        },
        tiktok: {
            type: String
        }
    },
    faq: {
        type: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true }
            }
        ],
        required: true
    },
    products: [{
        type: mongoose.Types.ObjectId,
        ref: "Product",
    }],
    productPage: {
        type: mongoose.Types.ObjectId,
        ref: "ProductPage",
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: "Video",
    },
    storeUrl: {
        type: String,
        required: true
    },
    customDomain: {
        type: String,
        default: null
    },
}, {
    timestamps: true
});


const Store = mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);

export default Store;
