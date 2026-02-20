import { model, PopulatedDoc, Schema } from 'mongoose'
import { IUser } from './User'
import { Types } from 'mongoose'

interface IBankAccount {
  _id: string

  accountHolderName: string

  accountNumber: string

  ifscCode: string

  userId: PopulatedDoc<IUser>
}

interface IBankAccountModel extends Document {}

const BankAccountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    accountHolderName: String,
    ifscCode: String,
    accountNumber: Number,
  },
  {
    timestamps: true,
  },
)

const BankAccount = model<typeof BankAccountSchema>('BankAccount', BankAccountSchema)

export { IBankAccount, IBankAccountModel, BankAccount }
