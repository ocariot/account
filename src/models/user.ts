import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
    id?: string
    name: string
    user_name: string
    gender: string
    date_birth: number
    height: number
    created_at?: Date
    updated_at?: Date
    password: string
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name required!'
    },
    user_name: {
        type: String,
        required: 'Email required!',
        index: { unique: true }
    },
    gender: {
        type: String,
        required: 'Gender required!'
    },
    date_birth: {
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
