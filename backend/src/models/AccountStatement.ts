import mongoose, { model, ObjectId, PopulatedDoc, Schema, Types, Model } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { IUser } from './User'
import { Double, TxnType } from './UserChip'
import { IBet } from './Bet'

export enum ChipsType {
  fc = 'fc', // Freechip
  pnl = 'pnl',
  stm = 'stm', // settlement
}

interface IAccoutStatement {
  userId: PopulatedDoc<IUser>
  type: ChipsType
  narration?: string
  txnType: TxnType
  amount: number
  openBal: number
  closeBal: number
  betId?: PopulatedDoc<IBet>
  matchId?: number
  selectionId?: number
  sportId?: number
  txnId?: any
  txnBy?: string
}

interface IAccoutStatementModel extends IAccoutStatement, Document {}

const AccoutStatementSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: ChipsType,
    },
    narration: String,
    txnType: {
      type: String,
      enum: TxnType,
    },
    amount: Number,
    openBal: Number,
    closeBal: Number,
    betId: { type: Types.ObjectId, index: true },
    matchId: { type: Number, index: true },
    selectionId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    txnId: { type: Types.ObjectId },
    txnBy: { type: String, index: true },
  },
  {
    toJSON: { getters: true }, //this right here
    timestamps: true,
  },
)

// AccoutStatementSchema.plugin(paginate)


const AccoutStatement: Model<IAccoutStatementModel> = model<IAccoutStatementModel>('AccoutStatement', AccoutStatementSchema)

// const AccountStatementNew = model<
//   IAccoutStatementModel,
//   mongoose.PaginateModel<IAccoutStatementModel>
// >('acNew', AccoutStatementSchema)

export { IAccoutStatement, AccoutStatement, IAccoutStatementModel }
