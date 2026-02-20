import { model, Schema } from 'mongoose'

interface ISetting extends Document {
  name: string
  value: string
}

const SettingSchema = new Schema(
  {
    name: String,
    value: String,
    active: Boolean,
  },
  {
    timestamps: true,
  },
)

const Setting = model<typeof SettingSchema>('Setting', SettingSchema)

export { ISetting, Setting }
