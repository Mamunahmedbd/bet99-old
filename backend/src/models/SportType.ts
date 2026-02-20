import { model, Schema } from 'mongoose'

interface ISportType extends Document {
  name: string
}

const SportTypeSchema = new Schema(
  {
    name: String,
  },
  {
    timestamps: true,
  },
)

const SportType = model<typeof SportTypeSchema>('SportType', SportTypeSchema)

export { ISportType, SportType }
