import mongoose, { model, Schema } from 'mongoose'
import paginate from 'mongoose-paginate-v2'

interface ICasinoGameResult {
  mid: string
  gameType: string
  data: any
}

interface ICasinoGameResultModel extends ICasinoGameResult, Document { }

const CasinoGameResultSchema = new Schema(
  {
    mid: String,
    gameType: String,
    data: Object,
  },
  {
    timestamps: true,
  },
)

CasinoGameResultSchema.plugin(paginate)

const CasinoGameResult = model<ICasinoGameResultModel, mongoose.PaginateModel<ICasinoGameResultModel>>('CasinoGameResult', CasinoGameResultSchema)


export { ICasinoGameResult, CasinoGameResult, ICasinoGameResultModel }
