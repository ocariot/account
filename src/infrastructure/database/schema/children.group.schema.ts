import Mongoose, { Schema } from 'mongoose'

interface IChildrenGroupModel extends Mongoose.Document {
}

const childrenGroupSchema = new Mongoose.Schema({
        name: { type: String },
        children: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        school_class: { type: String }
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
childrenGroupSchema.index({ name: 1, children: 1 }, { unique: true }) // define index at schema level
export const ChildrenGroupRepoModel = Mongoose.model<IChildrenGroupModel>('User', childrenGroupSchema)
