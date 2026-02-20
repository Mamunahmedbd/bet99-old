import React, { useEffect } from 'react'
import { setInitApp } from '../redux/actions/common/commonSlice'
import { useAppDispatch } from '../redux/hooks'

const WindowFocusHandler = () => {
  const dispatch = useAppDispatch()
  let clearInt: any = null
  // User has switched back to the tab
  const onFocus = () => {
    console.log('Tab is in focus')
    clearInterval(clearInt)
    dispatch(setInitApp(false))
  }

  // User has switched away from the tab (AKA tab is hidden)
  const onBlur = () => {
    console.log('Tab is blurred')
    clearInt = setInterval(() => {
      dispatch(setInitApp(true))
    }, 1000 * 60 * 3) // 3 minutes
  }
  useEffect(() => {
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    // Calls onFocus when the window first loads
    onFocus()
    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return <></>
}

export default WindowFocusHandler
