import React, { Fragment } from 'react'
import LMatch from '../../../models/LMatch'
import moment from 'moment'
import { dateFormat } from '../../../utils/helper'
import { useLocation } from 'react-router-dom'

const MatchListMobile = (props: any) => {
  const location = useLocation()

  return (
    <div
      className='card-content mobile-match'
      style={
        location.pathname.includes('in-play') ? { maxHeight: '300px', overflowY: 'scroll' } : {}
      }
    >

      <table className='table coupon-table coupon-table-mobile'>
        <tbody>
          {props.matchList.length > 0 ? (
            props.matchList.map((match: LMatch, index: number) => {
              const marketId =
                match?.markets && match?.markets?.length > 0 ? match?.markets[0].marketId : null
              return (
                <Fragment key={match.matchId}>
                  <tr>
                    <td colSpan={4}>
                      <div className='game-name'>
                        <button
                          onClick={() => props.currentMatch(match)}
                          className='text-edark'
                          style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}
                        >
                          {match.name}
                        </button>
                        <p className='tx-666 tx-12' style={{ marginTop: '3px' }}>
                          {moment(match.matchDateTime).format(dateFormat)}
                        </p>
                      </div>
                    </td>
                    <td colSpan={2}>
                      <div className='game-icons' style={{ paddingRight: '0px' }}>
                        {new Date(match.matchDateTime).getTime() < new Date().getTime() && (
                          <span className='game-icon'>
                            <i className='fas fa-circle v-m icon-circle tx-green' />
                          </span>
                        )}
                        <span className='game-icon'>
                          <i className='fas fa-tv v-m icon-tv' />
                        </span>
                        {match.isFancy && (
                          <span className='game-icon'>
                            <img
                              src='https://dzm0kbaskt4pv.cloudfront.net/v2/static/front/img/icons/ic_fancy.png'
                              className='fancy-icon'
                              alt="Fancy"
                            />
                          </span>
                        )}
                        {match.isBookMaker && (
                          <span className='game-icon'>
                            <img
                              src='https://dzm0kbaskt4pv.cloudfront.net/v2/static/front/img/icons/ic_bm.png'
                              className='bookmaker-icon'
                              alt="Bookmaker"
                            />
                          </span>
                        )}
                        {match.isT10 && (
                          <span className='game-icon'>
                            <img
                              src='imgs/game-icon.svg'
                              className='bookmaker-icon'
                              style={{ height: '16px' }}
                              alt="Game Icon"
                            />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr className='min-h-10 '>
                    <td className='ln10' colSpan={6}>
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className='text-center p5 fw-600 tx-12'>
                      1
                    </td>
                    <td colSpan={2} className='text-center p5 fw-600 tx-12'>
                      X
                    </td>
                    <td colSpan={2} className='text-center p5 fw-600 tx-12'>
                      2
                    </td>
                  </tr>
                  <tr>{props.memoOdds(marketId)}</tr>
                  <tr className='min-h-10 border-bottom'>
                    <td className='ln10' colSpan={6}>
                      &nbsp;
                    </td>
                  </tr>
                  <tr className='min-h-10'>
                    <td className='ln10' colSpan={6}>
                      &nbsp;
                    </td>
                  </tr>
                </Fragment>
              )
            })
          ) : (
            <tr>
              <td className='text-center bg-gray p10'>No Match Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
export default React.memo(MatchListMobile)
