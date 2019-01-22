import Mongoose from 'mongoose'

interface IUserModel extends Mongoose.Document {
}

const userSchema = new Mongoose.Schema({},
    {
        timestamps: { createdAt: 'created_at', updatedAt: false }
    }
)
userSchema.index({ user: 1, start_time: 1 }, { unique: true }) // define index at schema level
export const UserRepoModel = Mongoose.model<IUserModel>('User', userSchema)
