import mongoose, { Document } from 'mongoose'

export interface IFitbit extends Document {
    id?: string
    user_id: string
    access_token: string
    expires_in: string
    refresh_token: string
}

const fitbitSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: 'Acess Token required!'
    },
    access_token: {
        type: String,
        required: 'Acess Token required!',
        index: { unique: true }
    },
    expires_in: {
        type: String,
        required: 'ExpiresIn required!'
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
