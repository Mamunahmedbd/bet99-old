import { isMobile } from 'react-device-detect'
import api from '../utils/api'

class CasinoService {
  getCasinoList() {
    return api.get('get-casino-games')
  }
  getIntCasinoList(provider:any, type:any) {
    return api.get(`get-casino-int-games?provider=${provider}&type=${type}`)
  }

  getplaycasino(data:any) {
    return api.post(`get-cas-casino-play-url`, data)
  }

  getCasinoDataById(id: any) {
    return api.get(`get-casino-data-by-id/${id}`)
  }

  getLiveCasinoData(slug: any) {
    return api.get(`${process.env.REACT_APP_CASINO_SOCKET_URL}api/get-casino-market/${slug}`)
  }

  getResultByMid(type: string, mid: string) {
    return api.get(
      `html-cards/${type}/${mid}/?ismobile=${isMobile}`,
    )
  }

  getResultList(filterdata: { matchid: string; startDate: string; roundId: string }, page: number) {
    return api.get(
      `done-results/${filterdata.matchid}?filter_date=${filterdata.startDate}&roundId=${filterdata.roundId}&page=${page}`,
    )
  }

  disableCasino(matchId: string) {
    return api.get(`disable-casino-games?matchId=${matchId}`)
  }
}
export default new CasinoService()
