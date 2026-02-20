import React from 'react'
import { isMobile } from 'react-device-detect'
import { IBetOn, IBetType } from '../../../../models/IBet'
import { IFancy } from '../../../../models/IFancy'
import IMatch from '../../../../models/IMatch'
import LFancy from '../../../../models/LFancy'
import { RoleType } from '../../../../models/User'
import { betPopup, selectMarketBook, setBookFancy } from '../../../../redux/actions/bet/betSlice'
import { selectLoader } from '../../../../redux/actions/common/commonSlice'
import { selectUserData } from '../../../../redux/actions/login/loginSlice'
import { selectCurrentMatch } from '../../../../redux/actions/sports/sportSlice'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'
import authService from '../../../../services/auth.service'
import Limitinfo from '../../../CasinoList/component/_common/limitinfo'
import PnlCalculate from '../pnl-calculate'
import { OddsType } from '../../../../models/IMarket'

export const FancyList = React.memo(
  ({ fancies, fancyUpdate }: { fancies: LFancy[]; fancyUpdate: Record<string, IFancy> }) => {
    const userState = useAppSelector(selectUserData)
    const loading = useAppSelector(selectLoader)
    const dispatch = useAppDispatch()
    const getCurrentMatch: IMatch = useAppSelector(selectCurrentMatch)
    const getMarketBook: any = useAppSelector(selectMarketBook)

    const onBet = (isBack = false, market: any) => {
      if (userState.user.role !== RoleType.user) return false

      if (market.BackPrice1 === 0 && isBack) return false
      if (market.LayPrice1 === 0 && !isBack) return false

      const ipAddress = authService.getIpAddress()
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: isBack ? market.BackPrice1 : market.LayPrice1,
            volume: isBack ? market.BackSize1 : market.LaySize1,
            marketId: market.marketId,
            marketName: 'Fancy',
            matchId: market.matchId,
            selectionName: market.RunnerName,
            selectionId: market.SelectionId,
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? market.BackPrice1 : market.LayPrice1,
            eventId: market.sportId,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: getCurrentMatch.name,
            betOn: IBetOn.FANCY,
            gtype: market.gtype,
            oppsiteVol: isBack ? market.LaySize1 : market.BackSize1,
            oddsType: OddsType.F,
          },
        }),
      )
    }

    return (
      <div className='table-body'>
        {fancies?.length > 0 &&
          fancies.map((fancy: LFancy) => {
            if (!fancy?.active) return null
            let updatedFancy: IFancy = {} as IFancy
            if (fancyUpdate[fancy.marketId]) {
              updatedFancy = fancyUpdate[fancy.marketId]
            }

            if (updatedFancy.LayPrice1 === undefined) return null

            return (
              <div key={fancy._id}>
                <div className='fancy-tripple fancy-tripple-box'>
                  <div
                    data-title={updatedFancy.GameStatus || fancy.GameStatus}
                    className={`table-row ${
                      fancy.isSuspend || updatedFancy.GameStatus ? 'suspended' : ''
                    }`}
                  >
                    <div
                      className='float-left country-name box-6'
                      style={{ borderBottom: '0px none' }}
                    >
                      <p className='m-b-0'>
                        <span
                          style={{
                            display: isMobile ? 'flex' : '',
                            justifyContent: isMobile ? 'space-between' : '',
                          }}
                        >
                          {fancy.fancyName}
                          {isMobile && (
                            <Limitinfo
                              nameString={fancy.marketId}
                              min={getCurrentMatch.inPlayFancyMinLimit}
                              max={getCurrentMatch.inPlayFancyMaxLimit}
                            />
                          )}
                        </span>
                        {getMarketBook && (
                          <span
                            style={{ textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.preventDefault()

                              dispatch(
                                setBookFancy({
                                  matchId: fancy.matchId,
                                  selectionId: updatedFancy.SelectionId,
                                  marketName: fancy.fancyName,
                                }),
                              )
                            }}
                            className={getMarketBook[fancy.marketId] >= 0 ? 'green' : 'red'}
                          >
                            {getMarketBook[fancy.marketId]}
                          </span>
                        )}
                        {/* {updatedFancy?.rem && <p className='tx-red'>{updatedFancy?.rem}</p>} */}
                      </p>

                      <p className='p5'>
                        {' '}
                        <PnlCalculate
                          marketId={fancy.marketId}
                          selectionId={updatedFancy.SelectionId}
                        />
                      </p>
                    </div>

                    <div
                      className={`${isMobile ? 'box-2' : 'box-1'} lay float-left text-center`}
                      onClick={() => onBet(false, { ...fancy, ...updatedFancy })}
                    >
                      <span className='odd d-block'>{updatedFancy.LayPrice1}</span>{' '}
                      <span>{updatedFancy.LaySize1}</span>
                    </div>
                    <div
                      className={`${isMobile ? 'box-2' : 'box-1'} back float-left text-center`}
                      onClick={() => onBet(true, { ...fancy, ...updatedFancy })}
                    >
                      <span className='odd d-block'>{updatedFancy.BackPrice1}</span>{' '}
                      <span>{updatedFancy.BackSize1}</span>
                    </div>
                    {!isMobile && (
                      <div
                        className='box-2 float-left text-right min-max'
                        style={{ borderBottom: '0px none' }}
                      >
                        <span className='d-block'>
                          Min: <span>{getCurrentMatch.inPlayFancyMinLimit}</span>
                        </span>
                        <span className='d-block'>
                          Max: <span>{getCurrentMatch.inPlayFancyMaxLimit}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {updatedFancy.rem && (
                  <div className='table-remark text-right'>
                    <p className='m-b-0'>{updatedFancy.rem}</p>
                  </div>
                )}
              </div>
            )
          })}{' '}
        {!loading && fancies?.length <= 0 && (
          <div key={0}>
            <div className='fancy-tripple bg-gray text-center p10'>No Real time Fancy Found</div>
          </div>
        )}
        {loading && (
          <div key={0} className='text-center m-1'>
            <i className='mx-5 fas fa-spinner fa-spin'></i>
          </div>
        )}
      </div>
    )
  },
)
