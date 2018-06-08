import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
    id?: string
    name: string
    age?: number
    created_at?: Date
    update_at?: Date
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name required!',
        index: { unique: true }
    },
    age: {
        type: Number
    }
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
)

userSchema.pre('save', (next) => {
    // this will run before saving 
    next()
});

export const User = mongoose.model<IUser>('User', userSchema)
