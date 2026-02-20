import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { betPopup } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import React from 'react';
import CasinoPnl from './casinoPnl';
import { replacecardstring } from '../../../utils/helper';

const OpenTeen = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)

  const pushDataToPositions = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3, 4, 5, 6, 7]
      const finalString = data?.split('#') || []
      const dataArray: Array<string> = finalString && finalString[0] ? finalString[0].split(',').filter((d) => d !== '1') : []
      const indicesToRemove = [8, 16, 24];
      for (const index of indicesToRemove) {
        dataArray.splice(index, 1);
      }
      /// console.log(dataArray)
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 8

          if (index != 25) {

            const position: any = positions[positionIndex]
            acc[position].push(item)
          }
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
          '4': [],
          '5': [],
          '6': [],
          '7': [],
        },
      )
    },
    [lastOdds && lastOdds.cardsstring],
  )

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.rate : item.rate);
    const odds = oddVal.toString()
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === '0') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: liveMatchData?.event_data?.match_id || 0,
            selectionName: item.nation,
            selectionId: item.sid,
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData.slug,
          },
        }),
      )
    }
  }
  const laybacklayout = () => {
    const clsnamehead = 'box-4'
    const clsnamename = 'box-3'
    const heightdata = ''
    const cards = pushDataToPositions(lastOdds?.cardsstring || '')
    return (liveMatchData?.defaultMarkets?.map((ItemMarketLink: any, keyLink: number) => {
      return ItemMarketLink?.Runners?.map((ItemNew: any, key: number) => {
        const Item: any = lastOdds?.[ItemNew.SelectionId] || {}
        const clsstatus = !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' || Item.gstatus === '0' ? 'suspended' : ''
        const otherMarket = liveMatchData?.defaultMarkets?.[keyLink + 8]?.Runners[0] || {}
        const ItemOther: any = lastOdds?.[otherMarket.SelectionId] || {}
        const clsstatus2 =
          !ItemOther.gstatus || ItemOther.gstatus === 'SUSPENDED' || ItemOther.gstatus === 'CLOSED' || ItemOther.gstatus === '0' ? 'suspended' : ''
        return (
          keyLink < 8 && (
            <tr key={key} className={` ${heightdata} ${clsstatus}`}>
              <td className={clsnamehead} style={{ paddingLeft: "10px" }}>
                <b>{ItemNew.RunnerName}</b>
                {cards && cards[keyLink] && cards[keyLink].map((ItemCard: any, keyCard: any) => {
                  return <span key={keyCard} className={`card-icon ${keyCard == 0 ? 'm-l-20' : 'm-l-1'}`} style={{ display: "inline-flex", marginLeft: (keyCard == 0 ? '14px !important' : '1px !important') }}><span>{replacecardstring(ItemCard)}</span> {ItemCard.includes('CC') && <span className="card-black">]</span>} {ItemCard.includes('HH') && <span className="card-black">{"}"}</span>} {ItemCard.includes('DD') && <span className="card-red">{"{"}</span>} {ItemCard.includes('SS') && <span className="card-red">[</span>}</span>
                })}

              </td>
              <td className={`back teen-section ${clsnamename}`}>
                <button className='back' onClick={() => onBet(true, Item)}>
                  <span className='odd'>{Item.rate}</span>{' '}
                  <CasinoPnl sectionId={Item.sid} matchId={liveMatchData.match_id} classData={'text-center'} />
                </button>
              </td>
              <td className={`back teen-section box-3 `}>
                <button className='back' onClick={() => onBet(true, ItemOther)}>
                  <span className='odd'>
                    <b>{ItemOther.nation}</b>
                  </span>{' '}
                  <CasinoPnl sectionId={ItemOther.sid} matchId={liveMatchData.match_id} classData={'text-center'} />
                </button>
              </td>
            </tr>
          )
        )
      })
    })
    )
  }
  return (
    <div className='container '>
      <div className='row casino-32A '>
        <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <table className='table coupon-table table table-bordered suspendwidth'>
              <thead style={{ borderBottom: "0px" }}>
                <tr>
                  <th className={"box-4"}>
                  </th>
                  <th className={`back ${"box-3"}`}>Back (Min: {liveMatchData?.event_data?.min} Max: {liveMatchData?.event_data?.max})	</th>
                  <th className={`back ${"box-3"}`}>Min: {liveMatchData?.event_data?.min} Max: {liveMatchData?.event_data?.max}</th>
                </tr>
              </thead>
              <tbody>
                {laybacklayout()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default OpenTeen
