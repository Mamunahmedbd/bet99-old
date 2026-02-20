import React from 'react'
import Modal from 'react-modal'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import UserService from '../../../../services/user.service'
import User from '../../../../models/User'
import SubmitButton from '../../../../components/SubmitButton'

const PasswordModal = ({
  userDetails,
  showDialog,
  closeModal,
}: {
  userDetails: User | undefined
  showDialog: boolean
  closeModal: (type: string) => void
}) => {
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\D*\d)[A-Za-z0-9]{8,32}$/,
        'contains at least one digit,one upper case,one lower case alphabet,',
      ),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    transactionPassword: Yup.string().required('Transaction Password is required'),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string; transactionPassword: string }>({
    resolver: yupResolver(validationSchema),
  })

  const onSubmit = handleSubmit((data) => {
    const formData = { ...data, username: userDetails?.username }

    UserService.updatePassword(formData).then(() => {
      closeModal('p')
      toast.success('Password Updated Successfully')
      reset()
    })
  })

  return (
    <>
  
      <Modal
        isOpen={showDialog}
        onRequestClose={() => {
          closeModal('p')
          reset()
        }}
        contentLabel='Password'
        className={'modal-dialog'}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>Password</h4>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              onClick={() => {
                closeModal('p')
                reset()
              }}
            >
              ×
            </button>
          </div>
          <form id='PasswordForm' onSubmit={onSubmit}>
            <div className='modal-body'>
              <div className='container-fluid'>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>New Password</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='Password'
                      className='form-control'
                      id='new-password'
                      {...register('password')}
                      maxLength={20}
                    />
                    {errors?.password && (
                      <span id='password-error' className='error'>
                        {errors.password.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>Confirm Password</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='Password'
                      className='form-control'
                      id='confirm-password'
                      {...register('confirmPassword')}
                      maxLength={20}
                    />
                    {errors?.confirmPassword && (
                      <span id='password_confirmation-error' className='error'>
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>Transaction Password</label>
                  </div>
                  <div className='col-md-8'>
                    <input type='Password' id='mpassword' {...register('transactionPassword')} />
                    {errors?.transactionPassword && (
                      <span className='error'>{errors.transactionPassword.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <input type='hidden' id='password-uid' />
              <button
                type='button'
                className='btn btn-back'
                data-dismiss='modal'
                onClick={() => {
                  closeModal('p')
                  reset()
                }}
              >
                <i className='fas fa-undo' />
                Back
              </button>
              <SubmitButton type='submit' className='btn btn-submit'>
                Submit
                <i className='fas fa-sign-in-alt' />
              </SubmitButton>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default PasswordModal
