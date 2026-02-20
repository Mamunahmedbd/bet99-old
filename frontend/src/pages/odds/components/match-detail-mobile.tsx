/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Fragment } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import MyBetComponent from './my-bet.component'
import moment from 'moment'
import MatchOdds from './match-odds'
import PlaceBetBox from './place-bet-box'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectBetCount } from '../../../redux/actions/bet/betSlice'
import Fancy from './fancy'
import { useWebsocketUser } from '../../../context/webSocketUser'

const MatchDetailWrapper = (props: any) => {
  const dispatch = useAppDispatch()
  const betCount = useAppSelector(selectBetCount)
  const [tavstatus, settvstatus] = React.useState<boolean>(false)
  const { socketUser } = useWebsocketUser()

  // React.useEffect(() => {
  //   return () => {
  //     dispatch(setBetCount(0))
  //   }
  // }, [])

  return (
    <>
      <div className='prelative'>
        <Tabs>
          <Tab eventKey='home' title='ODDS'>
            <div className='game-heading clsforellipse'>
              <span className='card-header-title giveMeEllipsis'>{props.currentMatch?.name}</span>
              <span className='float-right card-header-date'>
                {moment(props.currentMatch?.matchDateTime).format('MM/DD/YYYY  h:mm a')}
              </span>
            </div>
            {props.scoreBoard()}
            {tavstatus && props.otherTv()}
            {props.t10Tv(250)}

            <div className='markets'>
              {/* Score Component Here */}
              <div className='main-market'>
                {props.markets && <MatchOdds data={props.markets} />}
              </div>
            </div>
            <br />
            {props.fancies && props.currentMatch && props.currentMatch.sportId == '4' && (
              <Fragment>
                {/* @ts-expect-error */}
                {<Fancy socketUser={socketUser} fancies={props.fancies} matchId={props.matchId!} />}
              </Fragment>
            )}
            {props.marketDataList.stake && <PlaceBetBox stake={props.marketDataList.stake} />}
          </Tab>
          <Tab eventKey='profile' title={`PLACED BET (${betCount})`}>
            <div className='card m-b-10 my-bet'>
              <div className='card-header'>
                <h6 className='card-title d-inline-block'>My Bet</h6>
              </div>
              <div className='card-body'>
                <MyBetComponent />
              </div>
            </div>
          </Tab>
        </Tabs>
        <div className='csmobileround' style={{ top: '16px' }}>
          <span onClick={() => settvstatus(tavstatus ? false : true)}>
            <i className='fa fa-tv'></i>{' '}
          </span>
        </div>
      </div>
    </>
  )
}

export default React.memo(MatchDetailWrapper)
