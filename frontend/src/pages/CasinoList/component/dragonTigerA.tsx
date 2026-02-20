import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import CasinoPnl from './casinoPnl'
import ButtonItem from './_common/new/ButtonItem'
import Minmax from './_common/minmax'
import CardItem from './_common/new/CardItem'

const DragonTigerA = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const drgonCard: any = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const tigerCard: any = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];
  const [activeTab, setActiveTab] = useState("dragon")
  const singleCard = (MarketName: any, marketIndex: any) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.filter((ItemN: any, index: number) => marketIndex.indexOf(index) > -1) || []
    return (
      <>
        <div className='col-lg-12 col-12'>
          <h4 className='m-b-0 text-center text-uppercase'>
            {MarketName} &nbsp;
            {`12.00`}
          </h4>
        </div>
        <div className='card-dt col-lg-12  col-12 text-center m-t-10 card-seven'>
          {finalMarketList.map((Item: any, key: number) => {
            const market = Item?.Runners?.[0] || {}
            let runName = market.RunnerName ? market.RunnerName.replace('Tiger ', '') : market.RunnerName.replace('Dragon ', '')
            runName = runName ? runName.replace('Dragon ', '') : runName.replace('Dragon ', '')
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
  const buttonLayout = (classData: string, marketIndex: any) => {
    const finalMarketList = liveMatchData?.defaultMarkets?.filter((ItemN: any, index: number) => marketIndex.indexOf(index) > -1) || []
    return (
      finalMarketList.map((Item: any, key: number) => {
        const market = Item?.Runners?.[0] || {}
        let title = market.RunnerName == 'Dragon Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : market.RunnerName;
        title = market.RunnerName == 'Dragon Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
        title = market.RunnerName == 'Tiger Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
        title = market.RunnerName == 'Tiger Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : title;
        return (
          <>
            {' '}
            <div key={key} className={`${classData} text-center`}>
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
            </div>
          </>
        )
      })
    )
  }

  return (
    <div>
      <div className='d-t-box m-b-10 buttonsuspended'>
        <div className='row row6'>
          {buttonLayout('col-lg-3 col-4', [0, 1, 2])}
          {buttonLayout('col-lg-3 col-12', [3])}
          <Minmax min={liveMatchData.min} max={liveMatchData.max} />
        </div>
      </div>
      {isMobile ? <div className="home_mobile">
        <div className="mobile-header-for-casino">
          <ul className="nav nav-tabs">
            <li className="nav-item"><a onClick={() => setActiveTab('dragon')} data-toggle="tab" href="#dragon" className={activeTab === 'dragon' ? "nav-link active" : "nav-link"}>Dragon</a></li>
            <li className="nav-item"><a onClick={() => setActiveTab('tiger')} data-toggle="tab" href="#tiger" className={activeTab === 'tiger' ? "nav-link active" : "nav-link"}>Tiger</a></li>
          </ul>
        </div>
      </div> : ""}
      <div className='row row5'>
        {isMobile && activeTab === "dragon" || !isMobile ? <div className='col-lg-6 col-12'>
          <div className='d-t-box m-b-10 buttonsuspended'>
            <div className='row row6'>
              <div className='col-12'>
                <h4 className='m-b-0 text-center text-uppercase'>Dragon</h4>
              </div>
              {buttonLayout('col-lg-6 col-6 mb-10 mt-10', [4, 5])}
              {buttonLayout('col-lg-6 col-6', [6, 7])}
              <Minmax min={liveMatchData.min} max={liveMatchData.max} />

            </div>
          </div>
        </div> : ""}
        {isMobile && activeTab === "tiger" || !isMobile ?
          <div className='col-lg-6 col-12'>
            <div className='d-t-box m-b-10 buttonsuspended'>
              <div className='row '>
                <div className='col-12'>
                  <h4 className='m-b-0 text-center text-uppercase'>Tiger</h4>
                </div>
                {buttonLayout('col-lg-6 col-6 mb-10 mt-10', [21, 22])}
                {buttonLayout('col-lg-6 col-6', [23, 24])}
                <Minmax min={liveMatchData.min} max={liveMatchData.max} />

              </div>

            </div>

          </div> : ""}
      </div>
      <div className='row row5'>
        {isMobile && activeTab === "dragon" || !isMobile ? <div className='col-lg-6 col-12'>
          <div className='d-t-box m-b-10 buttonsuspended'>
            <div className='row'>
              {singleCard('Dragon', drgonCard)}
            </div>
          </div>
        </div> : ""}
        {isMobile && activeTab === "tiger" || !isMobile ? <div className='col-lg-6 col-12'>
          <div className='d-t-box m-b-10 buttonsuspended'>
            <div className='row'>
              {singleCard('Tiger', tigerCard)}
            </div>
          </div>
        </div> : ""}
      </div>
    </div>
  )
}
export default DragonTigerA
