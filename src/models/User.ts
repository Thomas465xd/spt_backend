import mongoose, { Schema, Document, Model } from 'mongoose';
import { formatChileanRUT, formatColombianNIT, formatPeruvianRUC, hashPassword } from '../utils';
import { Countries, Identifications } from '../types';

export { Countries, Identifications };

const userRegion = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Coquimbo",
    "Valparaíso",
    "Metropolitana de Santiago",
    "O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
    "La Araucanía",
    "Los Ríos",
    "Los Lagos",
    "Aysén",
    "Magallanes"
] as const;

// Countries and Identifications enums are now in ../types to avoid circular dependencies

export interface UserInterface extends Document {
    // Base user info
    name: string
    businessName: string

    //* Identification type will define 
    idType: Identifications
    personalId: string
    businessId: string

    email: string
    phone: string
    password: string

    // User Unique Attributes
    discount: number // Number between 0 and 100

    // User Status
    confirmed: boolean
    passwordSet: boolean
    admin: boolean

    // Address Info
    address: string
    country: Countries

    region: string
    city: string
    province: string
    reference: string
    postalCode: string
}

// Attributes interface = what you must provide to create a user
export interface UserAttrs {
    name: string
    businessName: string 

    idType: Identifications
    personalId: string 
    businessId: string 

    email: string 
    phone?: string 

    country: Countries
    address: string
}

// Model interface = adds a build method that uses UserAttrs
// An interface that describes the properties that are required to create a new user. 
export interface UserModel extends Model<UserInterface> {
    build(attrs: UserAttrs) : UserInterface
}

const userSchema = new Schema<UserInterface, UserModel>({
    //^ User base data
    name: {
        type: String,
        required: true,
        trim: true
    },
    businessName: {
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },

    //^ User identification
    idType: {
        type: String,
        enum: Object.values(Identifications), 
        required: true, 
        trim: true, 
    },
    personalId: {
        type: String,
        required: true,
        trim: true,
    },
    businessId: {
        type: String,
        required: true, 
        trim: true
    },

    //^ User Status
    password: {
        type: String,
        required: false
    },
    confirmed: {    
        type: Boolean, 
        default: false
    }, 
    passwordSet: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },

    //^ User Unique Attributes
    discount: {
        type: Number, 
        required: true, 
        default: 20, 
        min: 0, 
        max: 100
    },

    //^ Address
    address: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        enum: Object.values(Countries),
        required: true,
        trim: true
    },

    region: {
        type: String,
        required: false,
        trim: true,
        enum: userRegion
    },
    city: {
        type: String,
        required: false,
        trim: true
    },
    province: {
        type: String,
        required: false,
        trim: true
    }, 
    reference: {
        type: String,
        required: false,
        trim: true
    },
    postalCode: {
        type: String,
        required: false,
        trim: true, 
        length: 7
    },
}, {timestamps: true})

//~ Indexes
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ personalId: 1 }, { unique: true })
userSchema.index({ confirmed: 1, createdAt: -1 })

// Pre-save middleware to format attributes before saving 
userSchema.pre("save", function(next) {
    // "this" refers to the document being saved

    //? Format ID to selected country format before saving depending on idType
    if(this.isModified("personalId")) {
        //? Depending on the idType, perform different formattings
        switch (this.idType) {
            case Identifications.Chile : {
                this.personalId = formatChileanRUT(this.personalId); 
                break;
            }

            case Identifications.Colombia : {
                this.personalId = formatColombianNIT(this.personalId); 
                break;
            }

            case Identifications.Peru : {
                this.personalId = formatPeruvianRUC(this.personalId); 
                break;
            }
        }
    }

    //? Format business ID to selected country format before saving depending on idType
    if(this.isModified("businessId")) {
        //? Depending on the idType, perform different formattings
        switch (this.idType) {
            case Identifications.Chile : {
                this.businessId = formatChileanRUT(this.businessId); 
                break;
            }

            case Identifications.Colombia : {
                this.businessId = formatColombianNIT(this.businessId); 
                break;
            }

            case Identifications.Peru : {
                this.businessId = formatPeruvianRUC(this.businessId); 
                break;
            }
        }
    }

    // Continue with other methods...
    next(); 
}); 

// Hashing Passwords by using the .pre middleware function implemented in mongoose
// Any time an attempt to save a document to the db is made, the following code will execute
userSchema.pre("save", async function(next) {
    // If user has not yet setted his password, then don't hash
    if (!this.isModified("password")) {
        return next();
    }

    const password = this.get("password");

    // CRITICAL GUARD
    if (!password) {
        // allow null / undefined passwords = for not confirmed and
        // confirmed users without password set.
        return next();
    }

    const hashed = await hashPassword(password);
    this.set("password", hashed);

    next();
})

// Add  custom static "build" method
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User = mongoose.model<UserInterface, UserModel>('User', userSchema)

export default User