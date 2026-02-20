import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { betPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import CasinoPnl from './casinoPnl'
import { isMobile } from 'react-device-detect'
import { useCallback } from 'react'

const AndarBhar = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const cardNameValue: any = { J: 11, Q: 12, K: 13, A: 1 }

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = item.rate
    const odds = oddVal
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || !item.gstatus || item.gstatus === '0') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: parseInt(liveMatchData?.match_id) || 0,
            selectionName: `${item.nation}`,
            selectionId: item.sid,
            pnl: 0,
            stack: 0,
            currentMarketOdds: item.rate,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData?.slug,
          },
        }),
      )
    }
  }
  const laybacklayout = useCallback(
    (index: number) => {
      return liveMatchData?.defaultMarkets?.map((ItemNew: any, key: number) => {
        const t3Data = liveMatchData?.t3 ? liveMatchData?.t3[0] : {}
        const andarCardData = t3Data?.ar?.split(',')
        const baharCardData = t3Data?.br?.split(',')
        
        return (
          <>
            <tbody>
              {isMobile?<tr className={`${ItemNew.MarketName == 'Andar' ? 'Andar' : 'bahar'}`}>
              { (
                  <td >
                    <div id='nation1' className='p-title text-center' style={{marginBottom:"0px"}}>
                      {ItemNew.MarketName}
                    </div>
                  </td>
                )}
              </tr>:""}
              <tr className={`${ItemNew.MarketName == 'Andar' ? 'Andar' : 'bahar'}`}>
              { !isMobile && (
                  <td style={{width:"10%"}}>
                    <div id='nation1' className='p-title text-center' style={{marginBottom:"0px"}}>
                      {ItemNew.MarketName}
                    </div>
                  </td>
                )}
                                   <td id="andar-box" className={`text-center p5`} >
              <div className={isMobile?'row text-center justify-content-center ml-0':'d-flex justify-content-center'}>
                  {ItemNew.Runners.map((ItemCardsData: any, keyCardsData: number) => {
                    const Item: any = lastOdds?.[ItemCardsData?.SelectionId] || {}
                    let cardImage = ItemCardsData?.RunnerName?.replace('Bahar ', '')
                    cardImage = cardImage?.replace('Ander ', '')
                    cardImage = cardNameValue?.[cardImage] || cardImage
                    cardImage =
                      ItemNew.MarketName == 'Andar'
                        ? andarCardData?.[keyCardsData] || cardImage
                        : baharCardData?.[keyCardsData] || cardImage

                    return (
                      <>
                        <p>
                          <span
                            className='game-section m-r-5'
                            key={keyCardsData}
                            onClick={() => {
                              onBet(true, Item)
                            }}
                          >
                            <img
                              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/${cardImage}.jpg`}
                              className={`card-image`}
                              style={{marginBottom:"0px"}}
                            />
                          </span>
                          <CasinoPnl
                            sectionId={ItemCardsData?.SelectionId}
                            matchId={liveMatchData.match_id}
                            clsName={'text-center'}
                          />
                        </p>
                      </>
                    )
                  })}
                  </div>
                </td>
              </tr>
            </tbody>
          </>
        )
      })
    },
    [liveMatchData],
  )

  return (
    <div className='container teenpattixyz' style={{ marginTop: isMobile ? '-10px' : '' }}>
      <div className='row  '>
        <div className='col-lg-12 m-b-10 main-market ' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <div className='card-content m-b-5'>
              <table data-title='SUSPENDED' className={`table main-table table-bordered `}>
                <tbody>{laybacklayout(0)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AndarBhar
