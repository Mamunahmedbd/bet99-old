import React, { FC } from 'react'
import { io, Socket } from 'socket.io-client'
import { selectInitApp } from '../redux/actions/common/commonSlice'
import { useAppSelector } from '../redux/hooks'
// defining the context with empty socket object
export type WebSocketCasinoType = {
  socketCasino: Socket
}

export const CasinoSocketContext = React.createContext<WebSocketCasinoType>(
  {} as WebSocketCasinoType,
)

type Props = {
  children: JSX.Element
}

export const WebSocketCasinoProvider: FC<Props> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket>({} as Socket)
  const initApp = useAppSelector(selectInitApp)

  React.useEffect(() => {
    const newSocket: Socket = io(process.env.REACT_APP_CASINO_SOCKET_URL!, {
      transports: ['websocket'],
    })

    setSocket(newSocket)
  }, [])

  // React.useEffect(() => {
  //   const newSocket: Socket = io(process.env.REACT_APP_CASINO_SOCKET_URL!, {
  //     transports: ['websocket'],
  //   })

  //   setSocket(newSocket)
  // }, [initApp])

  return (
    <CasinoSocketContext.Provider value={{ socketCasino: socket }}>
      {Object.keys(socket).length > 0 && children}
    </CasinoSocketContext.Provider>
  )
}

// defining a useWebsocketUser hook for functional components
export const useWebsocketCasino = () => React.useContext(CasinoSocketContext)
