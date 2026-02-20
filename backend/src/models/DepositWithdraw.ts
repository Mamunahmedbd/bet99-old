import { model, PopulatedDoc, Schema, Types } from 'mongoose'
import { IUser } from './User'

interface IDepositWithdraw {
  _id: string

  userId: PopulatedDoc<IUser>

  parentId: PopulatedDoc<IUser>

  parentStr?: Array<string>

  username?: string

  amount: number

  orderId: number

  status: 'pending' | 'approved' | 'rejected'

  type?: 'deposit' | 'withdraw'

  bankDetail?: object

  remark?: string
  imageUrl?: string
  accountType?: 'upi' | 'bank'
  utrno?:number
}

interface IDepositWithdrawModel extends Document, IDepositWithdraw {}

const DepositWithdrawSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    parentId: { type: Types.ObjectId, ref: 'User' },
    amount: Number,
    orderId: Number,
    status: { type: String, default: 'pending' },
    type: String,
    bankDetail: Object,
    remark: String,
    imageUrl: String,
    accountType: String,
    parentStr: [],
    username: String,
    utrno:Number
  },
  {
    timestamps: true,
    strict: true,
  },
)

const DepositWithdraw = model<typeof DepositWithdrawSchema>(
  'DepositWithdraw',
  DepositWithdrawSchema,
)

export { DepositWithdraw, IDepositWithdraw, IDepositWithdrawModel }
