import { model, PopulatedDoc, Schema } from 'mongoose'
import { IUser } from './User'
import { Types } from 'mongoose'

interface IUpi {
  _id: string

  upiId: string

  userId: PopulatedDoc<IUser>
}

interface IUpiModel extends Document {}

const UpiSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    upiId: String,
  },
  {
    timestamps: true,
  },
)

const Upi = model<typeof UpiSchema>('Upi', UpiSchema)

export { IUpi, IUpiModel, Upi }
