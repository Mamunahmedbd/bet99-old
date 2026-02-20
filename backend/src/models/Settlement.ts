import { model, Schema, PopulatedDoc, Types } from 'mongoose'
import { IUser } from './User'
import { Double, TxnType } from './UserChip'

interface ISettlement extends Document {
  userId: PopulatedDoc<IUser>
  oppId: PopulatedDoc<IUser>
  settleId: number
  txnType: TxnType
  amount: number
  narration: string
  loginId: PopulatedDoc<IUser>
  remark: string
}

const SettlementSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    oppId: { type: Types.ObjectId, ref: 'User' },
    settleId: Number,
    txnType: {
      type: String,
      enum: TxnType,
    },
    amount: Double,
    narration: String,
    loginId: { type: Types.ObjectId, ref: 'User' },
    remark: String,
  },
  {
    toJSON: { getters: true }, //this right here
    timestamps: true,
  },
)

const Settlement = model<typeof SettlementSchema>('Settlement', SettlementSchema)

export { ISettlement, Settlement }
