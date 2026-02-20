import React, { ChangeEvent } from 'react'
import { toast } from 'react-toastify'
import InputComponent from '../../../pages/ChangePassword/InputComponent'
import { useNavigateCustom } from '../../../pages/_layout/elements/custom-link'
import { selectLoader, setChangePassAndTxn } from '../../../redux/actions/common/commonSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import userService from '../../../services/user.service'
import TransactionPasswordModel from '../../../pages/Rules/transactionPasswordModel'
import { RoleType } from '../../../models/User'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import SubmitButton from '../../../components/SubmitButton'
const TransactionPassword = () => {
  const [passobj, setpassobj] = React.useState<any>({})
  const userState = useAppSelector(selectUserData)
  const [errorMsg, setErrorMsg] = React.useState({})
  const loading = useAppSelector(selectLoader)
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = React.useState(false)

  const navigate = useNavigateCustom()

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const btnObj = { ...passobj }
    btnObj[event.target.name] = event.target.value
    setpassobj(btnObj)
  }

  const submitHandler = (e: any) => {
    e.preventDefault()
    const errormsg: any = {}

    if (!passobj['new_password']) {
      errormsg['new_password'] = 'Please Enter New Password'
    }

    const regEx: any = /^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\D*\d)[A-Za-z0-9]{8,32}$/
    if (passobj['new_password'].length < 6) {
      errormsg['new_password'] =
        'password length must be 6'
    }
    if (!passobj['confirm_password']) {
      errormsg['confirm_password'] = 'Please Enter Confirm Password'
    }
    if (!passobj['txn_password'] && userState.user.role != RoleType.user) {
      errormsg['txn_password'] = 'Please Enter Transaction Password'
    }
    if (
      passobj['confirm_password'] &&
      passobj['new_password'] &&
      passobj['new_password'] != passobj['confirm_password']
    ) {
      errormsg['confirm_password'] = 'New Password and Confirm Password does Not Match'
    }
    if (errormsg && Object.keys(errormsg).length > 0) {
      setErrorMsg(errormsg)
      return
    }
    userService
      .addTransactionPassword(passobj)
      .then(() => {
        toast.success('Password Updated Successfully')
        if (userState.user.role !== RoleType.user) {
          dispatch(setChangePassAndTxn(true))
          setIsOpen(true)
        } else {
          dispatch(setChangePassAndTxn(true))
          setIsOpen(false)
          navigate.go('/')
        }
      })
      .catch((e) => {
        const error = e.response.data.message
        setErrorMsg(e.response.data.errors)
        toast.error(error)
      })
  }
  const redirectlogin = () => {
    setIsOpen(false)
    navigate.go('/')
  }
  const renderInputBox = (name: string, label: string) => {
    const rendbox = []
    rendbox.push(
      <InputComponent
        key={0}
        valName={`${name}`}
        labelName={`${label}`}
        changeHandler={changeHandler}
        errorMsg={errorMsg}
        btnValue={passobj}
      />,
    )
    return rendbox
  }

  return (
    <div className='login'>
      <div className='wrapper'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='loginInner1'>
                <div className='log-logo m-b-20 text-center'>
                  <img src='/imgs/logo.png' className='logo-login' />
                </div>
                <div className='featured-box-login featured-box-secundary default'>
                  <h4 className='text-center'>Set your own Password</h4>
                  <form
                    onSubmit={(e) => submitHandler(e)}
                    role='form'
                    autoComplete='off'
                    method='post'
                  >
                    <div className='form-group m-b-20'>
                      {renderInputBox('new_password', 'New Password')}
                    </div>
                    <div className='form-group m-b-20'>
                      {renderInputBox('confirm_password', 'Confirm Password')}
                    </div>
                    {userState && userState.user && userState.user.role != RoleType.user ? (
                      <div>
                        <div className='form-group m-b-20'>
                          {renderInputBox('txn_password', 'Transaction Password')}
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                    <div className='form-group text-center mb-0'>
                      <SubmitButton
                        type='submit'
                        disabled={loading}
                        className='btn btn-submit btn-login'
                      >
                        Submit
                        {loading ? (
                          <i className='mx-5 fas fa-spinner fa-spin'></i>
                        ) : (
                          <i className='ml-2 fas fa-sign-in-alt'></i>
                        )}
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TransactionPasswordModel
        transpass={passobj['txn_password']}
        isOpen={isOpen}
        setIsOpen={redirectlogin}
      />
    </div>
  )
}
export default TransactionPassword
