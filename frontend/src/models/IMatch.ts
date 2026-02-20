import IMarket from './IMarket'

export default interface IMatch {
  _id?: string
  matchId: number
  sportId: string | number
  seriesId: string
  matchDateTime: string
  name: string
  active?: boolean
  isDelete?: boolean
  markets?: Array<IMarket>
  inPlayMinLimit?: number
  inPlayMaxLimit?: number
  inPlayFancyMinLimit?: number
  inPlayFancyMaxLimit?: number
  inPlayBookMinLimit?: number
  inPlayBookMaxLimit?: number
  offPlayMinLimit?: number
  offPlayMaxLimit?: number
  offPlayFancyMinLimit?: number
  offPlayFancyMaxLimit?: number
  offPlayBookMinLimit?: number
  offPlayBookMaxLimit?: number
  result?: string
  isT10?: boolean
  inPlay?: boolean
  event?: any
  series?: any
}
