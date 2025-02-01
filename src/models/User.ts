import mongoose, { Schema, Document } from 'mongoose';

export interface UserInterface extends Document {
    name: string
    businessName: string
    rut: string
    businessRut: string
    email: string
    phone: string
    address: string
    password: string
    confirmed: boolean
    admin: boolean
}

const userSchema : Schema = new Schema({
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
    rut: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    businessRut: {
        type: String,
        required: true, 
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: false
    },
    confirmed: {    
        type: Boolean, 
        default: false
    }, 
    admin: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const User = mongoose.model<UserInterface>('User', userSchema)

export default User