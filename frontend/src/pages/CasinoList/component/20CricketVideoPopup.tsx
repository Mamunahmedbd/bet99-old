import React, { useEffect, useState } from 'react'
import { IApiStatus } from '../../../models/IApiStatus'
import { selectMarketBook, selectPlaceBet } from '../../../redux/actions/bet/betSlice'
import { useAppSelector } from '../../../redux/hooks'

const CricketVideoPopup20 = ({ data, checkRoundIdChange, betCount }: any) => {
  const [showVideoPopup, setShowVideoPopup] = useState<boolean>(false)
  const [showBallPopup, setShowBallPopup] = useState<boolean>(false)
  const [showBallPopupClass, setShowBallPopupClass] = useState<string>('')
  const [ball, setBall] = useState('')

  const getPlaceBet = useAppSelector(selectPlaceBet)

  const getMarketBook: any = useAppSelector(selectMarketBook)
  React.useEffect(() => {
    if (getPlaceBet.status === IApiStatus.Done) {
      setBall(`${+getPlaceBet.bet.selectionId + 1}`)
      setShowBallPopup(true)
      setShowBallPopupClass('bounce-enter-active')
      setTimeout(() => {
        setShowBallPopupClass('bounce-leave-active')
      }, 3000)
    }
  }, [getPlaceBet.status])

  useEffect(() => {
    setShowVideoPopup(true)
    setTimeout(() => {
      setShowVideoPopup(false)
    }, 3000)
  }, [])

  useEffect(() => {
    if (data && data['1']) {
      if (data['1'].mid != checkRoundIdChange) {
        setShowVideoPopup(true)
        setShowBallPopup(false)
        setTimeout(() => {
          setShowVideoPopup(false)
        }, 3000)
      }

      if (betCount == 0 && data['1'].gstatus == 'SUSPENDED' && !showBallPopup) {
        setBall('0')
        setShowBallPopup(true)
        setShowBallPopupClass('bounce-enter-active')
        setTimeout(() => {
          setShowBallPopupClass('bounce-leave-active')
        }, 3000)
      }
    }
  }, [data && data?.cards])

  return (
    <>
      {showVideoPopup && (
        <div className='video-tv-popup'>
          <div className='text-center'>
            <img
              src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/cc-banner.jpg'
              className='img-fluid cc-banner-img'
            />
          </div>{' '}
          <div className='cc-banner-container'>
            <div className='cc-banner-container-inner'>
              <div className='container-fluid'>
                <div className='row row5'>
                  <div className='col-6'>
                    <div className='d-inline-block text-center'>
                      <h4 className='mb-0'>Team A</h4>{' '}
                      <span className='d-block'>
                        {data?.cards?.C2}/{data?.cards?.C3}
                      </span>{' '}
                      <span className='d-block'>{data?.cards?.C4} Over</span>
                    </div>
                  </div>{' '}
                  <div className='col-6 text-right'>
                    <div className='d-inline-block text-center'>
                      <h4 className='mb-0'>Team B</h4>{' '}
                      <span className='d-block'>
                        {data?.cards?.C5}/{data?.cards?.C6}
                      </span>{' '}
                      <span className='d-block'>{data?.cards?.C7} Over</span>
                    </div>
                  </div>
                </div>{' '}
                <div className='row row5 mt-1'>
                  <div className='col-12 text-center'>
                    <h5>Team B Need 12 Runs to WIN Match. If The Score is Tie Team B will WIN.</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>{' '}
          <div className='cc-banner-ball'>
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball2.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball3.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball4.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball5.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball6.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball7.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball8.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball9.png' />{' '}
            <img src='https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball10.png' />
          </div>
        </div>
      )}
      {showBallPopup && showBallPopupClass != 'bounce-leave-active' && (
        <div className={`placebet-run ${showBallPopupClass}`}>
          <img
            src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/mobile/img/balls/ball${ball}.png`}
          />
        </div>
      )}

      {Object.keys(getMarketBook).length > 0 && (
        <div className='cricket20books'>
          {Object.keys(getMarketBook).map((book, index) => (
            <div key={`book-${index}`}>
              {index + 1} -&gt;
              <span className={`${getMarketBook[book] < 0 ? 'text-danger' : 'text-success'}`}>
                {getMarketBook[book]}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default CricketVideoPopup20
