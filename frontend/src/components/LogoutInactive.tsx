import React, { useEffect, useState } from 'react'
import { logout } from '../redux/actions/login/loginSlice'
import { useAppDispatch } from '../redux/hooks'

const LogoutInactive = () => {
  const [logoutTimer, setLogoutTimer] = useState<any>(null)
  const disptatch = useAppDispatch()

  // Function to handle user activity
  const handleUserActivity = () => {
    // Reset the logout timer
    clearTimeout(logoutTimer)

    // Start a new logout timer
    const timer = setTimeout(() => {
      // Perform logout action here
      console.log('User inactive. Logging out...')
      disptatch(logout())
    }, 60 * 60 * 2 * 1000) // 2 Hours (adjust as needed)

    setLogoutTimer(timer)
  }

  useEffect(() => {
    // Add event listeners for user activity
    document.addEventListener('mousemove', handleUserActivity)
    document.addEventListener('keydown', handleUserActivity)

    // Clear the timeout and remove event listeners on component unmount
    return () => {
      clearTimeout(logoutTimer)
      document.removeEventListener('mousemove', handleUserActivity)
      document.removeEventListener('keydown', handleUserActivity)
    }
  }, [])

  return <React.Fragment />
}

export default LogoutInactive
