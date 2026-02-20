export enum IBetType {
  Match = 'match',
  UnMatch = 'unmatch',
}

export enum IBetOn {
  FANCY = 'FANCY',
  MATCH_ODDS = 'MATCH_ODDS',
  CASINO = 'CASINO',
  CASINOFANCY = 'CASINOFANCY',
}
export default interface IBet {
  _id?: string
  userId?: string
  matchId: number
  marketId: string
  selectionId: number
  selectionName: string
  odds: number
  volume: number
  stack: number
  pnl: number
  profitLoss?: number
  marketName: string
  isBack: boolean
  eventId: number
  type: IBetType
  currentMarketOdds: number
  exposure: number
  ipAddress: string
  userIp?: string
  matchName: string
  createdAt?: string
  betOn: IBetOn
  betClickTime?: string
  userName?: string
  parentStr?: string
  parentNameStr?: string
  gtype?: string
  selected?: boolean
  sportId?: number
  C1?: string
  C2?: string
  C3?: string
  fancystatus?: string
  status?: string
  user_id?: string
  oppsiteVol?: number
  oddsType?: string
}
