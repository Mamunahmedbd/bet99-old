import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import depositWithdrawService from '../../../../services/deposit-withdraw.service'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'

const RejectedModal = ({ show, close, data }: { show: boolean; close: () => void; data: any }) => {
  const location = useLocation()
  const [rejectedMessage, setRejectedMessage] = useState('')
  const handleChange = (e: any) => {
    setRejectedMessage(e.target.value)
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const obj = {
      id: data._id,
      narration: rejectedMessage,
      balanceUpdateType: location.pathname == '/depositstatement' ? 'D' : 'W',
      status: 'rejected',
    }
    const response = await depositWithdrawService.updateDepositWithdrawStatus(obj)
    try {
      if (response?.data) {
        toast.success(response?.data?.message)
      }
    } catch (error) {
      toast.error(response?.data?.message)
    }
  }
  return (
    <Modal show={show} onHide={close}>
      <div className='modal-header'>
        <h5 className='modal-title' id='rejectedModalCenterTitle'>
          Rejected Reason
        </h5>
        <button type='button' className='close' onClick={close}>
          <span aria-hidden='true'>×</span>
        </button>
      </div>
      <div className='modal-body'>
        <form className='container-fluid' onSubmit={handleSubmit}>
          <div className='row m-b-20'>
            <div className='col-md-12'>
              <input type='text' placeholder='Enter Message' onChange={handleChange} />
            </div>
          </div>
          <div>
            <button type='submit' className='btn btn-secondary' onClick={close}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default RejectedModal
