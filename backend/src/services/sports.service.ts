import { IMatch } from '../models/Match'
import { sportsApi } from '../util/api'

class SportsService {
  getSports() {
    return sportsApi.get('/get-sports')
  }

  getSeries(sportId: string) {
    return sportsApi.get(`/get-series?EventTypeID=${sportId}`)
  }

  getMatches(sportId: string, competitionId: string) {
    return sportsApi.get(`/get-matches?EventTypeID=${sportId}&CompetitionID=${competitionId}`)
  }

  getMarkets(match: IMatch) {
    return sportsApi.get(`/get-marketes?sportId=${match.sportId}&EventID=${match.matchId}`)
  }

  getBookmakerMarkets(match: IMatch) {
    return sportsApi.get(
      `/get-bookmaker-marketes?sportId=${match.sportId}&EventID=${match.matchId}`,
    )
  }

  getT10Markets(matchId: number) {
    return sportsApi.get(`/get-marketes-t10?EventID=${matchId}`)
  }

  getSession(matchId: number) {
    return sportsApi.get(`/get-sessions?MatchID=${matchId}`)
  }

  getSessionT10(matchId: number) {
    return sportsApi.get(`/get-sessions-t10?MatchID=${matchId}`)
  }
}
export default new SportsService()
