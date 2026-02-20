import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import depositWithdrawService from '../services/deposit-withdraw.service'

type DepositInput = {
  amount: number
  imageUrl: string
  utrno: number
}

const validationSchema = Yup.object().shape({
  amount: Yup.number().required('Amount is required'),
  imageUrl: Yup.string().required('Fill this field.'),
  utrno: Yup.number().required('Fill this field.'),
})

const useDeposit = () => {
  const [amount, setAmount] = useState(null)
  const [bankUpiLists, setBankUpiLists] = useState<any>({})
  const [preview, setPreview] = useState({ type: '', imagePath: '', utrno:"" })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DepositInput>({ resolver: yupResolver(validationSchema) })

  useEffect(() => {
    depositWithdrawService.getPaymentSetting().then((res) => setBankUpiLists(res?.data?.data))
  }, [])

  const handleChange = (e: any) => {
    e.preventDefault()
    setAmount(e.target.value)
  }

  const handleUploadedFile = (event: any, type: string) => {
    const file = event.target.files[0]
    setPreview({ type, imagePath: file, utrno:preview.utrno })
  }

  const handleUploadedUTR = (event: any, type: string) => {
    const file = event.target.value
    console.log(file)
    setPreview({ type, imagePath: preview.imagePath, utrno:file})
  }
  const onSubmit = async (data: any) => {
    if (!preview.imagePath) return toast.error('Image is required field')
    const formData = new FormData()
    const amount = getValues('amount')
    formData.append('remark', 'ok')
    formData.append('type', 'deposit')
    formData.append('imageUrl', preview.imagePath)
    formData.append('accountType', preview.type)
    formData.append('amount', amount.toString())
    formData.append('utrno', preview.utrno)
    const response = await depositWithdrawService.addDepositWithdraw(formData)
    if (response?.data?.message) {
      toast.success(response?.data?.message)
      reset()
      setAmount(null)
      setPreview({ type: '', imagePath: '', utrno:"" })
    }
  }
  const generateTransactionId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
  };
  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setValue,
    amount,
    handleChange,
    bankUpiLists,
    handleUploadedFile,
    preview,
    generateTransactionId,
    handleUploadedUTR
  }
}

export default useDeposit
