import { createAsyncThunk } from '@reduxjs/toolkit'
import User from '../../../models/User'
import authService from '../../../services/auth.service'
import { updateMessage, userUpdate } from './loginSlice'

export const loginAction = createAsyncThunk(
  'user/login',
  async (user: User, { rejectWithValue, dispatch }) => {
    const successCallback = (res: any) => {
      dispatch(userUpdate(res.data.data))
      dispatch(updateMessage({ status: true }))
      dispatch(getUserInfoAction({} as User))
      return res.data
    }
    if (user.admin) {
      return authService
        .loginAdmin(user)
        .then(successCallback)
        .catch((e) => {
          return rejectWithValue(e.response.data.message)
        })
    }
    return authService
      .login(user)
      .then(successCallback)
      .catch((e) => {
        return rejectWithValue(e.response.data.message)
      })
  },
)

export const getUserInfoAction = createAsyncThunk(
  'user/user-info',
  async (user: User, { rejectWithValue }) => {
    if (authService.getRefreshToken()) {
      return authService
        .getUser()
        .then((res: any) => res.data)
        .catch((e: any) => {
          return rejectWithValue(e.response.data.message)
        })
    }
    return rejectWithValue('Token not exist')
  },
)
