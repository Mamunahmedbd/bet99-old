import api, { fancyApi } from '../utils/api'
import IBet from '../models/IBet'

class BetService {
  getPlaceBet(betData: IBet) {
    return fancyApi.post('placebet', betData)
  }
  getBets(matchId: number) {
    return fancyApi.get(`bets?matchId=${matchId}`)
  }
  getMarketAnalysis() {
    return api.get(`get-market-analysis`)
  }
  getBetListByIds(betIds: Array<string>, page: number) {
    return api.post(`get-bet-list-by-ids`, { betIds, page })
  }
  deleteCurrentBet(id: string) {
    return api.delete(`delete-current-bet/${id}`)
  }
  betLock(data: any) {
    return api.post(`bet-lock`, data)
  }
  getChildUserList(matchId: number, username?: string) {
    return api.get(`get-child-user-list?username=${username}&matchId=${matchId}`)
  }
  deleteBets(data: { ids: Array<string> }) {
    return api.post(`delete-bets`, data)
  }

  usersLockClientList(data: { ids: Array<string>; lock: boolean; type: string }) {
    return api.post(`users-lock`, data)
  }
}
export default new BetService()
