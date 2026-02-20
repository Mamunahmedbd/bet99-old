import { AxiosResponse } from 'axios'
import React from 'react'
import casinoService from '../../services/casino.service'
import { useParams, useSearchParams } from 'react-router-dom'
import { CustomLink } from '../_layout/elements/custom-link'
import CasinoListItemInt from '../CasinoList/CasinoListItemInt'
import authService from '../../services/auth.service'
import { isMobile } from 'react-device-detect'

const CasinoOther = () => {
  // const dispatch = useDispatch()
  // const gamesList = useAppSelector<any>(selectCasinoMatchList)
  const [searchParams] = useSearchParams();
  const queryp = useParams();
  const category = searchParams.get("category")
  const [games, setGames] = React.useState<any>([])
  const [provider, setProvider] = React.useState<any>([])
  const [categorylist, setCategoryList] = React.useState<any>([])
  const [gamePlay, setGamePlay] = React.useState<any>()
  const [gameUrl, setGameUrl] = React.useState<string>('')
  const [catName, setCatName] = React.useState<string>('')

  console.log(queryp)
  console.log(category)
  React.useEffect(() => {
    casinoService.getIntCasinoList(category, queryp.type).then((res: AxiosResponse<any>) => {
      ///dispatch(setHomePageCasinoMatch(res.data.data))
      const data = res.data
      setGames(data.result)
      setProvider(data.providers)
      setCategoryList(data.category)
      setCatName(data?.category?.["0"]?._id || "")
    })
  }, [category, queryp.type])

  React.useEffect(() => {
    if (gamePlay) {
      const payload: any = {
        gameCode: gamePlay.identifier,
        lobby_url: gamePlay.identifier,
        ipAddress: authService.getIpAddress(),
        isMobile: isMobile,
      }
      casinoService.getplaycasino(payload).then((res: AxiosResponse<any>) => {
        setGameUrl(res.data.data.url)
      })
    }
  }, [gamePlay])

  return (
    <>
      <div className='container-fluid container-fluid-5 cas-in-list'>
        <div className='row row5'>
          <div className='col-xl-2 d-none d-xl-flex ' style={{ marginTop: "5px" }}>
            <ul className="nav nav-pills casino-sub-tab">
              {provider.map((Item: any, key: number) => {
                return <li className="nav-item" key={key}>
                  <CustomLink className={`nav-link ${Item._id === category || (!category && key === 0) ? 'active' : ""}`} to={`/casino-int/${queryp.type}?category=${Item._id}`}><span>{Item._id}</span></CustomLink>
                </li>
              })}
            </ul>

          </div>
          <div className='col-xl-10 col-12'>
            <div className="casino-sub-tab-list" style={{ marginTop: "5px" }}>
              <ul className="nav nav-pills casino-sub-tab" id="casino-sub-tab">
                {categorylist?.map((Item: any, key: number) => {
                  return <li className="nav-item" key={key}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0 }}
                      className={`nav-link ${catName === Item._id ? 'active' : ''}`}
                      onClick={() => {
                        setCatName(Item._id)
                      }}
                    >
                      <span>{Item._id}</span>
                    </button>
                  </li>
                })}

              </ul>
            </div>
            <div className='casino-list mt-2' style={{ marginLeft: "-6px" }}>
              {games.length > 0 && <CasinoListItemInt games={games} setGamePlay={setGamePlay} />}
            </div>
          </div>
        </div>
      </div>
      {gamePlay?.game_name && <div className="slot-iframe show">
        <div className="slot-header">
          <div className="title"><h4 className='mb-0' style={{ fontSize: "20px", fontWeight: "400" }}>{gamePlay?.game_name}</h4></div>
          <div className="close-slot-frame" onClick={() => setGamePlay(undefined)}>EXIT</div>
        </div>
        <iframe title="Casino Game" scrolling="no" allow="fullscreen;" src={gameUrl} style={{ width: "100%", border: "0px" }}></iframe>
      </div>}
    </>
  )
}
export default CasinoOther
