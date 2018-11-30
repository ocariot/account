import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
    id?: string
    user_name: string
    password: string
    school: object
    created_at?: Date
}

const userSchema = new mongoose.Schema({
    id: { type: String },
    user_name: {
        type: String,
        required: 'User name required!',
        index: { unique: true }
    },
    password: {
        type: String,
        required: 'Password is required!'
    },
    school: {
        name: {
            type: String,
            required: 'Name of school is required!'
        },
        country: {
            type: String,
            required: 'Country code of school is required!'
        },
        city: {
            type: String,
            required: 'City of school is required!'
        },
        address: {
            type: String,
            required: 'Address of school is required!'
        }
    }
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
                delete ret.updatedAt
                delete ret.password
                return ret
            }
        }
    }
)

export const User = mongoose.model<IUser>('User', userSchema)
