import { model, Schema } from 'mongoose'

interface ISportSetting extends Document {
  sportId: number
  // minStake: number
  // maxStake: number
  // maxProfit: number
  // maxLoss: number
  // betDelay: number
  // preInnplayProfit: number
  // preInplayStake: number
  // volumeLimit: number
  // isUnmatchBet: number
  // updateUser: number
  // lockBet: number
  // minOdds: number
  // maxOdds: number
  // commission: number
  inPlayMinLimit: number
  inPlayMaxLimit: number
  inPlayFancyMinLimit: number
  inPlayFancyMaxLimit: number
  offPlayMinLimit: number
  offPlayMaxLimit: number
  offPlayFancyMinLimit: number
  offPlayFancyMaxLimit: number
}

const SportSettingSchema = new Schema(
  {
    sportId: Number,
    inPlayMinLimit: Number,
    inPlayMaxLimit: Number,
    inPlayFancyMinLimit: Number,
    inPlayFancyMaxLimit: Number,
    offPlayMinLimit: Number,
    offPlayMaxLimit: Number,
    offPlayFancyMinLimit: Number,
    offPlayFancyMaxLimit: Number,
    // minStake: Number,
    // maxStake: Number,
    // maxProfit: Number,
    // maxLoss: Number,
    // betDelay: Number,
    // preInnplayProfit: Number,
    // preInplayStake: Number,
    // volumeLimit: Number,
    // isUnmatchBet: Number,
    // updateUser: Number,
    // lockBet: Number,
    // minOdds: Number,
    // maxOdds: Number,
    // commission: Number,
  },
  {
    timestamps: true,
  },
)

const SportSetting = model<typeof SportSettingSchema>('SportSetting', SportSettingSchema)

export { ISportSetting, SportSetting }
