import React, { MouseEvent } from 'react'
import { isMobile } from 'react-device-detect'
import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
import { useAppSelector } from '../../redux/hooks'
import ICasinoMatch from '../../models/ICasinoMatch'
import { useNavigateCustom } from '../_layout/elements/custom-link'
import { toast } from 'react-toastify'
const CasinoListItem = (props: any) => {
  const gamesList = useAppSelector<any>(selectCasinoMatchList)
  const navigate = useNavigateCustom()
  const casinoWidth = isMobile ? 'col-3' : 'col11'

  const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
    e.preventDefault()
    if (!Item.isDisable && Item.match_id!=-1 ) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
      else toast.warn('This game is suspended by admin, please try again later')
  }
  return (
    <>
          {gamesList &&
            gamesList.map((Item: any, key: number) => {
              return (
                <div className={"casino-list-item"} key={key}>
                  <a href='#' onClick={(e) => onCasinoClick(e, Item)} className=''>
                      <div className="casino-list-item-banner" 
                        style={{ backgroundImage: `url(${Item.image})`}}>
                      </div>
                      <div className='casino-list-name'>{Item.title}</div>
               
                  </a>
                </div>
              )
            })}
    </>
  )
}
export default React.memo(CasinoListItem)
