import api from '../utils/api'
class MarketService {
  getActiveMarkets(matchId: number | string) {
    return api.get(`active-markets?matchId=${matchId}`)
  }

  changeStatusMarket(marketId: number | string, matchId: number | string) {
    return api.get(`change-status-markets?marketId=${marketId}&matchId=${matchId}`)
  }

  deleteMarket(marketId: number | string, matchId: number | string) {
    return api.get(`delete-market?marketId=${marketId}&matchId=${matchId}`)
  }
  marketResult(marketId: number | string, matchId: number, result: string) {
    return api.get(`result-market?marketId=${marketId}&matchId=${matchId}&selectionId=${result}`)
  }
  rollbackmarketResult(marketId: number | string, matchId: number) {
    return api.get(`rollback-result-market-wise?marketId=${marketId}&matchId=${matchId}`)
  }
}
export default new MarketService()
