import React from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import depositWithdrawService from '../../services/deposit-withdraw.service'

const AddAccountModalPari = ({ onSuccess }: { onSuccess: () => void }) => {
  const validationSchema = Yup.object().shape({
    accountHolderName: Yup.string().required('Account Holder Name is required'),
    accountNumber: Yup.string().required('Account Number is required'),
    ifscCode: Yup.string().required('IFSC Code is required'),
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(validationSchema) })

  const onSubmit = async (data: any) => {
    const response = await depositWithdrawService.addBankAccount(data)
    if (response?.data?.data?.success) {
      onSuccess()
      toast.success('Account successfully added.')
      reset()
      // eslint-disable-next-line
      //@ts-expect-error
      window.$('#accountModal').modal('hide')
    }
  }
  return (
    <div
      className='modal fade popupcls'
      id='accountModal'
      tabIndex={-1}
      role='dialog'
      aria-labelledby='accountModalCenterTitle'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-login-new' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='accountModalCenterTitle'>
              Add Bank Detail
            </h5>
            <button
              type='button'
              className='btn-close loginpop'
              data-dismiss='modal'
              aria-label='Close'
              onClick={() => reset()}
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='form-group' style={{ position: 'relative' }}>
                <label>Account Holder Name:</label>
                <input type='text' className='form-control' {...register('accountHolderName')} />
                {errors?.accountHolderName ? (
                  // eslint-disable-next-line
                  // @ts-expect-error
                  <p className='error-message'>{errors.accountHolderName.message}</p>
                ) : (
                  <p></p>
                )}
              </div>
              <div className='form-group' style={{ position: 'relative' }}>
                <label>Account Number:</label>
                <input {...register('accountNumber')} type='number' className='form-control' />
                {errors?.accountNumber ? (
                  // eslint-disable-next-line
                  // @ts-expect-error
                  <p className='error-message'>{errors.accountNumber.message}</p>
                ) : (
                  <p></p>
                )}
              </div>
              <div className='form-group' style={{ position: 'relative' }}>
                <label>IFSC Code:</label>
                <input {...register('ifscCode')} type='text' className='form-control' />
                {errors?.ifscCode ? (
                  // eslint-disable-next-line
                  // @ts-expect-error
                  <p className='error-message'>{errors.ifscCode.message}</p>
                ) : (
                  <p className='error'></p>
                )}
              </div>
              <button type='submit' className='btn btn-primary'>
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddAccountModalPari
