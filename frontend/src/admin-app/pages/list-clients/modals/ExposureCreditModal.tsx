import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import Modal from 'react-modal'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import SubmitButton from '../../../../components/SubmitButton'
import User from '../../../../models/User'
import UserService from '../../../../services/user.service'

const ExposureCreditModal = ({
  userDetails,
  showDialog,
  closeModal,
  modalType,
}: {
  userDetails: User | undefined
  showDialog: boolean
  closeModal: (type: string) => void
  modalType: string
}) => {
  const exposureValidationSchema = Yup.object().shape({
    amount: Yup.number()
      .required(`New ${modalType === 'EXP' ? 'limit' : 'credit'} is required`)
      .transform((value) => (isNaN(value) ? 0 : +value))
      .min(0, `New ${modalType === 'EXP' ? 'limit' : 'credit'} is required`),
    transactionPassword: Yup.string().required('Transaction Password is required'),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    amount: string
    transactionPassword: string
  }>({
    resolver: yupResolver(exposureValidationSchema),
  })

  const onSubmit = handleSubmit((data) => {
    const formData = {
      ...data,
      username: userDetails?.username,
      walletUpdateType: modalType,
    }

    UserService.updateUserExposureAndCreditLimit(formData).then(() => {
      closeModal('e')
      toast.success(`${modalType === 'EXP' ? 'Limit' : 'Credit Referance'} Updated Successfully`)
      reset()
    })
  })

  return (
    <>
     
      <Modal
        isOpen={showDialog}
        onRequestClose={() => {
          closeModal('e')
          reset()
        }}
        contentLabel='Exposure'
        className={'modal-dialog'}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>{modalType === 'EXP' ? 'Exposure Limit' : 'Credit'}</h4>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              onClick={() => {
                closeModal('e')
                reset()
              }}
            >
              ×
            </button>
          </div>
          <form id='LimitForm' method='post' autoComplete='off' onSubmit={onSubmit}>
            <div className='modal-body'>
              <div className='container-fluid'>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>Old {modalType === 'EXP' ? 'Limit' : 'Credit'}</label>
                  </div>
                  <div className='col-md-8'>
                    <span className='popup-box popup-box-full' id='old-limit'>
                      {modalType === 'EXP'
                        ? userDetails?.exposerLimit
                        : userDetails?.creditRefrences}
                    </span>
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>New {modalType === 'EXP' ? 'Limit' : 'Credit'}</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='number'
                      className='text-right maxlength10'
                      id='new-limit'
                      {...register('amount')}
                      min={0}
                    />
                    {errors?.amount && <span className='error'>{errors.amount.message}</span>}
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
              <input type='hidden' name='uid' id='limit-uid' />
              <button
                type='button'
                className='btn btn-back'
                data-dismiss='modal'
                onClick={() => {
                  closeModal('e')
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

export default ExposureCreditModal
