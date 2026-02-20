import mongoose, { model, PopulatedDoc, Schema, Types } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { IUser } from './User'

export enum BetType {
  B, // Betfair
  M, // Manual
}
export enum BetOn {
  FANCY = 'FANCY',
  MATCH_ODDS = 'MATCH_ODDS',
  CASINO = 'CASINO',
  CASINOFANCY = 'CASINOFANCY'
}

const getFloat = (value: any) => {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString())
  }
  return value
}
interface IBet {
  sportId: number
  userId: PopulatedDoc<IUser>
  userName: string
  parentStr?: Array<string>
  parentNameStr?: string
  ratioStr?: object
  matchId: number
  marketId: string
  selectionId: number
  selectionName: string
  matchName: string
  odds: number
  volume: number
  stack: number
  pnl: number
  commission?: number
  marketName: string
  isBack: boolean
  isMatched?: boolean
  matchedDate: Date
  matchedOdds: number
  matchedInfo: string
  betInfo?: object
  parentPnl?: object
  userIp: string
  isResult?: boolean
  isDelete?: boolean
  betClickTime?: Date
  status?: string
  bet_on: BetOn
  loss: number
  runners?: Array<0>
  profitLoss?: number
  gtype?: string
  C1?: string
  C2?: string
  C3?: string
  fancystatus?:string
}

interface IBetModel extends IBet, Document {}

const BetSchema = new Schema(
  {
    sportId: Number,
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, index: true },
    parentStr: [],
    parentNameStr: { type: String, index: true },
    ratioStr: Object,
    matchId: { type: Number, index: true },
    marketId: { type: String, index: true },
    selectionId: { type: Number, index: true },
    selectionName: String,
    matchName: String,
    odds: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    volume: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    stack: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    pnl: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    commission: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    marketName: String,
    isBack: Boolean,
    isMatched: Boolean,
    matchedDate: Date,
    matchedOdds: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    matchedInfo: String,
    betInfo: Object,
    parentPnl: Object,
    userIp: String,
    isResult: { type: Boolean, index: true },
    isDelete: { type: Boolean, index: true },
    betClickTime: Date,
    status: { type: String, default: 'pending', index: true },
    bet_on: { type: String, default: 'MATCH_ODDS', index: true },
    loss: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    profitLoss: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    gtype: String,
    C1: String,
    C2: String,
    C3: String,
    fancystatus: String
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  },
)
BetSchema.plugin(paginate)

const Bet = model<IBetModel, mongoose.PaginateModel<IBetModel>>('Bet', BetSchema)
export { IBet, Bet, getFloat, IBetModel }
