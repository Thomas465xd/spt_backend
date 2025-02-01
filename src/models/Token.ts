import mongoose, { Schema, Document, Types } from 'mongoose';

interface TokenInterface extends Document {
    userId: Types.ObjectId
    token: string
    createdAt: Date
}

const tokenSchema : Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "7d"
    }
})

const Token = mongoose.model<TokenInterface>("Token", tokenSchema);

export default Token;