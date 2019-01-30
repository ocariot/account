import Mongoose, { Schema } from 'mongoose'

interface IChildrenGroupModel extends Mongoose.Document {
}

const childrenGroupSchema = new Mongoose.Schema({
        name: { type: String },
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            autopopulate: true
        }],
        school_class: { type: String },
        user_id: { type: Schema.Types.ObjectId }
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
childrenGroupSchema.plugin(require('mongoose-autopopulate'))
export const ChildrenGroupRepoModel = Mongoose.model<IChildrenGroupModel>('ChildrenGroup', childrenGroupSchema)
