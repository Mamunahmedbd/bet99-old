import React from 'react'
import { Link, LinkProps, useNavigate } from 'react-router-dom'
import { RoleType } from '../../../models/User'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { useAppSelector } from '../../../redux/hooks'

export const CustomLink = React.memo(({ children, to, ...props }: LinkProps) => {
  const userState = useAppSelector(selectUserData)
  const urlPrefix = React.useMemo(() => {
    if (userState.user.role) {
      return userState.user.role === RoleType.user ? to : `/admin${to}`
    }
    return to
  }, [userState.user.role, to])

  return (
    <Link to={urlPrefix} {...props}>
      {children}
    </Link>
  )
})

export const useNavigateCustom = () => {
  const navigate = useNavigate()
  const userSate = useAppSelector(selectUserData)

  const push = React.useCallback((to: any, state: any) => navigate(to, { state }), [navigate])

  const replace = React.useCallback(
    (to: any, state: any) => navigate(to, { replace: true, state }),
    [navigate],
  )

  const go = React.useCallback(
    (delta: any) => {
      if (userSate.user.role && userSate.user.role !== RoleType.user) {
        return navigate(`/admin${delta}`)
      }
      return navigate(delta)
    },
    [userSate.user.role, navigate],
  )

  const back = React.useCallback(() => navigate(-1), [navigate])

  const forward = React.useCallback(() => navigate(1), [navigate])

  return {
    back,
    forward,
    go,
    push,
    replace,
  }
}
