/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Fragment, MouseEvent } from 'react'
import MatchOdds from './match-odds'
import { RoleType } from '../../../models/User'
import Fancy from './fancy'
import MyBetComponent from './my-bet.component'
import PlaceBetBox from './place-bet-box'
import moment from 'moment'
import { useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import BetLock from '../../../admin-app/pages/bet-lock/bet-lock'
import { Modal } from 'react-bootstrap'
import { useNavigateCustom } from '../../_layout/elements/custom-link'
import UnsetteleBetHistoryAdmin from '../../../admin-app/pages/UnsetteleBetHistory/UnsetteleBetHistoryAdmin'
import { useWebsocketUser } from '../../../context/webSocketUser'

const MatchDetail = (props: any) => {
  const userState = useAppSelector(selectUserData)
  const { socketUser } = useWebsocketUser()
  const [show, setShow] = React.useState(false)
  const navigate = useNavigateCustom()
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const showAllBet = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (userState.user.role !== RoleType.user) {
      handleShow()
      return
    }
    navigate.go('/unsettledbet')
  }
  return (
    <>
      <div
        className={userState.user.role !== RoleType.user ? ' admin-match-detail' : 'featured-box'}
      >
        <div className='row'>
          <div className={'col-8  sports-wrapper m-b-10 pr0'}>
            <div className='game-heading'>
              <span className='card-header-title'>{props.currentMatch?.name}</span>
              <span className='float-right card-header-date'>
                {moment(props.currentMatch?.matchDateTime).format('MM/DD/YYYY  h:mm a')}
              </span>
            </div>
            {props.scoreBoard()}
            {props.t10Tv(450)}

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
                <Fancy socketUser={socketUser} fancies={props.fancies} matchId={props.matchId!} />
              </Fragment>
            )}
          </div>
          {/* tab here */}
          <div id='sidebar-right' className='col-4 pl0 '>
            <div className='ps'>
              <div className='sidebar-right-inner'>
                {userState?.user?.role && userState.user.role !== RoleType.user && (
                  <BetLock markets={props.marketDataList.markets} />
                )}
                {props.otherTv()}
                {props.marketDataList.stake && <PlaceBetBox stake={props.marketDataList.stake} />}
                <div className='card m-b-10 my-bet'>
                  <div className='card-header'>
                    <h6 className='card-title d-inline-block'>My Bet</h6>
                    <a
                      href='#'
                      onClick={showAllBet}
                      className='card-title d-inline-block float-right'
                    >
                      View All
                    </a>
                  </div>
                  <div className='card-body'>
                    <MyBetComponent />
                  </div>
                </div>
                {/**/}
              </div>
              <div className='ps__rail-x' style={{ left: 0, bottom: 0 }}>
                <div className='ps__thumb-x' tabIndex={0} style={{ left: 0, width: 0 }} />
              </div>
              <div className='ps__rail-y' style={{ top: 0, right: 0 }}>
                <div className='ps__thumb-y' tabIndex={0} style={{ top: 0, height: 0 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose} size={'lg'}>
        <Modal.Header closeButton>
          <Modal.Title>Bets</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UnsetteleBetHistoryAdmin matchId={props.matchId!} hideHeader={true} />
        </Modal.Body>
      </Modal>
    </>
  )
}
export default React.memo(MatchDetail)
