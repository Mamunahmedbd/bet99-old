import { model, Schema } from 'mongoose'

interface ISportType extends Document {
  sportId: number
  matchId: number
  matchName: string
  marketId: string
  marketName: string
  selectionId: number
  result: string
  isFancy: boolean
  blockMarketDel: boolean
}

const SportTypeSchema = new Schema(
  {
    sportId: Number,
    matchId: Number,
    matchName: String,
    marketId: String,
    marketName: String,
    selectionId: Number,
    result: String,
    isFancy: Boolean,
    blockMarketDel: Boolean,
  },
  {
    timestamps: true,
  },
)

const SportType = model<typeof SportTypeSchema>('SportType', SportTypeSchema)

export { ISportType, SportType }
