import { isMobile } from 'react-device-detect'
import CasinoPnl from './casinoPnl'
import ButtonItem from './_common/new/ButtonItem'
import LaybackBox from './_common/new/LaybackBox'
import CardItem from './_common/new/CardItem'
import Limitinfo from './_common/limitinfo'
import LayBackButton from './_common/new/LayBackButton'

const BollywoodCasino = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const cardMarketIndex: any = [6, 7, 8, 9];
  const laybacklayout = (index: any, className: string) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.[index]?.Runners || []
    return (
      finalMarketList.map((ItemNew: any, index: number) => {
        let runner = 'A'
        runner = ItemNew.RunnerName == 'Amar Akbar Anthony' ? 'B' : runner
        runner = ItemNew.RunnerName == 'Sahib Bibi Aur Ghulam' ? 'C' : runner
        runner = ItemNew.RunnerName == 'Dharam Veer' ? 'D' : runner
        runner = ItemNew.RunnerName == 'Kis KisKo Pyaar Karoon' ? 'E' : runner
        runner = ItemNew.RunnerName == 'Ghulam' ? 'F' : runner
        return (
          <div className={`${className} text-center mb-10`} key={index}>
            <div>
              <span className='d-block'>
                <b>
                  <span className='text-danger'>{runner}.</span> {ItemNew.RunnerName}
                </b>
              </span>
            </div>
            <LaybackBox selectionid={ItemNew.SelectionId} title={runner} lastOdds={lastOdds} liveMatchData={liveMatchData} />
            <div className='tx-16 mt30'>
              <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData.match_id} />
            </div>
          </div>
        )
      })
    )
  }
  const laybacklayoutmobile = (keyType: number) => {
    return liveMatchData?.defaultMarkets?.[keyType]?.Runners?.map((ItemNew: any, key: number) => {
      const Item: any =lastOdds?.[ItemNew.SelectionId] || {}
      let runner = "A";
      runner = ItemNew.RunnerName == "Amar Akbar Anthony" ? 'B' : runner;
      runner = ItemNew.RunnerName == "Sahib Bibi Aur Ghulam" ? 'C' : runner;
      runner = ItemNew.RunnerName == "Dharam Veer" ? 'D' : runner;
      runner = ItemNew.RunnerName == "Kis KisKo Pyaar Karoon" ? 'E' : runner;
      runner = ItemNew.RunnerName == "Ghulam" ? 'F' : runner;
      const clsstatus = !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' ? "suspended" : "";
      return <tr data-title="SUSPENDED" key={key} className={clsstatus}>
        <td className={"box-6  "} style={{paddingLeft:"3px"}}><b ><span className="tx-red">{runner}</span>. {ItemNew.RunnerName}</b>
          <CasinoPnl sectionId={ItemNew?.SelectionId || 0} matchId={liveMatchData?.match_id} />
        </td> 
        <LayBackButton selectionid={ItemNew.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'box-2'} />
     </tr>
    })
  }

  const className3 = isMobile ? 'col-12 ' : 'col-6'
  const capitalizeString = (str: any) => {
    return str && str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  const singleCard = (MarketName: any, marketIndex: any) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.filter((ItemN: any, index: number) => marketIndex.indexOf(index) > -1) || []
    return (
      <>
        <div className='col-lg-12 col-12'>
          <p className='m-b-0 text-center text-uppercase' style={{display:"flex", alignItems:"center", justifyContent:"space-around"}}>
          <div>{MarketName} {`3.75`}</div>
            <Limitinfo nameString={"cards"} min={liveMatchData.min} max={liveMatchData.max} />
            </p>
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

  const buttonLayout = (marketIndex:any) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.filter((ItemN: any, index: number) => marketIndex.indexOf(index) > -1) || []
    return finalMarketList.map((ItemNew: any, index: number) => {
      const market = ItemNew?.Runners?.[0] || {}
      let title = market.RunnerName == 'Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : market.RunnerName;
      title = market.RunnerName == 'Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
      return (
        <>
          <div className='row m-t-10'>
            <div className='col-12 text-center'>
            <ButtonItem selectionid={market.SelectionId} title={title} lastOdds={lastOdds} liveMatchData={liveMatchData} />
            </div>
          </div>
          <div className='row'>
            <div className='col-12 text-center'>
              <div className='m-t-5' style={{ marginTop: '10px' }}>
                <CasinoPnl sectionId={market.SelectionId} matchId={liveMatchData.match_id} />
              </div>
            </div>
          </div>
        </>
      )
    })
  }
  const layoutForMobile = () => {
    return <div className='mobile-layout' >
      <table className="table coupon-table table table-bordered btabl-casino">
            <thead >
              <tr >
                <th colSpan={3} style={{ textAlign: "left", paddingLeft:"3px" }} >
                  MIN : {liveMatchData?.min} Max : {liveMatchData?.max}
                </th>
              </tr>
            </thead>
            <tbody >
              {laybacklayoutmobile(0)}
            </tbody>
          </table>
          <table className="table coupon-table table table-bordered btabl-casino">
            <thead >
              <tr >
                <th colSpan={3} style={{ textAlign: "left", paddingLeft:"3px" }}>
                  MIN : {liveMatchData?.min} Max : {liveMatchData?.max}
                </th>
              </tr>
            </thead>
            <tbody >
              {laybacklayoutmobile(1)}
            </tbody>
          </table>
          <div className='row row5'>
          <div className='col-lg-12'>
       <div className='aaa-content m-t-10'>
          <div className='row row5'>
              <div className='col-6'>
              <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl6"} clsName={"tx-right"}/>
                <div className='text-center m-t-5'>{buttonLayout([4])}</div>
              </div>
              <div className='col-6'>
              <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl7"} clsName={"tx-right"}/>

                <div className='text-center m-t-5'>
                  <div className='text-center '>
                    {buttonLayout([5])}
                  </div>
                </div>
              </div>
              </div>
              </div>
            </div>
            </div>
  </div>
  }
  const layoutForDesktop = () => {
    return <div className='desktop-layout'>
      <div className='aaa-content m-t-10 mb-10'>
        <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl8"} clsName={"tx-right"}/>
  <div className='row'>
          {laybacklayout(0, 'col-lg-4')}
        </div>
      </div>
      <div className='row row5 mb-10'>
        <div className={` col-lg-4 aaa-content`}>
        <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl3"} clsName={"tx-right"}/>
            {laybacklayout(1, '')}
        </div>
        <div className={`col-lg-8 aaa-content col-12`}>
             <div className='row'>
              <div className='col-6'>
              <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl2"} clsName={"tx-right"}/>
                <div className='text-center m-t-5'>{buttonLayout([4])}</div>
              </div>
              <div className='col-6'>
              <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl5"} clsName={"tx-right"}/>
                <div className='text-center m-t-5'>
                  <div className='text-center '>
                    {buttonLayout([5])}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  }

  return (<>
    {!isMobile ? layoutForDesktop() : ""}
    {isMobile ? layoutForMobile() : ""}
   <div className='row row5  m-b-10 mt-10'>
      <div className={'col-lg-6 aaa-content col-12'} >
           <Limitinfo min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} nameString={"lbl"} clsName={"tx-right"}/>
          <div className='row row5'>
            <div className='col-6'>
              <div className='text-center'>{buttonLayout([2])}</div>
            </div>
            <div className='col-6'>
              <div className='text-center '>{buttonLayout([3])}</div>
            </div>
          </div>
       </div>
      <div className={`${className3} aaa-content ${isMobile ? 'mt-10' : ''}`} >
        <div className='  mn-height-137' style={{minHeight:isMobile?"137px":''}}>
          {singleCard('Cards', cardMarketIndex)}
        </div>
      </div>
    </div>
  </>
  )
}
export default BollywoodCasino
