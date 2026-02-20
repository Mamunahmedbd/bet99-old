import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import Modal from 'react-modal'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import User from '../../../../models/User'
import UserService from '../../../../services/user.service'
import { useEffect } from 'react'
import SubmitButton from '../../../../components/SubmitButton'

const StatusModal = ({
  userDetails,
  showDialog,
  closeModal,
  refreshClientList,
}: {
  userDetails: User | undefined
  showDialog: boolean
  closeModal: (type: string) => void
  refreshClientList: (type: boolean) => void
}) => {
  const statusValidationSchema = Yup.object().shape({
    isUserActive: Yup.boolean(),
    isUserBetActive: Yup.boolean(),
    transactionPassword: Yup.string().required('Transaction Password is required'),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<{
    isUserActive: boolean
    isUserBetActive: boolean
    transactionPassword: string
  }>({
    defaultValues: { isUserActive: userDetails?.isLogin, isUserBetActive: userDetails?.betLock },
    resolver: yupResolver(statusValidationSchema),
  })

  useEffect(() => {
    setValue('isUserBetActive', userDetails?.betLock ? true : false)
    setValue('isUserActive', userDetails?.isLogin ? true : false)
  }, [userDetails])

  const onSubmit = handleSubmit((data) => {
    const formData = {
      ...data,
      username: userDetails?.username,
    }

    UserService.updateUserAndBetStatus(formData).then(() => {
      closeModal('s')
      toast.success('Status Updated Successfully')
      refreshClientList(true)
      reset()
    })
  })
  return (
    <>
   
      <Modal
        isOpen={showDialog}
        onRequestClose={() => {
          closeModal('s')
          reset()
        }}
        contentLabel='Status'
        className={'modal-dialog'}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>Change Status</h4>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              onClick={() => {
                closeModal('s')
                reset()
              }}
            >
              ×
            </button>
          </div>
          <div className='m-t-20'>
            <div className='col-md-12'>
              <div className='float-right user-status'>
                <p className='text-success' id='user-active-diff-s' style={{ display: 'none' }}>
                  Active
                </p>
                <p className='text-danger' id='user-active-diff-f' style={{ display: 'none' }}>
                  Inactive
                </p>
              </div>
            </div>
          </div>

          <form id='StatusForm' method='post' autoComplete='off' onSubmit={onSubmit}>
            <ul className='status col-md-12 text-center m-t-20'>
              <div className='row'>
                <li className='col-md-6'>
                  <label>
                    <span>User Active</span>
                    <input type={'checkbox'} {...register('isUserActive')} />
                  </label>
                </li>
                <li className='col-md-6'>
                  <label>
                    <span>Bet Active </span>
                    <input type={'checkbox'} {...register('isUserBetActive')} />
                  </label>
                </li>
              </div>
            </ul>

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
            <div className='modal-body m-t-20'></div>
            <div className='modal-footer'>
              <input type='hidden' id='status-uid' />
              <button
                type='button'
                className='btn btn-back'
                data-dismiss='modal'
                onClick={() => {
                  closeModal('s')
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

export default StatusModal
