import { model, Schema } from 'mongoose'
import { IMatchSetting } from './Market'

interface IMatchGeneralSetting extends IMatchSetting, Document {
  sportName: string
}

const MatchGeneralSettingSchema = new Schema(
  {
    sportName: String,
  },
  {
    timestamps: true,
  },
)

const MatchGeneralSetting = model<typeof MatchGeneralSettingSchema>(
  'MatchGeneralSetting',
  MatchGeneralSettingSchema,
)

export { IMatchGeneralSetting, MatchGeneralSetting }
