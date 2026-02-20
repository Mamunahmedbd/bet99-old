import { AxiosResponse } from 'axios'
import React, { useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import LMatch from '../../models/LMatch'
import sportsServices from '../../services/sports.service'
import ISport from '../../models/ISport'
import { useAppSelector } from '../../redux/hooks'
import { selectSportList, setCurrentMatch } from '../../redux/actions/sports/sportSlice'
import IMatch from '../../models/IMatch'
import { useDispatch } from 'react-redux'
import { useNavigateCustom } from '../_layout/elements/custom-link'
import { useWebsocket } from '../../context/webSocket'
import GameTab from '../_layout/elements/game-tab'
import { isMobile } from 'react-device-detect'
import GameTabMobile from '../_layout/elements/game-tab-mobile'
import MatchList from './elements/match-list'
import MatchListMobile from './elements/match-list-mobile'
import CasinoListItem from '../CasinoList/CasinoListItem'
import casinoService from '../../services/casino.service'
import {
  selectCasinoMatchList,
  setHomePageCasinoMatch,
} from '../../redux/actions/casino/casinoSlice'
import Fav from '../_layout/elements/fav'

const Dashboard = () => {
  const [matchList, setMatchList] = React.useState<LMatch[]>([])
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList)
  const navigate = useNavigateCustom()
  const dispatch = useDispatch()
  const { socket } = useWebsocket()
  const [odds, setOdds] = React.useState<Record<string, Array<any>>>({})
  const location = useLocation()
  const gamesList = useAppSelector<any>(selectCasinoMatchList)

  const { sportId, status } = useParams()
  const marketIdsEvent = useCallback((data: any, oddsData: any, event: string) => {
    data.forEach((match: IMatch) => {
      match.markets?.forEach((market) => {
        if (market.marketName === 'Match Odds' && !odds[market.marketId]) {
          // setOdds((prevOdds) => ({
          //   ...prevOdds,
          //   [market.marketId]:Array(6).fill('-'),
          // }));
        }
        setTimeout(() => {
          socket.emit(event, market.marketId)
        }, 200)
      })
    })
  }, [odds, socket])

  React.useEffect(() => {
    sportsServices.getMatchList(sportId, status).then((res: AxiosResponse<any>) => {
      const oddsData = { ...odds }
      marketIdsEvent(res.data.data, oddsData, 'joinMarketRoom')
      setOdds(oddsData)
      setMatchList(res.data.data)
    })
    return () => {
      const oddsData = { ...odds }
      marketIdsEvent(matchList, oddsData, 'leaveMarketRoom')
    }
  }, [sportId, status, odds, matchList, marketIdsEvent])

  React.useEffect(() => {
    if (gamesList.length <= 0)
      casinoService.getCasinoList().then((res: AxiosResponse<any>) => {
        dispatch(setHomePageCasinoMatch(res.data.data))
      })
  }, [dispatch, gamesList.length])
  React.useEffect(() => {
    socket.on('getMarketData', (marketData) => {
      let firstIndexFirst = '-'
      let firstIndexTwo = '-'
      let secIndexFirst = '-'
      let secfirstIndexTwo = '-'
      let thirdIndexFirst = '-'
      let thirdfirstIndexTwo = '-'
      if (marketData.runners) {
        if (marketData.runners[0] && marketData.runners[0].ex.availableToBack[0]) {
          firstIndexFirst = marketData.runners[0].ex.availableToBack[0].price
          firstIndexTwo = marketData.runners[0].ex.availableToLay[0].price
        }

        if (marketData.runners[1] && marketData.runners[1].ex.availableToBack[0]) {
          secIndexFirst = marketData.runners[1].ex.availableToBack[0].price
          secfirstIndexTwo = marketData.runners[1].ex.availableToLay[0].price
        }

        if (marketData.runners[2] && marketData.runners[2].ex.availableToBack[0]) {
          thirdIndexFirst = marketData.runners[2].ex.availableToBack[0].price
          thirdfirstIndexTwo = marketData.runners[2].ex.availableToLay[0].price
        }
      }

      setOdds((prevOdds) => ({
        ...prevOdds,
        [marketData.marketId]: [
          firstIndexFirst,
          firstIndexTwo,
          thirdIndexFirst,
          thirdfirstIndexTwo,
          secIndexFirst,
          secfirstIndexTwo,
        ],
      }));
    })

    return () => {
      socket.off('getMarketData')
    }
  }, [socket])

  const memoOdds = useCallback(
    (marketId: any) => {

      if (!marketId) {
        return (
          <>
            <td><button className="back"><span className="odd">-</span></button></td>
            <td><button className="lay"><span className="odd">-</span></button></td>
            <td><button className="back"><span className="odd">-</span></button></td>
            <td><button className="lay"><span className="odd">-</span></button></td>
            <td><button className="back"><span className="odd">-</span></button></td>
            <td><button className="lay"><span className="odd">-</span></button></td>
          </>
        );
      }
      const marketData = odds[marketId]
      return (
        <>
          <td>
            <button className='back'>
              <span className='odd'>{(marketData && marketData[0]) || '-'}</span>
            </button>
          </td>
          <td>
            <button className='lay'>
              <span className='odd'>{(marketData && marketData[1]) || '-'}</span>
            </button>
          </td>
          <td>
            <button className='back'>
              <span className='odd'>{(marketData && marketData[2]) || '-'}</span>
            </button>
          </td>
          <td>
            <button className='lay'>
              <span className='odd'>{(marketData && marketData[3]) || '-'}</span>
            </button>
          </td>
          <td>
            <button className='back'>
              <span className='odd'>{(marketData && marketData[4]) || '-'}</span>
            </button>
          </td>
          <td>
            <button className='lay'>
              <span className='odd'>{(marketData && marketData[5]) || '-'}</span>
            </button>
          </td>
        </>
      )
    },
    [odds],
  )

  const currentMatch = (match: IMatch) => {
    dispatch(setCurrentMatch(match))
    navigate.go(`/odds/${match.matchId}`)
  }

  return (
    <>
      {' '}
      {isMobile ? <GameTabMobile sportId={sportId} sportListState={sportListState} /> : ''}
      <div className='pb-4 mtc-5'>
        {!isMobile ? <Fav /> : ""}
        {!isMobile ? <GameTab sportId={sportId} sportListState={sportListState} /> : ''}
        {/**/}
        <div className='tab-content'>
          <div className='tab-pane active'>
            <div className='matchlist coupon-card-first'>
              {!isMobile ? (
                <MatchList currentMatch={currentMatch} memoOdds={memoOdds} matchList={matchList} />
              ) : (
                <MatchListMobile
                  currentMatch={currentMatch}
                  memoOdds={memoOdds}
                  matchList={matchList}
                />
              )}
              {location.pathname.includes('in-play') || !isMobile ? (
                <div className='home-page'>
                  <div className='casino-list mt-2' style={{ marginLeft: !isMobile ? "-6px" : "" }}>
                    {/* <div className='section-title'>Live Casino</div> */}
                    <CasinoListItem />
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Dashboard
