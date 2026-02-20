import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { betPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import { useState } from 'react'
import CasinoPnl from './casinoPnl'
import { isMobile } from 'react-device-detect'
import Limitinfo from './_common/limitinfo'

const Casinowar = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState("1")
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const cardImageUrl = 'https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/';
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.b1 : item.l1)
    const odds = oddVal.toString()
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === 'SUSPENDED' || item.gstatus === '0') return
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
            selectionName: item?.nation || item?.RunnerName || item?.nat,
            selectionId: parseInt(item.sid),
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData?.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData?.slug,
          },
        }),
      )
    }
  }
  const laybacklayout = (from: number, to: number) => {
    const clsnamehead = isMobile ? 'box-6' : 'box-4'
    const clsnamename = isMobile ? 'box-4' : 'box-1'
    const heightdata = '';
    const market = liveMatchData?.defaultMarkets || []
    return (
      ['Winner', 'Black', 'Red', 'Odd', 'Even', 'Spade', 'Club', 'Heart', 'Diamond'].map((ItemNew: any, key: number) => {
        let title = ItemNew =='Black' ? <span>{ItemNew} {isMobile?activeTab:''} <img src={`imgs/casino/club.png`} style={{ width: '25px' }} /><img src={`imgs/casino/spade.png`} style={{ width: '25px' }} /></span>:`${ItemNew} ${isMobile?activeTab:''} `;
         title = ItemNew =='Red' ? <span>{ItemNew} {isMobile?activeTab:''} <img src={`imgs/casino/diamond.png`} style={{ width: '25px' }} /><img src={`imgs/casino/heart.png`} style={{ width: '25px' }} /></span>:title;
        return <tr key={key} className={`${heightdata}`}>
          <td className={clsnamehead} style={{paddingLeft:"10px", paddingRight:"10px"}}>
            <div className='d-flex' style={{ justifyContent: 'space-between' }}>
              {key>4 ? 
              <b>
                <img src={`imgs/casino/${ItemNew.toLowerCase()}.png`} style={{ width: '25px' }} />
              </b>
              : title }
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </div>
          </td>
          {['1', '2', '3', '4', '5', '6'].map((ItemFake: any, keyFake: number) => {
            const mfull =
              ItemFake == 'D'
                ? 'Dragon'
                : ItemFake == 'L'
                  ? 'Lion'
                  : ItemFake == 'T'
                    ? 'Tiger'
                    : ItemFake
            const runnerFilter = market.filter(
              (ItemCheckMarket: any) =>
                ItemCheckMarket.MarketName == `${ItemNew} ${ItemFake}` ||
                ItemCheckMarket.MarketName == ItemNew ||
                ItemCheckMarket.MarketName == `${mfull} ${ItemNew}`,
            )[0]?.Runners?.[0] || []
            const Item: any = lastOdds?.[runnerFilter.SelectionId] || {}
            const clsstatus =
              !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' || Item.gstatus === '0'
                ? 'suspended'
                : ''
            return (
              !isMobile || ItemFake == activeTab ? <td className={`back teen-section ${clsnamename}`} key={keyFake}>
                <button className={`back ${clsstatus}`} onClick={() => onBet(true, Item)}>
                  <span className='odd'>{Item.b1}</span>{' '}
                  {runnerFilter && <CasinoPnl
                    sectionId={runnerFilter.SelectionId}
                    matchId={liveMatchData.match_id}
                    clsName={'text-center'}
                  />}
                </button>
              </td> : ""
            )

          })}
        </tr>
      })
    )
  }

  return (
    <div className='container ' style={{ marginTop: "-10px" }}>
      <div className='row casino-32A '>
          {lastOdds && isMobile? <div className='col-lg-12 col-12 main-market' style={{ padding: '0px' }}><div className='card-inner card-dtl-mobile'> <div className='d-flex'>
            <div>
              <img
              style={{width:"25px"}}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C1}.png`}
              />
            </div>
            <div>
              <img
              style={{width:"25px"}}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C2}.png`}
              />
            </div>
            <div>
              <img
              style={{width:"25px"}}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C3}.png`}
              />
            </div>
            <div>
              <img
              style={{width:"25px"}}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C4}.png`}
              />
            </div>
            <div>
              <img
              style={{width:"25px"}}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C5}.png`}
              />
            </div>
            <div>
              <img
              style={{width:"25px"}}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C6}.png`}
              />
            </div>
          </div></div></div> : ""}
          {isMobile ? <div className='col-lg-12 col-12 m-b-10 main-market' style={{ padding: '0px' }}><div className="home_mobile">
            <div className="mobile-header-for-casino">
              <ul className="nav nav-tabs">
                <li className="nav-item" style={{width:"16.5%", display:"inline-flex", textAlign:"center"}}><a onClick={() => setActiveTab('1')} data-toggle="tab" href="#1" className={activeTab === '1' ? "nav-link active" : "nav-link"}>1</a></li>
                <li className="nav-item" style={{width:"16.5%", display:"inline-flex", textAlign:"center"}}><a onClick={() => setActiveTab('2')} data-toggle="tab" href="#2" className={activeTab === '2' ? "nav-link active" : "nav-link"}>2</a></li>
                <li className="nav-item" style={{width:"16.5%", display:"inline-flex", textAlign:"center"}}><a onClick={() => setActiveTab('3')} data-toggle="tab" href="#3" className={activeTab === '3' ? "nav-link active" : "nav-link"}>3</a></li>
                <li className="nav-item" style={{width:"16.5%", display:"inline-flex", textAlign:"center"}}><a onClick={() => setActiveTab('4')} data-toggle="tab" href="#4" className={activeTab === '4' ? "nav-link active" : "nav-link"}>4</a></li>
                <li className="nav-item" style={{width:"17%", display:"inline-flex", textAlign:"center"}}><a onClick={() => setActiveTab('5')} data-toggle="tab" href="#5" className={activeTab === '5' ? "nav-link active" : "nav-link"}>5</a></li>
                <li className="nav-item" style={{width:"17%", display:"inline-flex", textAlign:"center"}}><a onClick={() => setActiveTab('6')} data-toggle="tab" href="#6" className={activeTab === '6' ? "nav-link active" : "nav-link"}>6</a></li>
              </ul>
            </div>
          </div></div> : ""}
        <div className={`col-lg-12 col-12 m-b-10 main-market  ${!isMobile ? 'bg-gray' : ''}`} style={{ padding: isMobile ? '3px' : '0px' }}>
          <div className='live-poker'>
            <table className={`table coupon-table table table-bordered suspendwidth ${isMobile ? 'bg-gray' : ''}`}>
              {!isMobile ? <thead>
                
                <tr style={{background:"#fff"}}>
                  <th className={'box-4'}></th>
                  <th className={`${'box-1'}`} style={{border:"none"}}> <img src={`${cardImageUrl}${lastOdds?.['cards']?.C1 || 1}.png`} style={{width:"35px"}}/></th>
                  <th className={`${'box-1'}`}> <img src={`${cardImageUrl}${lastOdds?.['cards']?.C2 || 1}.png`} style={{width:"35px"}}/></th>
                  <th className={`${'box-1'}`}> <img src={`${cardImageUrl}${lastOdds?.['cards']?.C3 || 1}.png`} style={{width:"35px"}}/></th>
                  <th className={`${'box-1'}`}> <img src={`${cardImageUrl}${lastOdds?.['cards']?.C4 || 1}.png`} style={{width:"35px"}}/></th>
                  <th className={`${'box-1'}`}> <img src={`${cardImageUrl}${lastOdds?.['cards']?.C5 || 1}.png`} style={{width:"35px"}}/></th>
                  <th className={`${'box-1'}`}> <img src={`${cardImageUrl}${lastOdds?.['cards']?.C6 || 1}.png`} style={{width:"35px"}}/></th>
                </tr>
                <tr>
                  <th className={'box-4'}></th>
                  <th className={`${'box-1'}`}>1</th>
                  <th className={`${'box-1'}`}>2</th>
                  <th className={`${'box-1'}`}>3</th>
                  <th className={`${'box-1'}`}>4</th>
                  <th className={`${'box-1'}`}>5</th>
                  <th className={`${'box-1'}`}>6</th>
                </tr>
              </thead> : ""}
              <tbody>{laybacklayout(0, 4)}</tbody>
            </table>
          </div>
        </div>
      
      </div>
    </div>
  )
}
export default Casinowar
