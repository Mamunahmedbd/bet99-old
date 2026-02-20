import api from '../utils/api'
class MatchService {
  getActiveMatches(sportId: string, type: string, searchByMatch?: string, page?: number) {
    return api.get(
      `active-matches?sportId=${sportId}&type=${type}&page=${page}&search=${searchByMatch}`,
    )
  }
  changeStatusMatch(matchId: number | string) {
    return api.get(`change-status-match?matchId=${matchId}`)
  }

  deleteMatch(matchId: number | string) {
    return api.get(`delete-match?matchId=${matchId}`)
  }

  rollbackResultMarket(matchId: number | string) {
    return api.get(`rollback-result-market?matchId=${matchId}`)
  }

  getMatchListSuggestion(data: any) {
    return api.post(`get-match-list-suggestion`, data)
  }
}
export default new MatchService()
