import { Types } from 'mongoose'
import { model, Schema } from 'mongoose'

interface IPayment extends Document {
  name: string
  value: string
}

const PaymentSchema = new Schema(
  {
    name: String,
    value: String,
    label: String,
    domain: String,
    active: Boolean,
    userId: { type: Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
)

const Payment = model<typeof PaymentSchema>('payment', PaymentSchema)

export { IPayment, Payment }
