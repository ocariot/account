import mongoose, { Document } from 'mongoose'

export interface IFirebase extends Document {
    id?: string
    user_id: string
    fcm_token: string
}

const firebaseSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: 'Acess Token required!'
    },
    fcm_token: {
        type: String,
        required: 'Firebase Token required!',
        index: { unique: true }
    }
})

firebaseSchema.pre('save', (next) => {
    // this will run before saving 
    next()
});

export const Firebase = mongoose.model<IFirebase>('FireBase', firebaseSchema)
