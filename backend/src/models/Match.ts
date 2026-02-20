import { model, Schema } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import cachegoose from 'recachegoose'
import mongoose from '../providers/Database'
import { IMarket, IMatchSetting } from './Market'

interface IMatch {
  matchId: number
  sportId: number
  seriesId: number
  matchDateTime: Date
  active?: boolean
  name: string
  countryCode?: string
  result_delare?: boolean
  result?: string
  inPlay?: boolean
  isBookMaker?: boolean
  isFancy?: boolean
  inPlayMinLimit?: number
  inPlayMaxLimit?: number
  inPlayFancyMinLimit?: number
  inPlayFancyMaxLimit?: number
  inPlayBookMinLimit?: number
  inPlayBookMaxLimit?: number
  offPlayMinLimit?: number
  offPlayMaxLimit?: number
  offPlayFancyMinLimit?: number
  offPlayFancyMaxLimit?: number
  offPlayBookMinLimit?: number
  offPlayBookMaxLimit?: number
}

interface IMatchModel extends IMatchSetting, Document {}

const MatchSchema = new Schema(
  {
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    seriesId: { type: Number, index: true },
    matchDateTime: Date,
    active: { type: Boolean, index: true },
    isDelete: { type: Boolean, index: true, default: false },
    name: String,
    countryCode: String,
    result_delare: { type: Boolean, index: true },
    result: String,
    inPlay: { type: Boolean, index: true, default: false },
    isBookMaker: Boolean,
    isFancy: Boolean,
    isT10: Boolean,
    inPlayMinLimit: Number,
    inPlayMaxLimit: Number,
    inPlayFancyMinLimit: Number,
    inPlayFancyMaxLimit: Number,
    inPlayBookMinLimit: Number,
    inPlayBookMaxLimit: Number,
    offPlayMinLimit: Number,
    offPlayMaxLimit: Number,
    offPlayFancyMinLimit: Number,
    offPlayFancyMaxLimit: Number,
    offPlayBookMinLimit: Number,
    offPlayBookMaxLimit: Number,
  },
  {
    timestamps: true,
  },
)

MatchSchema.pre('find', function () {
  // @ts-ignore
  if (!this._conditions.skipPreHook) {
    this.sort({ matchDateTime: 1 })
  }
  // @ts-ignore
  delete this._conditions.skipPreHook
})

MatchSchema.pre('findOneAndUpdate', async function () {
  // @ts-ignore
  const query = this.getQuery()
  if (query.matchId) {
    cachegoose.clearCache('Match-' + query.matchId, () => {})
  }
})

MatchSchema.pre('save', function () {
  // @ts-ignore
  if (this.matchId) cachegoose.clearCache('Match-' + this.matchId, () => {})
})

MatchSchema.plugin(paginate)

const Match = model<IMatchModel, mongoose.PaginateModel<IMatchModel>>('Match', MatchSchema)

export { IMatch, Match, IMatchModel }
