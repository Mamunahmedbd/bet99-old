import React, { FC } from 'react'
import { io, Socket } from 'socket.io-client'
import { selectInitApp } from '../redux/actions/common/commonSlice'
import { useAppSelector } from '../redux/hooks'
// defining the context with empty socket object
export type WebSocketUserType = {
  socketUser: Socket
}

export const UserSocketContext = React.createContext<WebSocketUserType>({} as WebSocketUserType)

type Props = {
  children: JSX.Element
}

export const WebSocketUserProvider: FC<Props> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket>({} as Socket)
  const initApp = useAppSelector(selectInitApp)

  React.useEffect(() => {
    const newSocket: Socket = io(process.env.REACT_APP_USER_SOCKET!, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
    })

    setSocket(newSocket)
  }, [])

  // React.useEffect(() => {
  //   const newSocket: Socket = io(process.env.REACT_APP_USER_SOCKET!, {
  //     transports: ['websocket'],
  //   })

  //   setSocket(newSocket)
  // }, [initApp])

  return (
    <UserSocketContext.Provider value={{ socketUser: socket }}>
      {Object.keys(socket).length > 0 && children}
    </UserSocketContext.Provider>
  )
}

// defining a useWebsocketUser hook for functional components
export const useWebsocketUser = () => React.useContext(UserSocketContext)
