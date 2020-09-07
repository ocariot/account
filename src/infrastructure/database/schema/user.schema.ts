import Mongoose, { Schema } from 'mongoose'
import { Default } from '../../../utils/default'
import MongooseFieldEncryption from 'mongoose-field-encryption'

require('dotenv').config()

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
        age: { type: String }, // User type Child
        age_calc_date: { type: String }, // User type Child
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }], // User type Family
        children_groups: [{
            type: Schema.Types.ObjectId,
            ref: 'ChildrenGroup'
        }], // User type Educator and HealthProfessional
        application_name: { type: String }, // User type Application
        last_login: { type: Date },
        last_sync: { type: Date },
        fitbit_status: {
            type: String,
            readonly: true,
            default: 'none'
        },
        nfc_tag: { type: String }
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

const secretKey = process.env.ENCRYPT_SECRET_KEY || Default.ENCRYPT_SECRET_KEY
userSchema.plugin(MongooseFieldEncryption.fieldEncryption, { secret: secretKey, fields: ['username'] })

export const UserRepoModel = Mongoose.model<IUserModel>('User', userSchema)
