import React from 'react'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import depositWithdrawService from '../../services/deposit-withdraw.service'

const AddUpiModalPari = ({ onSuccess }: { onSuccess: () => void }) => {
  const validationSchema = Yup.object().shape({
    upiId: Yup.string().required('UPI Id is required'),
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(validationSchema) })

  const onSubmit = async (data: any) => {
    if (data) {
      const response = await depositWithdrawService.addUpiAccount({ upiId: data?.upiId })
      if (response?.data?.data?.success) {
        onSuccess()
        toast.success('UPI Id successfully added.')
        reset()
        // eslint-disable-next-line
        //@ts-expect-error
        window.$('#upiModal').modal('hide')
      }
    }
  }
  return (
    <div
      className='modal fade popupcls'
      id='upiModal'
      tabIndex={-1}
      role='dialog'
      aria-labelledby='upiModalCenterTitle'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-login-new' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='upiModalCenterTitle'>
              Add UPI Detail
            </h5>
            <button type='button' className='btn-close loginpop' data-dismiss='modal' aria-label='Close'>
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='form-group mb-10' style={{ position: 'relative' }}>
                <label>UPI ID:</label>
                <input type='text' className='form-control' {...register('upiId')} />
                {errors?.upiId && (
                  // eslint-disable-next-line
                  // @ts-expect-error
                  <p className='error'>{errors.upiId.message}</p>
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

export default AddUpiModalPari
