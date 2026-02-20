import api, { sportsApi } from '../utils/api'
class SportsService {
  getSports() {
    return api.get('/get-sport-list')
  }

  getSeries(sportId: string) {
    return sportsApi.get(`/get-series?EventTypeID=${sportId}`)
  }

  getMatches(sportId: string, competitionId: string) {
    return sportsApi.get(`/get-matches?EventTypeID=${sportId}&CompetitionID=${competitionId}`)
  }

  saveMatch(data: any, syncData = false) {
    return api.post('/save-match', { data, syncData })
  }

  getMatchList(sportId = '', status = 'all', limit = '') {
    return api.get(`/get-match-list?sportId=${sportId}&status=${status}&limit=${limit}`)
  }

  getMatchById(matchId: string) {
    return api.get(`/get-match-by-id?matchId=${matchId}`)
  }

  getMarketList(matchId: string) {
    return api.get(`/get-market-list?matchId=${matchId}`)
  }

  getFancyList(matchId: string, fancyType = 'session') {
    return api.get(`/get-fancy-list?matchId=${matchId}&gtype=${fancyType}`)
  }

  getSeriesWithMarket(EventTypeID: string | number) {
    return api.get(`get-series-with-market?EventTypeID=${EventTypeID}`)
  }

  getSeriesWithMatch(EventTypeID: string | number) {
    return api.get(`get-series-with-market-with-date?EventTypeID=${EventTypeID}`)
  }

  getScore(matchId: number) {
    return sportsApi.get(`/score?MatchID=${matchId}`)
  }

  saveSportSettings(data: any) {
    return api.post(`/save-sport-settings`, data)
  }

  fancyData(matchId: number) {
    return sportsApi.get(
      `${process.env.REACT_APP_API_SPORTS_FANCY_URL}fancy-data?MatchID=${matchId}`,
    )
  }
}
export default new SportsService()
