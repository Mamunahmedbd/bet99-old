import React from 'react'
import ReactModal from 'react-modal';
const CasinoRulesDetail = (props:any) => {
    const { title, gameId, isOpen, setIsOpen } = props;
  return (
    <>
       
        <ReactModal
        isOpen={isOpen}
        onRequestClose={(e: any) => {
          setIsOpen(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog'}
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h5>{title} RULES</h5>
            <button onClick={() => setIsOpen(false)} className='close float-right'>
              <i className='fa fa-times-circle' aria-hidden='true'></i>
            </button>
          </div>
          <div className='modal-body'>
          <img src={`/imgs/rules/${gameId}.jpg`} className="wd-100" />
          </div>
        </div>
      </ReactModal>
    </>
  )
}
export default React.memo(CasinoRulesDetail)
