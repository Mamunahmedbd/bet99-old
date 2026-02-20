import { model, PopulatedDoc, Schema, Types } from 'mongoose'
import { IUser } from './User'

interface IProfitLoss extends Document {
  userId: PopulatedDoc<IUser>
  matchId: number
  marketId: string
  sportId: number
  resultId: number
  matchName: string
  marketName: string
  winner: string
  type: number
  parentStr: string
  userPnl: number
  commission: number
  result: string
}

const ProfitLossSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    matchId: Number,
    marketId: String,
    sportId: Number,
    resultId: Number,
    matchName: String,
    marketName: String,
    winner: String,
    type: Number,
    parentStr: String,
    userPnl: Number,
    commission: Number,
    result: String,
  },
  {
    timestamps: true,
  },
)

const ProfitLoss = model<typeof ProfitLossSchema>('ProfitLoss', ProfitLossSchema)

export { IProfitLoss, ProfitLoss }
