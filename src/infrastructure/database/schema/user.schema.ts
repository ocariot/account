import Mongoose, { Schema } from 'mongoose'

interface IUserModel extends Mongoose.Document {
}

const userSchema = new Mongoose.Schema({
        username: {
            type: String,
            required: 'username required!'
        },
        password: {
            type: String,
            required: 'password required!'
        },
        type: { type: String },
        institution: {
            type: Schema.Types.ObjectId,
            ref: 'Institution'
        },
        gender: { type: String }, // User type Child
        age: { type: Number }, // User type Child
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }], // User type Family
        children_groups: [{
            type: Schema.Types.ObjectId,
            ref: 'ChildrenGroup'
        }], // User type Educator and HealthProfessional
        application_name: { type: String }, // User type Application
        scopes: [{ type: String }] // Scope that signal the types of access the user has.
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
export const UserRepoModel = Mongoose.model<IUserModel>('User', userSchema)
