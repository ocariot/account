import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
    id?: string
    name: string
    email: string
    gender: string
    dateOfBirth: number
    height: number
    created_at?: Date
    update_at?: Date
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name required!'
    },
    email: {
        type: String,
        required: 'Email required!',
    },
    gender: {
        type: String,
        required: 'Gender required!'
    },
    dateOfBirth: {
        type: Number,
        required: 'Date Of Birthday required!'
    },
    height: {
        type: Number,
        required: 'Height required!'
    },
    password: {
        type: Number,
        required: 'Password required!'
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
