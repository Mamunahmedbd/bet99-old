import { model, Schema } from 'mongoose'

interface IBetStake extends Document {
  name: string
  value: number
}

const BetStakeSchema = new Schema(
  {
    name: String,
    value: Number,
  },
  {
    timestamps: true,
  },
)

const BetStake = model<typeof BetStakeSchema>('BetStake', BetStakeSchema)

export { IBetStake, BetStake }
