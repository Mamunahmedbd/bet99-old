import IBet from './IBet'
import User from './User'
export enum ChipsType {
  fc = 'fc', // Freechip
  pnl = 'pnl',
  stm = 'stm', // settlement
}

export enum TxnType {
  cr = 'cr',
  dr = 'dr',
}

export interface AccoutStatement {
  userId: User
  type: ChipsType
  narration?: string
  txnType: TxnType
  amount: number
  openBal: number
  closeBal: number
  betId?: string
  matchId?: number
  selectionId?: number
  allBets?: Array<any>
}
