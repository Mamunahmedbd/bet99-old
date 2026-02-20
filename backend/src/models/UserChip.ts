import { any } from 'bluebird'
import { model, PopulatedDoc, Schema, Types } from 'mongoose'
import { IUser } from './User'

export enum TxnType {
  cr = 'cr',
  dr = 'dr',
}

export const Double: Object = {
  type: Number,
  get: (v: number) => v / 100,
  set: (v: any) => v * 100,
}

interface IUserChip extends Document {
  userId: PopulatedDoc<IUser>
  name: string
  assignId: Types.ObjectId // parent user
  txnId: string // generate uuid
  txnType: TxnType
  amount: number
  narration: string
}

const UserChipSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    assignId: Types.ObjectId,
    name: String,
    txnId: String,
    txnType: {
      type: String,
      enum: TxnType,
    },
    amount: Double,
    narration: String,
  },
  {
    toJSON: { getters: true }, //this right here
    timestamps: true,
  },
)

const UserChip = model<typeof UserChipSchema>('UserChip', UserChipSchema)

export { IUserChip, UserChip }
