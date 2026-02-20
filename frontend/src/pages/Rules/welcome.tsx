import React from 'react'
import ReactModal from 'react-modal'

const Welcome = (props: any) => {
  const [isOpen, setIsOpen] = React.useState(true)
  return (
    <>

      <ReactModal
        isOpen={isOpen}
        onRequestClose={(e: any) => {
          setIsOpen(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog modal-lg margin-modal'}
        ariaHideApp={false}
      >
        <div className='modal-content' style={{ margin: "0px" }}>
          <div className='modal-header'>
            <h5>Welcome to our exchange</h5>
            <button onClick={() => setIsOpen(false)} className='close float-right'>
              <i className='fa fa-times-circle' aria-hidden='true'></i>
            </button>
          </div>
          <div className='modal-body p0' style={{ height: "89vh" }}>
            <img src="https://sitethemedata.com/common/wel-banner/wel-1733052794189.png" className="img-fluid" alt="Welcome banner" />

          </div>
        </div>
      </ReactModal>
    </>
  )
}
export default React.memo(Welcome)
