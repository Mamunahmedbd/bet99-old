import React from 'react'
import ReactModal from 'react-modal'

const TransactionPasswordModel = (props: any) => {
  return (
    <>
   
      <ReactModal
        isOpen={props.isOpen}
        onRequestClose={(e: any) => {
          props.setIsOpen(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog'}
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h5>Transaction Password</h5>
            <button onClick={() => props.setIsOpen(false)} className='close float-right'>
              <i className='fa fa-times-circle' aria-hidden='true'></i>
            </button>
          </div>
          <div className='modal-body'>
            <p style={{ fontSize: '24px', marginBottom: '10px', color: 'green' }}>
              Success! Your password has been updated successfully
            </p>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>
              Your Transaction Password is :{' '}
              <strong style={{ color: 'green' }}>{props.transpass}</strong>
            </p>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              Please remember this transaction password, from now on all transaction of the website
              can be done only with this password and keep one thing in mind, do not share this
              password with anyone.{' '}
            </p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              Thank you, Team {'diamondecxh99.com'}
            </p>
            <p style={{ fontSize: '24px', marginBottom: '10px', color: 'green' }}>
              Success! आपका पासवर्ड बदला जा चुका है
            </p>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>
              आपका लेनदेन पासवर्ड : <strong style={{ color: 'green' }}>{props.transpass}</strong> है
            </p>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              कृपया इस लेन-देन के पासवर्ड को याद रखे, अब से वैबसाइट के सभी हसतानंतरण इस पासवर्ड से
              किए जा सकते है और एक बात का ध्यान रखे, इस पासवर्ड को किसी के साथ सांझा ना करे|{' '}
            </p>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              धन्यवाद, टीम {'diamondecxh99.com'}
            </p>
          </div>
        </div>
      </ReactModal>
    </>
  )
}
export default React.memo(TransactionPasswordModel)
