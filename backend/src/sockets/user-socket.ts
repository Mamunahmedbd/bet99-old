import { io, Socket } from 'socket.io-client'

class UserSocket {
  static socket: Socket
  constructor() {
    UserSocket.socket = io(process.env.USER_SOCKET_URL!, {
      transports: ['websocket'],
    })
    UserSocket.socket.on('connect', () => {
      console.log('connect user')
      // setInterval(() => {
      //   UserSocket.setExposer({
      //     balance: 10000,
      //     userId: '64643df6fcfcd41e7ee2cede',
      //   })
      // }, 3000)
    })
  }

  public static setExposer({ exposer, balance, userId }: any) {
    this.socket.emit('updateExposer', { exposer, balance, userId })
  }

  public static onRollbackPlaceBet(bet: any) {
    this.socket.emit('on-rollback-place-bet', bet)
  }
  
  public static betDelete({ betId, userId }: { betId: string; userId: string }) {
    this.socket.emit('betDelete', { betId, userId })
  }

  public static logout(user: any) {
    this.socket.emit('login', user)
  }
}
export default UserSocket
