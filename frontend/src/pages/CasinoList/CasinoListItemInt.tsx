import React from 'react'
const CasinoListItemInt = (props: any) => {
  return (
    <>
      {props.games &&
        props.games.map((Item: any, key: number) => {
              return (
                <div className={"casino-list-item"} onClick={(e) => { e.preventDefault(); props.setGamePlay(Item) }} key={key}>
                  <a href='#' className='' >
                      <div className="casino-list-item-banner" 
                      style={{ backgroundImage: `url(${Item.game_images})`}}>
                      </div>
                  </a>
                </div>
              )
            })}
    </>
  )
}
export default React.memo(CasinoListItemInt)
