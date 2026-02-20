import React, { useCallback } from 'react'
import IMarket from '../../models/IMarket'
import LFancy from '../../models/LFancy'
import sportsService from '../../services/sports.service'
import { useParams } from 'react-router-dom'
import IMatch from '../../models/IMatch'
import { IUserBetStake } from '../../models/IUserStake'
import { useDispatch } from 'react-redux'
import { betPopup, selectFancyType } from '../../redux/actions/bet/betSlice'
import IBet from '../../models/IBet'
import { setCurrentMatch } from '../../redux/actions/sports/sportSlice'
import Score from './components/score'
import { useWebsocketUser } from '../../context/webSocketUser'
import { useAppSelector } from '../../redux/hooks'
import { selectUserData } from '../../redux/actions/login/loginSlice'
import { isMobile } from 'react-device-detect'
import MatchDetail from './components/match-detail'
import MatchDetailMobile from './components/match-detail-mobile'
import axios from 'axios'
import { RoleType } from '../../models/User'
import authService from '../../services/auth.service'
import { selectInitApp } from '../../redux/actions/common/commonSlice'

type MarketData = {
  markets: IMarket[]
  fancies: LFancy[]
  currentMatch: IMatch
  stake: IUserBetStake
}

const Odds = () => {
  const [marketDataList, setMarketDataList] = React.useState<MarketData>({} as MarketData)
  const { currentMatch, markets, fancies } = marketDataList
  const [t10Channel, setT10Chanel] = React.useState<any>()
  const [isTvShow, setIsTvShow] = React.useState<boolean>(false)
  const userState = useAppSelector(selectUserData)
  const { matchId } = useParams()
  const dispatch = useDispatch()
  const selectFancyT = useAppSelector(selectFancyType)
  const initApp = useAppSelector(selectInitApp)

  const { socketUser } = useWebsocketUser()

  const fetchOddsDetail = useCallback(async () => {
    try {
      axios
        .all([
          sportsService.getMatchById(matchId!),
          sportsService.getMarketList(matchId!),
          sportsService.getFancyList(matchId!),
        ])
        .then(
          axios.spread((currentMatched, marketDataed, fancyDataed) => {
            dispatch(setCurrentMatch(currentMatched.data.data.match))
            setMarketDataList({
              currentMatch: currentMatched.data.data.match,
              fancies: fancyDataed.data.data,
              markets: marketDataed.data.data.markets,
              stake: currentMatched.data.data.stake,
            })
          }),
        )
    } catch (error) {
      console.log(error)
      // fetchOddsDetail() // Avoid infinite recursion
    }
  }, [matchId, dispatch])

  React.useEffect(() => {
    return () => {
      dispatch(betPopup({ isOpen: false, betData: {} as IBet }))
    }
  }, [dispatch])

  React.useEffect(() => {
    if (initApp.event) {
      sportsService
        .getFancyList(matchId!, selectFancyT)
        .then((fancyData) => {
          //setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
        })
        .catch((e) => console.log(e.message))
    }
  }, [initApp.event, matchId, selectFancyT])

  React.useEffect(() => {
    fetchOddsDetail()
  }, [matchId, fetchOddsDetail])

  const fetchT10Stream = useCallback(async () => {
    if (currentMatch?.isT10) {
      const resp = await authService.gett10Streams()
      if (resp?.data) {
        const dataFilter = resp?.data?.filter(
          (Item: any) => parseInt(Item.gameId) === currentMatch?.matchId,
        )
        setT10Chanel(dataFilter?.[0]?.channel)
      }
    }
  }, [currentMatch?.isT10, currentMatch?.matchId])

  React.useEffect(() => {
    ; (async () => {
      if (selectFancyT && Object.keys(marketDataList).length > 0) {
        const fancyData = await sportsService.getFancyList(matchId!, selectFancyT)
        setMarketDataList(prev => ({ ...prev, fancies: fancyData.data.data }))
      }
    })()
  }, [selectFancyT, matchId, marketDataList])

  React.useEffect(() => {
    if (userState.user._id) {
      socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
      socketUser.on('connect', () => {
        socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
      })
    }
  }, [userState.user._id, matchId, socketUser])

  React.useEffect(() => {
    fetchT10Stream()
  }, [fetchT10Stream])

  const scoreBoard = () => {
    if (currentMatch && currentMatch.sportId === '4333')
      return <Score matchId={currentMatch?.matchId} isT10={currentMatch?.isT10 || false} />
    else if (currentMatch)
      return (
        <iframe
          title="Scoreboard"
          style={{ width: '100%', height: 'auto' }}
          src={`https://score.hr08bets.in/api?eventid=${currentMatch?.matchId}`}
        ></iframe>
      )
  }

  const t10Tv = (height: string) => {
    if (currentMatch && currentMatch.isT10)
      return (
        <div className='t10-iframe'>
          <iframe
            title="T10 TV"
            style={{ height: `${height}px` }}
            src={`https://alpha-n.qnsports.live/route/rih.php?id=${t10Channel}`}
          ></iframe>
        </div>
      )
    else return <div />
  }

  const otherTv = () => {
    const tvUrl =
      currentMatch && currentMatch.sportId === '4'
        ? 'https://hr08bets.in/sports-stream-live/index.html?eventid='
        : 'https://hr08bets.in/sports-stream-live/index.html?eventid='
    return (
      !currentMatch?.isT10 && (
        <div className='card m-b-10' style={{ border: '0px none' }}>
          {!isMobile ? (
            <div className='card-header'>
              <h6 onClick={() => setIsTvShow(!isTvShow)} className='card-title'>
                Live Match
                <span className='float-right'>
                  <i className='fa fa-tv' /> live stream started
                </span>
              </h6>
            </div>
          ) : (
            ''
          )}
          {!isMobile && isTvShow && (
            <div className='card-body p0'>
              <iframe
                title="Live Stream"
                style={{ width: '100%', height: '250px' }}
                src={`${tvUrl}${currentMatch?.matchId}`}
              ></iframe>
            </div>
          )}
          {isMobile && (
            <div className='card-body p0'>
              <iframe
                title="Mobile Live Stream"
                style={{ width: '100%', height: '250px' }}
                src={`${tvUrl}${currentMatch?.matchId}`}
              ></iframe>
            </div>
          )}
        </div>
      )
    )
  }


  return !isMobile || (isMobile && userState?.user?.role !== RoleType.user) ? (
    <MatchDetail
      currentMatch={currentMatch}
      fancies={fancies}
      scoreBoard={scoreBoard}
      marketDataList={marketDataList}
      matchId={matchId}
      markets={markets}
      t10Tv={t10Tv}
      otherTv={otherTv}
    />
  ) : (
    <MatchDetailMobile
      currentMatch={currentMatch}
      fancies={fancies}
      scoreBoard={scoreBoard}
      marketDataList={marketDataList}
      matchId={matchId}
      t10Tv={t10Tv}
      markets={markets}
      otherTv={otherTv}
    />
  )
}
export default React.memo(Odds)
