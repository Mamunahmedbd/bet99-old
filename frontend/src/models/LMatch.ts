import IMarket from './IMarket'

export default interface LMatch {
  _id?: string
  matchId: number
  sportId: string
  seriesId: string
  matchDateTime: string
  active?: boolean
  name: string
  __v: number
  createdAt?: Date
  updatedAt?: Date
  isFancy: boolean
  isBookMaker: boolean
  isT10: boolean
  markets?: IMarket[]
}
