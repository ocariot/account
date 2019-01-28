import Mongoose, { Schema } from 'mongoose'

interface IUserModel extends Mongoose.Document {
}

const userSchema = new Mongoose.Schema({
        username: { type: String },
        password: { type: String },
        type: { type: String },
        institution: {
            type: Schema.Types.ObjectId,
            ref: 'Institution',
            autopopulate: true
        },
        gender: { type: String }, // User type Child
        age: { type: Number }, // User type Child
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            autopopulate: true
        }], // User type Family
        children_groups: [{
            type: Schema.Types.ObjectId,
            ref: 'ChildrenGroup'
        }], // User type Educator and HealthProfessional
        application_name: { type: String } // User type Application
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
                return ret
            }
        }
    }
)
userSchema.index({ username: 1 }, { unique: true }) // define index at schema level
userSchema.plugin(require('mongoose-autopopulate'))
export const UserRepoModel = Mongoose.model<IUserModel>('User', userSchema)
