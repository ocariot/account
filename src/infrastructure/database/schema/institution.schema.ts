import Mongoose from 'mongoose'

interface IInstitutionModel extends Mongoose.Document {
}

const institutionSchema = new Mongoose.Schema({
        type: { type: String },
        name: { type: String },
        address: { type: String },
        latitude: { type: String },
        longitude: { type: String }
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
institutionSchema.index({ name: 1 }, { unique: true }) // define index at schema level
export const InstitutionRepoModel = Mongoose.model<IInstitutionModel>('Institution', institutionSchema)
