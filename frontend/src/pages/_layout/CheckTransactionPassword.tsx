import React from 'react'
import { Outlet } from 'react-router-dom'
import { selectChangePassAndTxn } from '../../redux/actions/common/commonSlice'
import { useAppSelector } from '../../redux/hooks'
import { useNavigateCustom } from './elements/custom-link'

const CheckTransactionPassword = () => {
  const selectTxn = useAppSelector(selectChangePassAndTxn)
  const navigate = useNavigateCustom()

  React.useEffect(() => {
    const ac = new AbortController()
    if (selectTxn !== undefined && !selectTxn) navigate.go('/transaction-password')

    return () => ac.abort()
  }, [selectTxn])

  return (
    <>
      <Outlet></Outlet>
    </>
  )
}

export default CheckTransactionPassword
