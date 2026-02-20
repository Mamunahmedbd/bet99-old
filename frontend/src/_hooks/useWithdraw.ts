import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import depositWithdrawService from '../services/deposit-withdraw.service'
import { useEffect, useState } from 'react'

type WithdrawInput = {
  amount: number
  bankDetail: string
  remark: string
  type: string
  accountType: string
}

const validationSchema = Yup.object().shape({
  amount: Yup.string().required('Amount is required'),
  bankDetail: Yup.object().required('Select one option from bank details or Upi').nullable(),
})

const useWithdraw = () => {
  const [bankUpiLists, setBankUpiLists] = useState({ upi: [], bank: [] })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WithdrawInput>({ resolver: yupResolver(validationSchema) })

  useEffect(() => {
    getBankAndUpiList()
  }, [])

  const getBankAndUpiList = () => {
    depositWithdrawService?.getBankAndUpiLists().then((res) => setBankUpiLists(res?.data?.data))
  }

  const handleDelete = (type: string, id: any) => {
    depositWithdrawService?.deleteUpiBank({ type: type, id: id }).then(() => {
      getBankAndUpiList()
    })
  }

  const onSubmit: SubmitHandler<WithdrawInput> = async (data) => {
    data.remark = 'ok'
    data.type = 'withdraw'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    data.accountType = data?.bankDetail?.accountHolderName ? 'bank' : 'upi'

    console.log('data...', data)
    if (data.bankDetail) {
      const response = await depositWithdrawService.addDepositWithdraw(data)
      if (response?.data?.message) {
        toast.success(response?.data?.message)
        reset()
      }
    }
  }

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setValue,
    bankUpiLists,
    handleDelete,
    getBankAndUpiList,
  }
}

export default useWithdraw
