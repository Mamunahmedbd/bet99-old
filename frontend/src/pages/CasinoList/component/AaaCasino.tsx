import { isMobile } from 'react-device-detect'
import Limitinfo from './_common/limitinfo'
import CasinoPnl from './casinoPnl'
import LaybackBox from './_common/new/LaybackBox'
import ButtonItem from './_common/new/ButtonItem'
import CardItem from './_common/new/CardItem'
import LayBackButton from './_common/new/LayBackButton'

const AaaCasino = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const cardMarketIndex: any = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const laybacklayout = () => {
    const markets = liveMatchData?.defaultMarkets?.[0]?.Runners || []
    return (
      <div className='card-content aaa-content m-t-10'>
        <div className='row'>
          <div className='col-12 text-right'>
            <Limitinfo nameString={'layback'} min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} clsName={'tx-right'} />
          </div>
        </div>
        <div className='row'>
          {markets.map((Item: any, index: number) => {
            let runner = 'A'
            runner = Item.RunnerName == 'Akbar' ? 'B' : runner
            runner = Item.RunnerName == 'Anthony' ? 'C' : runner
            return (
              <div className='col-4 text-center' key={index}>
                <div>
                  <span className='d-block'>
                    <b>
                      <span className='text-danger'>{runner}.</span> {Item.RunnerName}
                    </b>
                  </span>
                </div>
                <LaybackBox selectionid={Item.SelectionId} title={runner} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                <div className='tx-16 mt30'>
                  <CasinoPnl sectionId={Item.SelectionId} matchId={liveMatchData.match_id} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  const laybacklayoutmobile = () => {
    const markets = liveMatchData?.defaultMarkets?.[0]?.Runners || []
    return <div className="row row5 mt--30">
      <div className={"col-12 mb-10"}>
      <table className="table coupon-table table table-bordered btabl-casino">
        <thead >
          <tr >
            <th colSpan={3} style={{ textAlign: "left" }}>
              MIN : 100 Max : 300000
            </th>
          </tr>
        </thead>
        <tbody >
          {markets.map((Item: any, key: number) => {
            let runner = "A";
            runner = Item.RunnerName == "Akbar" ? 'B' : runner;
            runner = Item.RunnerName == "Anthony" ? 'C' : runner;
            const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}

            const clsstatus =
            ItemMarket.gstatus == 'SUSPENDED' || ItemMarket.gstatus == 'CLOSED' ? 'suspended' : ''
            return <tr data-title="SUSPENDED" key={key} className={clsstatus}>
              <td className={"box-6 "}><b ><span className="tx-red">{runner}.</span> {Item.RunnerName}</b>
                <CasinoPnl sectionId={Item.SelectionId} matchId={liveMatchData.match_id} />
              </td>
              <LayBackButton selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'box-2'} />
            </tr>
          })}
        </tbody>
      </table>
    </div>
    </div>
  }

  const buttonLayout = (classData: string, marketIndex: any) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.filter((ItemN: any, index: number) => marketIndex.indexOf(index) > -1) || []
    return (
      finalMarketList.map((Item: any, key: number) => {
        const market = Item?.Runners?.[0] || {}
        let title = market.RunnerName == 'Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : market.RunnerName;
        title = market.RunnerName == 'Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
        return (
          <>
            {' '}
            <div key={key} className={`${classData} text-center`}>
            <div className='row m-b-10'>
                <div className='col-12 text-center'>
                <ButtonItem selectionid={market.SelectionId} title={title} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                <div className='m-t-5 m-b-5' >
                    <CasinoPnl sectionId={market.SelectionId} matchId={liveMatchData.match_id} />
                  </div>
                </div>
                </div>
            </div>
          </>
        )
      })
    )
  }
  const singleCard = (MarketName: any, marketIndex: any) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.filter((ItemN: any, index: number) => marketIndex.indexOf(index) > -1) || []
    const firstMarket = finalMarketList?.[7]?.Runners?.[0] || {}
    const ItemMarket: any = lastOdds?.[firstMarket?.SelectionId] || {}

    return (
      <>
        <div className='col-lg-12 col-12'>
          <h4 className='m-b-0 text-center text-uppercase'>
            {MarketName}
            {ItemMarket?.b1}
          </h4>
        </div>
        <div className='card-dt col-lg-12  col-12 text-center m-t-10 card-seven'>
          {finalMarketList.map((Item: any, key: number) => {
            const market = Item?.Runners?.[0] || {}
            const runName = market.RunnerName
            return (
              <div className='m-r-5 card-image d-inline-block' key={key}>
                <CardItem selectionid={market.SelectionId} title={runName} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                <div>
                  <div className='m-t-5'>
                    <CasinoPnl sectionId={market.SelectionId} matchId={liveMatchData.match_id} />
                  </div>
                </div>
              </div>
            )
          })
          }
        </div>
      </>
    )
  }
  return (
    <div>
      {!isMobile ? laybacklayout() : ''}
      {isMobile ? laybacklayoutmobile() : ''}
    <div className='card-content  m-t-10'>
      <div className='row m-t-10 '>
        <div className='col-4 ' style={{paddingRight:"5px"}}>
          <div className='aaa-content'>
            <div className='text-right'>
             <Limitinfo nameString={'oddeven'} min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} clsName={'tx-right'} />
            </div>
            {buttonLayout('', [1])}
            {buttonLayout('', [2])}
          </div>
        </div>
        <div className='col-4' style={{paddingRight:"5px", paddingLeft:"5px"}}>
          <div className='aaa-content'>
            <div className='text-right'>
            <Limitinfo nameString={'redblack'} min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} clsName={'tx-right'} />
            </div>
            {buttonLayout('', [3])}
            {buttonLayout('', [4])}

          </div>
        </div>
        <div className='col-4' style={{paddingLeft:"5px"}}>
          <div className='aaa-content'>
            <div className='text-right'>
            <Limitinfo nameString={'underseven'} min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} clsName={'tx-right'} />
            </div>
            {buttonLayout('', [5])}
            {buttonLayout('', [6])}
         </div>
        </div>
      </div>
      </div>
      <div className='card-content aaa-content m-t-10'>
        <div className='row row5'>
          <div className='col-12'>
            <div className='text-right'>
            <Limitinfo nameString={'limitinfo'} min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} clsName={'tx-right'} /> 
            </div>
          </div>
        </div>
        <div className='row row5 m-t-10'>{singleCard('', cardMarketIndex)}</div>
      </div> 
    </div>
  )
}
export default AaaCasino
