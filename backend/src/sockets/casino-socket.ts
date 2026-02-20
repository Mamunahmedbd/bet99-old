import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { CasinoController } from '../controllers/CasinoController'
import { CasinoGameResult } from '../models/CasinoGameResult'

class CasinoSocket {
  static socket: Socket
  constructor() {
    CasinoSocket.socket = io(process.env.CASINO_SOCKET_URL!, {
      transports: ['websocket'],
    })
    CasinoSocket.socket.on('connect', () => {
      console.log('connect casino')
      CasinoSocket.socket.emit('joinCasinoRoom', 'result')
    })

    // CasinoSocket.socket.on('result', (data) => {

    // })

    CasinoSocket.socket.on('result', async (data) => {
      // axios
      //   .post(`http://localhost:${process.env.PORT}/api/save-casino-match`, { data })
      //   .then(() => {
      //     if (!data.beforeResultSet) {
      //       // const resultUrl = `http://localhost:${process.env.PORT}/api/setResult/${data.gameType}`
      //       // axios.get(`${resultUrl}`).catch((err) => console.log('casino result', err.stack))
      //     }
      //   })
      //   .catch((err) => console.log('save casino match', err.stack))
      if (data.beforeResultSet) {
        const resultUrl = data.beforeResultSet
          ? `http://localhost:${process.env.PORT}/api/setResult/${data.gameType}/${data.beforeResultSet}`
          : `http://localhost:${process.env.PORT}/api/setResult/${data.gameType}`
        axios.get(`${resultUrl}`).catch((err) => console.log('casino result', err.stack))
      }
    })
  }
}
export default CasinoSocket
