import React from 'react'
import CasinoPnl from './casinoPnl'
import Minmax from './_common/minmax'
import ButtonItem from './_common/new/ButtonItem'
import CardItem from './_common/new/CardItem'

const LuckSeven = (props: any) => {
    const { lastOdds, liveMatchData } = props
    const layout1 = () => {
        const eventData = liveMatchData?.defaultMarkets || []
        const market: any = eventData?.[0]?.Runners?.[0] || {}
        const market2: any = eventData?.[1]?.Runners?.[0] || {}
        return <div className="card-content lucky-seven-content m-b-10 col-12">
            <div className="row m-t-10">
                <div className="col-5 text-center">
                    <ButtonItem selectionid={market.SelectionId} title={market.RunnerName} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                    <CasinoPnl matchId={liveMatchData.match_id} sectionId={market.SelectionId} />
                </div>
                <div className="col-2 text-center card-seven">
                    <img src="/imgs/casino/cards/7all.jpg" className="card-seven-single" />
                </div>
                <div className="col-5 text-center">
                    <ButtonItem selectionid={market2.SelectionId} title={market2.RunnerName} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                    <CasinoPnl matchId={liveMatchData.match_id} sectionId={market2.SelectionId} />
                </div>
            </div>
            <div className="row m-t-10">
                <Minmax min={liveMatchData.min} max={liveMatchData.max} />
            </div>
        </div>
    }
    const layoutTwoMarket = (markets1: number, markets2: number) => {
        const market: any = liveMatchData?.defaultMarkets?.[markets1]?.Runners?.[0] || {}
        const market2: any = liveMatchData?.defaultMarkets?.[markets2]?.Runners?.[0] || {}

        let title = market.RunnerName == 'Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : market.RunnerName;
        title = market.RunnerName == 'Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;
        let title2 = market2.RunnerName == 'Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : market2.RunnerName;
        title2 = market2.RunnerName == 'Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title2;

        return <div className="lucky-seven-content m-b-10 col-6" style={{ padding: '10px' }}>
           
            <div className="row m-t-10">
                <div className="col-6 text-center">
                    <ButtonItem selectionid={market.SelectionId} title={title} lastOdds={lastOdds} liveMatchData={liveMatchData} />

                </div>
                <div className="col-6 text-center">
                    <ButtonItem selectionid={market2.SelectionId} title={title2} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                </div>
            </div>
            <div className="row">
                <div className="col-6 text-center">
                    <CasinoPnl matchId={liveMatchData.match_id} sectionId={market.SelectionId} />
                </div>
                <div className="col-6 text-center">
                    <CasinoPnl matchId={liveMatchData.match_id} sectionId={market2.SelectionId} />
                </div>
            </div>
            <div className="row">
                <Minmax min={liveMatchData.min} max={liveMatchData.max} />
            </div>
        </div>
    }
    const layout4 = () => {
        const market = liveMatchData?.defaultMarkets?.filter((Itemc: any) => Itemc.MarketName.includes('Card ')) || []
        return <div className="card-content lucky-seven-content m-b-10 col-12">
            <div className="row m-t-10">
                <div className="col-12 text-center  m-b-10"><b >12.00</b></div>
                <div className="col-12 text-center card-seven">
                    {market &&
                        market.map((ItemN: any, indexRunner: number) => {
                            const currentRunner: any = ItemN?.Runners?.[0] || {}
                            return <div className="d-inline-block" key={indexRunner}>
                                <CardItem selectionid={currentRunner.SelectionId} title={currentRunner.RunnerName} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                                <div >
                                    <CasinoPnl matchId={liveMatchData.match_id} sectionId={currentRunner.SelectionId} />
                                </div>
                            </div>
                        })
                    }
                </div>
                <Minmax min={liveMatchData.min} max={liveMatchData.max} />
            </div>
        </div>
    }
    return (
        <div>
            <div className="m-b-10 my-bet">
                <div className="new-casino">
                    <div className="row row6">
                        {layout1()}
                        {layoutTwoMarket(2, 3)}
                        {layoutTwoMarket(4, 5)}
                        {layout4()}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default React.memo(LuckSeven)
