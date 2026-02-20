import { RootState } from '../../store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loginAction, getUserInfoAction } from './login.action'
import User, { RoleType } from '../../../models/User'

export type UserState = {
  userData: { user: User; status: string; error: any }
  welcome: { status: boolean }
}

const initialState: UserState = {
  userData: {
    user: { _id: '', username: '' },
    status: '',
    error: '',
  },
  welcome: { status: false },
}

const loginSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userUpdate: (state, action: PayloadAction<User>) => {
      state.userData.user = action.payload
    },
    updateMessage: (state, action: PayloadAction<any>) => {
      state.welcome = action.payload
    },
    logout: (state) => {
      state.userData = initialState.userData
      if (window.location.pathname.includes('admin')) {
        localStorage.removeItem('token-admin')
        localStorage.removeItem('refreshToken-admin')
        localStorage.removeItem('userType-admin')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userType')
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAction.pending, (state) => {
        state.userData.status = 'loading'
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        //state.userData.user = action.payload.data
        state.userData.error = ''
        state.userData.status = 'done'
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.userData.error = action.payload
        state.userData.status = 'failed'
      })
      .addCase(getUserInfoAction.fulfilled, (state, action) => {
        if (action.payload.data.user.role === RoleType.user)
          localStorage.setItem('userType', action.payload.data.user.role)
        else localStorage.setItem('userType-admin', action.payload.data.user.role)
        state.userData.user = action.payload.data.user
        state.userData.error = ''
        state.userData.status = 'done'
      })
  },
})

export const { logout, userUpdate, updateMessage } = loginSlice.actions

export const selectSinglePost = (state: RootState) => state.userReducer.userData

export const selectUserData = (state: RootState) => state.userReducer.userData

export const selectWelcomeMessage = (state: RootState) => state.userReducer.welcome

export default loginSlice
