import mongoose, { model, PopulatedDoc, Schema, Types } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { IUser } from './User'

interface ICasinoBet {
  userId: PopulatedDoc<IUser>
  userName: string
  parentStr?: Array<string>
  parentNameStr?: string
  ratioStr?: object
  round: string
  gameCode: string
  currency: string
  providerCode: string
  providerTransactionId: string
  status: string
  amount: number
  rolledBack: string
  gameId: string
  gameName: string
  description: string
  requestUuid: string
  transactionUuid: string
  marketId: string
  matchId: string
}

interface ICasinoBetModel extends ICasinoBet, Document {}
const getFloat = (value: any) => {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString())
  }
  return value
}
const CasinoBetSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, index: true },
    parentStr: [],
    parentNameStr: { type: String, index: true },
    ratioStr: Object,
    gameCode: { type: String, index: true },
    gameName: String,
    round: { type: String, index: true },
    currency: String,
    providerCode: String,
    providerTransactionId: String,
    status: String,
    rolledBack: String,
    marketId: String,
    amount: { type: Schema.Types.Decimal128, default: 0, get: getFloat },
    gameId: String,
    description: String,
    requestUuid: String,
    transactionUuid: String,
    matchId: String,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  },
)
CasinoBetSchema.plugin(paginate)

const CasinoBet = model<ICasinoBetModel, mongoose.PaginateModel<ICasinoBetModel>>(
  'CasinoBet',
  CasinoBetSchema,
)
export { ICasinoBet, CasinoBet, ICasinoBetModel }
