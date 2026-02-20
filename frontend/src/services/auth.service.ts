/* eslint-disable */
import User from '../models/User'

import api from '../utils/api'
import axios from 'axios'

class AuthService {
  async login(user: User) {
    const res = await api.post('login', user)
    this.ipAddress()
    localStorage.setItem('token', res.data.data.token)
    localStorage.setItem('userType', res.data.data.role)
    localStorage.setItem('refreshToken', res.data.data.refreshToken)
    return res
  }

  async loginAdmin(user: User) {
    const res = await api.post('login-admin', user)
    this.ipAddress()
    localStorage.setItem('token-admin', res.data.data.token)
    localStorage.setItem('userType-admin', res.data.data.role)
    localStorage.setItem('refreshToken-admin', res.data.data.refreshToken)
    return res
  }

  getUser() {
    return api.get('user-info')
  }

  refreshToken(token: string) {
    return api.post('refresh-token', { token })
  }

  getToken() {
    if (window.location.pathname.includes('admin')) {
      return localStorage.getItem('token-admin')
    }
    return localStorage.getItem('token')
  }



  ipAddress() {
    axios
      .get(`${process.env.REACT_APP_IP_API_URL}`)
      .then((res) => {
        localStorage.setItem('ip_address', res.data.ip)
      })
      .catch((e) => {
        console.log(e.stack)
      })
  }

  gett10Streams() {
    return api
      .get(`${process.env.REACT_APP_T10_STREAM}`)
  }

  getIpAddress() {
    return localStorage.getItem('ip_address') || ''
  }

  getRefreshToken() {
    if (window.location.pathname.includes('admin')) {
      const token = localStorage.getItem('refreshToken-admin')
      if (token) return token
    }
    const token = localStorage.getItem('refreshToken')
    if (token) return token

    return ''
  }

  isLoggedIn() {
    return this.getToken() ? true : false
  }

  getSettingsList() {
    return api.get('setting-list')
  }

  saveSettingList(settingList: any) {
    return api.post('save-setting-list', { settingList })
  }

  getpymentSettingsList() {
    return api.get('payment-list')
  }
  savepaymentSettingList(settingList: any) {
    const token = this.getToken()
    return api.post(
      'save-payment-list',
      { settingList },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      },
    )
  }
}
export default new AuthService()
