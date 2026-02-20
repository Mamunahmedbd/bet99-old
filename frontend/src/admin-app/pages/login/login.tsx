import React from 'react'
import api from '../../../utils/api'
import { useNavigateCustom } from '../../../pages/_layout/elements/custom-link'
import { useWebsocketUser } from '../../../context/webSocketUser'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import User from '../../../models/User'
import { loginAction } from '../../../redux/actions/login/login.action'
import SubmitButton from '../../../components/SubmitButton'

const Login = () => {
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const { socketUser } = useWebsocketUser()

  const navigate = useNavigateCustom()

  const [loginForm, setLoginForm] = React.useState<User>({
    username: '',
    password: '',
    logs: '',
    admin: true,
  })

  React.useEffect(() => {
    api.get(`${process.env.REACT_APP_IP_API_URL}`).then((res) => {
      setLoginForm({ ...loginForm, logs: res.data })
    })
  }, [])

  React.useEffect(() => {
    if (userState.status === 'done') {
      const { role, _id } = userState.user
      socketUser.emit('login', {
        role: userState.user.role,
        sessionId: userState.user.sessionId,
        _id,
      })

      if (userState.user.role && ['admin', '1', '2', '3'].includes(userState.user.role)) {
        return navigate.go('/market-analysis')
      }

      return navigate.go('/market-analysis')
    }
  }, [userState])

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(loginAction(loginForm))
  }

  return (
    <div className='login'>
      <div className='wrapper d-flex justify-content-center align-items-center'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='loginInner1'>
                <div className='log-logo m-b-20 text-center'>
                  <img src='/imgs/logo.png' className='logo-login' style={{ maxWidth: "250px", maxHeight: "100px" }} />
                </div>
                <div className='featured-box-login featured-box-secundary default log-fld'>
                  <h2 className="text-center">Sign In</h2>
                  <form
                    onSubmit={(e) => handleSubmit(e)}
                    role='form'
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
                      {userState.error ? (
                        <small className='text-danger'>{userState.error}</small>
                      ) : (
                        ''
                      )}
                    </div>
                    <div className='form-group text-center mb-0'>
                      <SubmitButton type='submit' className='btn btn-submit btn-login'>
                        Login
                        {userState.status === 'loading' ? (
                          <i className='fas fa-spinner fa-spin'></i>
                        ) : (
                          <i className='fas fa-sign-in-alt'></i>
                        )}
                      </SubmitButton>

                    </div>
                    <div className='mt-2 text-center download-apk'></div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
