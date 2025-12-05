import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { UserInterface } from "./User";

export enum OrderStatus {
    Pending = "Pendiente",
    Sent = "En Transito", 
    Delivered = "Entregado", 
    Cancelled = "Cancelado"
}; 

interface OrderItem {
    sku: string; 
    name: string; 
    price: number; 
    quantity: number; 
    lineTotal: number; // lineTotal = price * quantity
}

// Document interface = what exists after saving in Mongo
// An interface that describes the properties that a Order Document has
export interface OrderInterface extends Document {
    //! Products
    items: OrderItem[];
    
    payment: string

    // DHL, FedEx or any courier provides a tracking number for the order
    trackingNumber: string
    shipper: string

    status: string
    country: string

    total: number

    // Using populate will get other user data
    // Either though businessRut & businessName is redundant here since we got the userId, 
    // it can serve a searching purpose when trying to find all registered orders by
    // a business, reducing the complexity of the query.
    businessName: string
    businessRut: string
    user: Types.ObjectId | UserInterface; 

    //TODO: General Business Data

    // Estimated delivery
    estimatedDelivery: Date; // Required for order creation
    deliveredAt: Date; // Not Required, can be set by the admin later

    // ordering date
    createdAt: Date; 
    updatedAt: Date; 
}

// Attributes interface = what you must provide to create a order
export interface OrderAttrs {
    items: OrderItem[]
    payment: string
    trackingNumber: string
    shipper: string 
    status?: OrderStatus
    country: string 
    total: number 

    businessName: string 
    businessRut: string
    user: Types.ObjectId | UserInterface

    estimatedDelivery: Date; 
    deliveredAt?: Date; 
}

// Model interface = adds a build method that uses OrderAttrs
// An interface that describes the properties that are required to create a new Order
export interface OrderModel extends Model<OrderInterface> {
    build(attrs: OrderAttrs): OrderInterface;
}

// Define the Order document Schema
const orderSchema : Schema = new Schema(
    {
        items: [{
            sku: {
                type: String,
                required: true,
                trim: true
            },
            name: {
                type: String,
                required: true,
                trim: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            lineTotal: {
                type: Number,
                required: true,
                min: 0
            }
        }], 
        payment: {
            type: String, 
            required: true, 
            trim: true
        },
        trackingNumber: {
            type: String, 
            required: true, 
            trim: true
        },
        shipper: {
            type: String, 
            required: true, 
            trim: true
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Pending,
            required: true, 
            trim: true
        }, 
        country: {
            type: String, 
            required: true, 
            trim: true
        }, 
        total: {
            type: Number, 
            required: true, 
            trim: true
        },
        businessName: {
            type: String, 
            required: true, 
            trim: true
        },
        businessRut: {
            type: String, 
            required: true, 
            trim: true
        },
        user: {
            type: Schema.Types.ObjectId, 
            required: true, 
            ref: "User"
        }, 
        estimatedDelivery: {
            type: Date, 
            required: true, 
        }, 
        deliveredAt: {
            type: Date, 
            required: false, 
            default: null
        }
    }, 
    {
        timestamps: true,
    }
);

// Add  custom static "build" method
orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

// Now when we call the Order constructor it already has typescript validation
const Order = mongoose.model<OrderInterface, OrderModel>('Order', orderSchema)

export default Order