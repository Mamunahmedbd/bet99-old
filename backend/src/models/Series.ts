import { model, Schema } from 'mongoose'

interface ISeries {
  seriesId: number
  sportId: number
  seriesName: string
  region?: string
  marketCount?: number
  isActive?: boolean
}

interface ISeriesModel extends Document {}

const SeriesSchema = new Schema(
  {
    seriesId: Number,
    sportId: Number,
    seriesName: String,
    region: String,
    marketCount: Number,
    isActive: Boolean,
  },
  {
    timestamps: true,
  },
)

const Series = model<typeof SeriesSchema>('Series', SeriesSchema)

export { ISeries, Series, ISeriesModel }
