import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import { setChangePassAndTxn, setLoader } from '../redux/actions/common/commonSlice'
import { logout } from '../redux/actions/login/loginSlice'
import { store } from '../redux/store'
import authService from '../services/auth.service'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASEURL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    //store.dispatch(setLoader(true))
    // Do something before request is sent
    const token = authService.getToken()
    config.headers.Authorization = token ? `Bearer ${token}` : ''
    return config
  },
  (error: AxiosError) => {
    // Do something with request error
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    store.dispatch(setLoader(false))
    if (!response.data.changePassAndTxn) {
      store.dispatch(setChangePassAndTxn(response.data.changePassAndTxn))
    }

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  async (error: AxiosError<{ message: string; data: any }>) => {
    store.dispatch(setLoader(false))
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const token = authService.getRefreshToken()
    const originalConfig: any = error.config

    if (error.response?.data?.data && error.response?.data?.data.maintenance) {
      setTimeout(() => {
        store.dispatch(logout())
        window.location.reload()
      }, 1)
    }

    if (
      (error.response?.status === 401 && error.response?.data?.message === 'jwt expired') ||
      (error.response?.data?.message === 'jwt malformed' && !originalConfig._retry)
    ) {
      // const refreshTokenApi = await authService.refreshToken(token)
      // const accessToken = refreshTokenApi.data.data.newToken
      // originalConfig._retry = true
      // api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      // localStorage.setItem('token', accessToken)
      // return api(originalConfig)
      store.dispatch(logout())
      window.location.reload()
      return true
    }

    if (error.response?.data?.message !== 'No auth token') {
      if (!window.location.pathname.includes('/login')) toast.error(error.response?.data?.message)
    }

    return Promise.reject(error)
  },
)

export const sportsApi = axios.create({
  baseURL: process.env.REACT_APP_API_SPORTS_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fancyApi = axios.create({
  baseURL: process.env.REACT_APP_PYTHON_SERVER,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
fancyApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    store.dispatch(setLoader(true))
    // Do something before request is sent
    const token = authService.getToken()
    config.headers.Authorization = token ? `Bearer ${token}` : ''
    return config
  },
  (error: AxiosError) => {
    // Do something with request error
    return Promise.reject(error)
  },
)

// Add a response interceptor
fancyApi.interceptors.response.use(
  (response: AxiosResponse) => {
    store.dispatch(setLoader(false))
    if (!response.data.changePassAndTxn) {
      store.dispatch(setChangePassAndTxn(response.data.changePassAndTxn))
    }

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  async (error: AxiosError<{ message: string; data: any }>) => {
    store.dispatch(setLoader(false))
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const token = authService.getRefreshToken()
    const originalConfig: any = error.config

    if (error.response?.data?.data && error.response?.data?.data.maintenance) {
      setTimeout(() => {
        store.dispatch(logout())
        window.location.reload()
      }, 1)
    }

    if (
      (error.response?.status === 401 && error.response?.data?.message === 'jwt expired') ||
      (error.response?.data?.message === 'jwt malformed' && !originalConfig._retry)
    ) {
      // const refreshTokenApi = await authService.refreshToken(token)
      // const accessToken = refreshTokenApi.data.data.newToken
      // originalConfig._retry = true
      // api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      // localStorage.setItem('token', accessToken)
      // return api(originalConfig)
      store.dispatch(logout())
      window.location.reload()
      return true
    }

    if (error.response?.data?.message !== 'No auth token') {
      if (!window.location.pathname.includes('/login')) toast.error(error.response?.data?.message)
    }

    return Promise.reject(error)
  },
)

export default api
