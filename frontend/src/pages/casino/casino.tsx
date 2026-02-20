import { AxiosResponse } from 'axios'
import React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { useDispatch } from 'react-redux'
// import CasinoListItem from '../CasinoList/CasinoListItem'
import casinoService from '../../services/casino.service'
import {
  selectCasinoMatchList,
  setHomePageCasinoMatch,
} from '../../redux/actions/casino/casinoSlice'
import CasinoListItem2 from '../CasinoList/CasinoListItem2'
import { casinoNavItems } from '../../utils/constants'
import { useParams, useSearchParams } from 'react-router-dom'
import { CustomLink } from '../_layout/elements/custom-link'

const Casino = () => {
  const dispatch = useDispatch()
  const gamesList = useAppSelector<any>(selectCasinoMatchList)
  const [searchParams] = useSearchParams();
  const queryp = useParams();
  const category = searchParams.get("category")
  console.log(queryp)
  console.log(category)
  React.useEffect(() => {
    if (gamesList.length <= 0)
      casinoService.getCasinoList().then((res: AxiosResponse<any>) => {
        dispatch(setHomePageCasinoMatch(res.data.data))
      })
  }, [category, dispatch, gamesList.length])
  return (
    <>
      <div className='container-fluid container-fluid-5 cas-in-list'>
        <div className='row row5'>
          <div className='col-xl-2 d-none d-xl-flex ' style={{ marginTop: "5px" }}>
            <ul className="nav nav-pills casino-sub-tab">
              {casinoNavItems.map((Item: any, key: number) => {
                return <li className="nav-item" key={key}>
                  <CustomLink className={`nav-link ${Item.name === category || (!category && Item.name === "All Casino") ? 'active' : ""}`} to={`/casino-in/live-dmd?category=${Item.name}`}><span>{Item.name}</span></CustomLink>
                </li>
              })}
            </ul>

          </div>
          <div className='col-xl-10 col-12'>
            <div className='casino-list mt-2' style={{ marginLeft: "-6px" }}>
              <CasinoListItem2 />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Casino
