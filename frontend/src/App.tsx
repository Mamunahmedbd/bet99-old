import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import '../node_modules/devtools-detect/index.js'
import LogoutInactive from './components/LogoutInactive'
import ScrollToTop from './components/ScrollToTop'
import { useWebsocketUser } from './context/webSocketUser'
import User from './models/User'
import { selectLoader, setInitApp } from './redux/actions/common/commonSlice'
import { getUserInfoAction } from './redux/actions/login/login.action'
import { logout, selectUserData, userUpdate } from './redux/actions/login/loginSlice'
import { getSportListAction } from './redux/actions/sports/sport.action'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import Routers from './routes'
import WindowFocusHandler from './utils/check-browser-active'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const ref = React.useRef<any>(null)
  const dispatch = useAppDispatch()

  const { socketUser } = useWebsocketUser()

  const userState = useAppSelector<{ user: User }>(selectUserData)
  const loadingState = useAppSelector(selectLoader)

  React.useEffect(() => {
    if (userState.user._id) {
      dispatch(getSportListAction())
      socketUser.emit('userRoomJoin', { userId: userState.user._id })
      socketUser.on('connect', () => {
        socketUser.emit('userRoomJoin', { userId: userState.user._id })
      })
    }
  }, [userState])

  React.useEffect(() => {
    dispatch(getUserInfoAction({} as User))

    socketUser.on('logout', ({ sessionId }) => {
      const localSessionId = localStorage.getItem('login-session')
      if (localSessionId == sessionId) return
      dispatch(userUpdate({} as User))
      setTimeout(() => {
        dispatch(logout())
        localStorage.removeItem('login-session')
        // window.location.reload()
      }, 1)
    })
  }, [])

  // React.useEffect(() => {
  //   if (loadingState) {
  //     ref.current.continuousStart()
  //   } else {
  //     ref.current.complete()
  //   }
  // }, [loadingState])

  React.useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // tab is changed
        dispatch(setInitApp(false))
        console.log('tab change')
      } else {
        // tab is active
        dispatch(setInitApp(true))
        console.log('tab active')
      }
    })
  }, [])

  return (
    <Router>
      <ScrollToTop />
      <WindowFocusHandler />
      <LogoutInactive />
      {/* <LoadingBar color='#f11946' ref={ref} shadow={true} /> */}
      <Routers />
    </Router>
  )
}

export default App
