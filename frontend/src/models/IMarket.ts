export enum OddsType {
  B = 'berFair', // Betfair
  BM = 'bookMaker',
  F = 'Fancy',
}
export default interface IMarket {
  _id?: string
  isActive: boolean
  isDelete: boolean
  marketId: string
  marketName: string
  marketStartTime?: Date
  matchId: number
  oddsType: OddsType
  seriesId: string
  sportId: number
  __v: number
  createdAt?: Date
  runners: any
  updatedAt?: Date
  rem?: string
  resultDelcare?: string
}
