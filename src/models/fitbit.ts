import mongoose, { Document } from 'mongoose'

export interface IFitbit extends Document {
    id?: string
    user_id: string
    acess_token: string
    expiresIn: string
    refresh_token: string
}

const fitbitSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: 'Acess Token required!'
    },
    acess_token: {
        type: String,
        required: 'Acess Token required!',
        index: { unique: true }
    },
    expiresIn: {
        type: String,
        required: 'ExpiresIn required!',
        index: { unique: true }
    },
    refresh_token: {
        type: String,
        required: 'Refresh Token required!',
        index: { unique: true }
    }
})

fitbitSchema.pre('save', (next) => {
    // this will run before saving 
    next()
});

export const Fitbit = mongoose.model<IFitbit>('Fitbit', fitbitSchema)
