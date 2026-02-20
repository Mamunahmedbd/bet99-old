import { model, Schema } from 'mongoose'

interface ICasinoMatch {
  status: number
  match_id?: number
  image: string
  title: string
  slug?: string
  id?: Number
  event_data?: Object
  isDisable?: boolean
  order?:number
}

interface ICasinoMatchModel extends ICasinoMatch, Document {}

const CasinoMatchSchema = new Schema<ICasinoMatch>(
  {
    status: Number,
    match_id: Number,
    image: String,
    title: String,
    slug: String,
    id: Number,
    event_data: Object,
    isDisable: Boolean,
    order:Number
  },
  {
    timestamps: true,
  },
)

const Casino = model<typeof CasinoMatchSchema>('Casinomatches', CasinoMatchSchema)

export { ICasinoMatch, Casino, ICasinoMatchModel }
