import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import User, { RoleType } from '../../../models/User'
import { useNavigateCustom } from '../../../pages/_layout/elements/custom-link'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { useAppSelector } from '../../../redux/hooks'
import authService from '../../../services/auth.service'
import Footer from './elements/footer'
import Header from './elements/header'

const MainAdmin = () => {
  const userState = useAppSelector<{ user: User }>(selectUserData)
  const navigate = useNavigateCustom()

  // React.useEffect(() => {
  //   const currentUserRole = localStorage.getItem('userType')
  //   const rolesWithOutUser = JSON.parse(JSON.stringify(RoleType))
  //   delete rolesWithOutUser.user
  //   console.log("heree")
  //   if (currentUserRole && !Object.keys(rolesWithOutUser).includes(currentUserRole)) {
  //     return navigate.go('/')
  //   }
  // }, [])

  React.useEffect(() => {
    const auth = authService.isLoggedIn()
    if (!auth || userState.user.role === RoleType.user) {
      return navigate.go('/admin/login')
    }
  }, [userState.user])
  const location = useLocation();
  return (
    <div className='admin'>
      <Header />
      <ToastContainer />
      <div className='main'>
        {(location.pathname.includes('odds/') || location.pathname.includes('casino/')) &&
          <div className='container-fluid'>
            <div className='row'>
              <div className='col-md-12 mt-1'>
                <Outlet></Outlet>
              </div>
            </div>
          </div>
        }
        {(!location.pathname.includes('odds/') && !location.pathname.includes('casino/')) &&
          <Outlet></Outlet>
        }
      </div>
      <Footer />
    </div>
  )
}
export default MainAdmin
