import { model, Schema } from 'mongoose'

interface IMarketSelection extends Document {
  sportId: number
  matchId: number
  marketId: string
  selectionId: number
  selectionName: number
  teamType: number
  meta_data: string
}

const MarketSelectionSchema = new Schema(
  {
    sportId: Number,
    matchId: Number,
    marketId: String,
    selectionId: Number,
    selectionName: Number,
    teamType: Number,
    meta_data: String,
  },
  {
    timestamps: true,
  },
)

const MarketSelection = model<typeof MarketSelectionSchema>(
  'MarketSelection',
  MarketSelectionSchema,
)

export { IMarketSelection, MarketSelection }
