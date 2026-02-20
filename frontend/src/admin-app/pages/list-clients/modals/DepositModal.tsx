import React from 'react'
import Modal from 'react-modal'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import UserService from '../../../../services/user.service'
import { AxiosResponse } from 'axios'
import SubmitButton from '../../../../components/SubmitButton'

const DepositModal = (props: any) => {
  const depositValidationSchema = Yup.object().shape({
    narration: Yup.string().required('Remark is required'),
    transactionPassword: Yup.string().required('Transaction Password is required'),
    amount:
      props.depositUser?.role === 'admin'
        ? Yup.number()
          .required('Amount is required')
          .transform((value) => (isNaN(value) ? 0 : +value))
          .min(1, 'Amount is required')
        : Yup.number()
          .required('Amount is required')
          .transform((value) => (isNaN(value) ? 0 : +value))
          .min(1, 'Amount is required')
          .max(
            props.depositUser?.parentBalance?.balance,
            `Max ${props.depositUser?.parentBalance?.balance} limit`,
          ),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    watch,
  } = useForm<{ amount: string; narration: string; transactionPassword: string }>({
    resolver: yupResolver(depositValidationSchema),
  })

  const onSubmit = handleSubmit((data) => {
    const formData = {
      ...data,
      userId: props.depositUser?._id,
      parentUserId:
        props.depositUser?.role === 'admin' ? props.depositUser?._id : props.depositUser?.parentId,
      balanceUpdateType: 'D',
    }

    UserService.updateDepositBalance(formData).then((res: AxiosResponse) => {
      props.closeModal('d', res.data.data)
      toast.success('Deposit Balance Updated Successfully')
      reset()
    })
  })

  return (
    <>
       
      <Modal
        isOpen={props.showDialog}
        onRequestClose={() => {
          props.closeModal('d')
          reset()
        }}
        contentLabel='Deposit'
        className={'modal-dialog'}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>Deposit</h4>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              onClick={() => {
                props.closeModal('d')
                reset()
              }}
            >
              ×
            </button>
          </div>
          <form id='DepositForm' method='post' autoComplete='off' onSubmit={onSubmit}>
            <div className='modal-body'>
              <div className='container-fluid'>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label className='deposite-user-first'>
                      {props.depositUser?.parent?.username}
                    </label>
                  </div>
                  <div className='col-md-8'>
                    <span className='popup-box' id='deposite-first'>
                      {props.depositUser?.parentBalance?.balance
                        ? props.depositUser?.parentBalance?.balance?.toFixed(2)
                        : 0}
                    </span>
                    <span className='popup-box' id='deposite-first-diff'>
                      {props.depositUser?.parentBalance?.balance && watch('amount')
                        ? (props.depositUser?.parentBalance?.balance - +watch('amount'))?.toFixed(2)
                        : 0}
                    </span>
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label className='deposite-user-second'>{props.depositUser?.username}</label>
                  </div>
                  <div className='col-md-8'>
                    <span className='popup-box' id='deposite-second'>
                      {props.depositUser?.balance?.balance
                        ? props.depositUser?.balance?.balance?.toFixed(2)
                        : 0}
                    </span>
                    <span className='popup-box' id='deposite-second-diff'>
                      {props.depositUser?.balance?.balance && watch('amount')
                        ? (props.depositUser?.balance?.balance + +watch('amount'))?.toFixed(2)
                        : 0}
                    </span>
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>Amount</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='number'
                      className='text-right maxlength10'
                      id='deposite-amount'
                      {...register('amount')}
                      min={0}
                      step='0.01'
                    />
                    {errors?.amount && <span className='error'>{errors.amount.message}</span>}
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-4'>
                    <label>Remark</label>
                  </div>
                  <div className='col-md-8'>
                    <textarea id='deposit-remark' defaultValue={''} {...register('narration')} />
                    {errors?.narration && <span className='error'>{errors.narration.message}</span>}
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
              <input type='hidden' name='uid' id='uid' />
              <button
                type='button'
                className='btn btn-back'
                data-dismiss='modal'
                onClick={() => {
                  props.closeModal('d')
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

export default DepositModal
