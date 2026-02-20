import { RoleType } from "../../../../models/User"
import { selectCasinoCurrentMatch } from "../../../../redux/actions/casino/casinoSlice"
import { selectUserData } from "../../../../redux/actions/login/loginSlice"
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks"
import authService from "../../../../services/auth.service"
import { betPopup } from '../../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from "../../../../models/IBet"
import CasinoPnl from "../casinoPnl"

const ButtonLayout = (props: any) => {
  const { key, market, rate } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.b1 : item.l1);
    const odds = oddVal>0?`1.${oddVal}`:"0"
    if (userState.user.role === RoleType.user) {
      if(parseFloat(odds)<=0 || item.gstatus==='SUSPENDED') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: getCurrentMatch?.match_id || 0,
            selectionName: item?.nation || item?.RunnerName || item?.nat,
            selectionId: item.selectionId,
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: getCurrentMatch.title,
            betOn: IBetOn.CASINO,
            gtype: 'Tp1Day',
          },
        }),
      )
    }
  }
  const suspend = market.gstatus == '0' || market.gstatus == 'CLOSED' || market.gstatus == 'SUSPENDED' ? 'suspended' : ''
  const name = market.nat?market.nat:market.RunnerName;
  let title = name == 'Dragon Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : name;
  title = name == 'Dragon Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
  title = name == 'Tiger Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
  title = name == 'Tiger Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : title;

  return (
    <div key={key} >
              <div className='row'>
                <div className='col-12 text-center'>
                  <b>{rate}</b>
                  <div className='info-block text-left' style={{float:"right"}}>
                      <a
                        href=''
                        data-toggle='collapse'
                        data-target='#min-max-info4'
                        aria-expanded='false'
                        className='info-icon collapsed'
                      >
                        <i className='fas fa-info-circle m-l-10'></i>
                      </a>
                      <div id='min-max-info4' className='min-max-info collapse'>
                        <span className='m-r-5'>
                          <b>Min:</b>
                          {market.min}
                        </span>{' '}
                        <span className='m-r-5'>
                          <b>Max:</b>
                          {market.max}
                        </span>
                      </div>
                    </div>
                </div>
              </div>
              <div className='row m-t-10'>
                <div className='col-12 text-center suspendwidth'>
                  <button
                    className={`text-uppercase btn-theme ${suspend}`}
                    onClick={() => onBet(true, market)}
                  >
                    <b>{title}</b>
                  </button>
                </div>
              </div>
              <div className='row'>
                <div className='col-12 text-center'>
                  <div className='m-t-5' style={{ marginTop: '10px' }}>
                    <CasinoPnl sectionId={market.SelectionId} matchId={getCurrentMatch.match_id} />
                  </div>
                </div>
              </div>
            </div>
  )
}
export default ButtonLayout
