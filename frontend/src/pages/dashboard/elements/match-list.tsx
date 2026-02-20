import React from 'react'
import LMatch from '../../../models/LMatch'
import moment from 'moment'
import { dateFormat } from '../../../utils/helper'

interface MatchListProps {
  matchList: LMatch[];
  currentMatch: (match: LMatch) => void;
  memoOdds: (marketId: string | null) => React.ReactNode;
}
const MatchList: React.FC<MatchListProps> = ({ matchList, currentMatch, memoOdds }) => {
  return (
    <div className='card-content'>
      <table className='table coupon-table'>
        <thead>
          <tr>
            <th style={{ width: '63%' }}>Game</th>
            <th colSpan={2}>1</th>
            <th colSpan={2}>X</th>
            <th colSpan={2}>2</th>
          </tr>
        </thead>
        <tbody>
          {matchList.map((match: LMatch, index: number) => {
            const marketId =
              match?.markets && match?.markets?.length > 0 ? match?.markets[0].marketId : null
            return (
              <tr key={match.matchId}>
                <td>
                  <div className='game-name'>
                    <button
                      onClick={() => currentMatch(match)}
                      className='text-dark'
                      style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 'inherit' }}
                    >
                      {match.name} / {moment(match.matchDateTime).format(dateFormat)}
                    </button>
                  </div>
                  <div className='game-icons'>
                    <span className='game-icon'>
                      {new Date(match.matchDateTime).getTime() < new Date().getTime() && (
                        <span className='active' />
                      )}
                    </span>

                    <span className='game-icon'>
                      <i className='fas fa-tv v-m icon-tv' />
                    </span>

                    <span className='game-icon'>
                      {match.isFancy && (
                        <img
                          src='https://dzm0kbaskt4pv.cloudfront.net/v2/static/front/img/icons/ic_fancy.png'
                          className='fancy-icon'
                          alt="Fancy"
                        />
                      )}
                    </span>
                    <span className='game-icon'>
                      {match.isBookMaker && (
                        <img
                          src='https://dzm0kbaskt4pv.cloudfront.net/v2/static/front/img/icons/ic_bm.png'
                          className='bookmaker-icon'
                          alt="Bookmaker"
                        />
                      )}
                    </span>
                    <span className='game-icon'>
                      {match.isT10 && (
                        <img
                          src='imgs/game-icon.svg'
                          className='bookmaker-icon'
                          style={{ height: '16px' }}
                          alt="Game Icon"
                        />
                      )}
                    </span>
                  </div>
                </td>
                {memoOdds(marketId)}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default MatchList