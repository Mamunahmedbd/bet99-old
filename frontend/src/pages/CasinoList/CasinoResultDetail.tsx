/* eslint-disable */
import React, { Component, useState } from 'react'
import { Modal, Card } from 'react-bootstrap'
import casinoService from '../../services/casino.service'
const CasinoResultDetail = (props: any) => {
  const { popupdata, setPopStatus, popupstatus } = props
  const [casinoResult, setCasinoResult] = useState<any>({})
  const [loader, setLoader] = useState<boolean>(false)

  React.useEffect(() => {
    setCasinoResult({})
    setLoader(true)
    if (popupdata.slug && popupdata.slug) {
      casinoService.getResultByMid(popupdata.slug, popupdata.mid).then((res) => {
        setLoader(false)
        setCasinoResult(res?.data?.data)
        if (popupdata.slug === 'Andarbahar' || popupdata.slug === 'Andarbahar2') {
          // @ts-ignore
          globalThis.$('.owl-carousel').owlCarousel({
            rtl: true,
            loop: true,
            margin: 10,
            dots: false,
            responsiveClass: true,
            responsive: {
              0: {
                items: popupdata.slug === 'Andarbahar2' ? 3 : 8,
                nav: true,
              },
              1000: {
                items: 10,
                nav: true,
                loop: false,
              },
            },
          })
        }
      })
    }
  }, [props.popupdata])
  return (
    <Modal
      show={popupstatus}
      onHide={() => setPopStatus(false)}
      size='lg'
      className='casino-result-modal'
    >
      <Modal.Header className='text-white bg'>
        <div className='bg w-100 d-flex flex-row justify-content-between'>
          <h4 className='text-white mb-0' style={{ width: '100%' }}>
            {' '}
            {popupdata?.event_data?.title || ''}
            <span style={{ float: 'right' }}>
              <i
                className='fa fa-times text-white'
                aria-hidden='true'
                onClick={() => setPopStatus(false)}
                style={{ cursor: 'pointer', fontSize: '24px' }}
              />
            </span>
          </h4>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* <h6 className="text-right round-id">Round Id:  {popupdata?.mid || ''}</h6> */}
        {loader ? (
          <div className='text-center'>
            <i className='mx-5 fas fa-spinner fa-spin'></i>
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: casinoResult?.html || '' }}
            className={popupdata.slug}
          />
        )}
      </Modal.Body>
    </Modal>
  )
}

export default React.memo(CasinoResultDetail)
