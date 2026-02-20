import { model, PopulatedDoc, Schema, Types } from 'mongoose'
import { IBet } from './Bet'
import { IUser } from './User'

interface ISportType extends Document {
  betId: PopulatedDoc<IBet>
  userId: PopulatedDoc<IUser>
  winValue: number
  lossValue: number
  matchId: number
  marketId: string
  selectionId: Number
  parentStr: object
  ratioStr: object
  ratioArr: object
  teamType: number
  isMatched: boolean
  isDelete: boolean
}

const SportTypeSchema = new Schema(
  {
    betId: { type: Types.ObjectId, ref: 'Bet' },
    userId: { type: Types.ObjectId, ref: 'User' },
    winValue: Types.Decimal128,
    lossValue: Types.Decimal128,
    matchId: Number,
    marketId: String,
    selectionId: Number,
    parentStr: Object,
    ratioStr: Object,
    ratioArr: Array,
    teamType: Number,
    isMatched: Boolean,
    isDelete: Boolean,
  },
  {
    timestamps: true,
  },
)

const SportType = model<typeof SportTypeSchema>('SportType', SportTypeSchema)

export { ISportType, SportType }
