import React from 'react'
import User from '../../models/User'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { loginAction } from '../../redux/actions/login/login.action'
import { selectUserData } from '../../redux/actions/login/loginSlice'
import { useWebsocketUser } from '../../context/webSocketUser'
import { useNavigateCustom } from '../_layout/elements/custom-link'
import { isMobile } from 'react-device-detect'
import api from '../../utils/api'
import SubmitButton from '../../components/SubmitButton'

const Login = () => {
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const { socketUser } = useWebsocketUser()

  const navigate = useNavigateCustom()

  const [loginForm, setLoginForm] = React.useState<User>({
    username: '',
    password: '',
    logs: '',
    isDemo: false
  })

  React.useEffect(() => {
    api.get(`${process.env.REACT_APP_IP_API_URL}`).then((res) => {
      setLoginForm(prev => ({ ...prev, logs: res.data }))
    })
  }, [])

  React.useEffect(() => {
    if (userState.status === 'done') {
      const { _id } = userState.user
      socketUser.emit('login', {
        role: userState.user.role,
        sessionId: userState.user.sessionId,
        _id,
      })
      localStorage.setItem('login-session', userState.user.sessionId)

      if (userState.user.role && ['admin', '1', '2', '3'].includes(userState.user.role)) {
        return navigate.go('/')
      }

      return isMobile ? navigate.go('/match/4/in-play') : navigate.go('/')
    }
  }, [userState, socketUser, navigate])

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  }
  const handleSubmitDemoLogin = () => {
    dispatch(loginAction({ ...loginForm, isDemo: true }))
  }
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(loginAction(loginForm))
  }
  return (
    <div>
      <div className='login'>
        <div className='loginInner1'>
          <div className='log-logo m-b-20 text-center'>
            <img src='/imgs/logo.png' className='logo-login' alt="Logo" />
          </div>
          <div className='featured-box-login featured-box-secundary default'>
            <h4 className='text-center'>
              LOGIN <i className='fas fa-hand-point-down'></i>
            </h4>
            <form
              onSubmit={(e) => handleSubmit(e)}
              autoComplete='off'
              method='post'
            >
              <div className='form-group m-b-20'>
                <input
                  name='username'
                  placeholder='User Name'
                  type='text'
                  className='form-control'
                  aria-required='true'
                  aria-invalid='false'
                  onChange={handleForm}
                  required
                />
                <i className='fas fa-user'></i>
                <small className='text-danger' style={{ display: 'none' }}></small>
              </div>
              <div className='form-group m-b-20'>
                <input
                  name='password'
                  placeholder='Password'
                  type='password'
                  className='form-control'
                  aria-required='true'
                  aria-invalid='false'
                  onChange={handleForm}
                  required
                />
                <i className='fas fa-key'></i>
                {userState.error ? (
                  <small className='text-danger'>{userState.error}</small>
                ) : (
                  ''
                )}
              </div>
              <div className='form-group text-center mb-0'>
                <SubmitButton type='submit' className='btn btn-submit btn-login mb-10'>
                  Login
                  {userState.status === 'loading' ? (
                    <i className='ml-2 fas fa-spinner fa-spin'></i>
                  ) : (
                    <i className='ml-2 fas fa-sign-in-alt'></i>
                  )}
                </SubmitButton>
                <SubmitButton type='button' onClick={() => handleSubmitDemoLogin()} className='btn btn-submit btn-login mb-10'>
                  Login with Demo ID
                  {userState.status === 'loading' ? (
                    <i className='ml-2 fas fa-spinner fa-spin'></i>
                  ) : (
                    <i className='ml-2 fas fa-sign-in-alt'></i>
                  )}
                </SubmitButton>
                <small className='recaptchaTerms'>
                  This site is protected by reCAPTCHA and the Google
                  <a
                    target={'_blank'}
                    rel='noopener noreferrer'
                    href='https://policies.google.com/privacy'
                  >
                    Privacy Policy
                  </a>{' '}
                  and
                  <a
                    target={'_blank'}
                    rel='noopener noreferrer'
                    href='https://policies.google.com/terms'
                  >
                    Terms of Service
                  </a>{' '}
                  apply.
                </small>
              </div>
              <div className='mt-2 text-center download-apk'></div>
            </form>
          </div>
        </div>
      </div>
      <section className="footer footer-login"><div className="footer-top"><div className="footer-links"><nav className="navbar navbar-expand-sm"><ul className="navbar-nav"><li className="nav-item"><a className="nav-link" href="/terms-and-conditions" target="_blank"> Terms and Conditions </a></li><li className="nav-item"><a className="nav-link" href="/responsible-gaming" target="_blank"> Responsible Gaming </a></li></ul></nav></div><div className="support-detail"><h2>24X7 Support</h2><p></p></div><div className="social-icons-box"></div></div></section>

    </div>

  )
}

export default Login
