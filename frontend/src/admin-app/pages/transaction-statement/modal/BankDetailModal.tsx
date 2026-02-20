import React from 'react'

const BankDetailModal = ({ bankDetails }: { bankDetails: any }) => {
  return (
    <div
      className='modal fade'
      id='bankModal'
      tabIndex={-1}
      role='dialog'
      aria-labelledby='bankModalCenterTitle'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-lg modal-login-new' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='bankModalCenterTitle'>
              Details
            </h5>
            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='modal-body'>
            {bankDetails.imageUrl ? (
              <div className='container-fluid'>
                <div className='row m-b-20'>
                  <div className='col-md-12'>
                    <img
                      src={`${process.env.REACT_APP_SITE_URL}${bankDetails.imageUrl}`}
                      alt='image'
                      style={{ height: 'auto', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className='container-fluid'>
                <div className='row m-b-20'>
                  <div className='col-md-6'>
                    <label className='deposite-user-first'>Account Holder Name :</label>
                  </div>
                  <div className='col-md-6'>
                    <label className='deposite-user-first' style={{ textTransform: 'capitalize' }}>
                      {bankDetails?.accountHolderName}
                    </label>
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-6'>
                    <label className='deposite-user-first'>Account Number :</label>
                  </div>
                  <div className='col-md-6'>
                    <label className='deposite-user-first' style={{ textTransform: 'capitalize' }}>
                      {bankDetails?.accountNumber}
                    </label>
                  </div>
                </div>
                <div className='row m-b-20'>
                  <div className='col-md-6'>
                    <label className='deposite-user-first'>IFSC Code :</label>
                  </div>
                  <div className='col-md-6'>
                    <label className='deposite-user-first' style={{ textTransform: 'capitalize' }}>
                      {bankDetails?.ifscCode}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankDetailModal
