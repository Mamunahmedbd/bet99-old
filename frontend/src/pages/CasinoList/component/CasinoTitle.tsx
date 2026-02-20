/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '../../../redux/hooks'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { calculateTotalNumbersFromString, replacecardstringSuperover } from '../../../utils/helper'
import { isMobile } from 'react-device-detect'

import PropTypes from 'prop-types'
import Carousel from 'react-elastic-carousel'

const breakPoints: any = [
  { width: 1, itemsToShow: 4 },
  { width: 550, itemsToShow: 2, itemsToScroll: 2 },
  { width: 768, itemsToShow: 3 },
  { width: 1200, itemsToShow: 4 },
]

const CasinoTitle = (props: any) => {
  const { lastResult, gameId } = props
  const refAndarBahar2 = useRef(null)
  const refAndarBahar2B = useRef(null)
  const refAndarBahar = useRef(null)
  const refAndarBaharB = useRef(null)
  const getCurrentMatch: any = useAppSelector(selectCasinoCurrentMatch)

  useEffect(() => {
    const andarData = pushDataToPositionsAndarBhar(lastResult?.Cards)
    if (andarData?.[1] && refAndarBahar2.current) {
      //@ts-expect-error
      refAndarBahar2.current.goTo(andarData?.[1].length)
    }

    if (andarData?.[0] && refAndarBahar2B.current) {
      //@ts-expect-error
      refAndarBahar2B.current.goTo(andarData?.[1].length)
    }
  }, [lastResult])

  useEffect(() => {
    const andarData = lastResult?.t3?.[0]?.aall?.split(',') || []
    const baharData = lastResult?.t3?.[0]?.ball?.split(',') || []

    if (andarData && refAndarBahar.current) {
      //@ts-expect-error
      refAndarBahar.current.goTo(andarData.length)
    }

    if (baharData && refAndarBaharB.current) {
      //@ts-expect-error
      refAndarBaharB.current.goTo(baharData.length)
    }
  }, [lastResult?.t3?.[0]?.aall])

  const pushDataToPositions = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',').filter((d) => d !== '1') : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 4
          const position: any = positions[positionIndex]

          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const pushDataToPositionsAndarBhar = React.useCallback(
    (data: string) => {
      const positions = [0, 1]
      const dataArray: Array<string> = data
        ? data.split(',').filter((d, i) => d !== '1' && i > 2)
        : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 2
          const position: any = positions[positionIndex]

          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const pushDataToPositionsCard32 = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',') : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 4
          const position: any = positions[positionIndex]

          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const pushDataToPositionsRace20 = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',').filter((d) => d !== '1') : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 4
          ///const position: any = positions[positionIndex]
          let position = 0
          if (item.includes('CC')) position = 2
          if (item.includes('SS')) position = 3
          if (item.includes('DD')) position = 1
          if (item.includes('HH')) position = 0
          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const queenVideoOverLay = () => {
    const cards = pushDataToPositions(lastResult.desc)
    return (
      <div className=''>
        <div className='videoCards' style={{ width: '100px' }}>
          <div>
            {[0, 1, 2, 3].map((card: any, index: number) => {
              return (
                <>
                  <div key={index}>
                    <p className={`${!isMobile ? 'mt-10 mb-10' : 'mbc-5'} text-white`}>
                      <b>
                        <span>
                          {getCurrentMatch.slug == 'queen'
                            ? `Total ${index}`
                            : `Player ${index + 8}`}
                        </span>
                        :{' '}
                        <span className='text-warning'>
                          {calculateTotalNumbersFromString(cards[index].join(',')) +
                            +(getCurrentMatch.slug == 'queen' ? index : index + 8)}
                        </span>
                      </b>
                    </p>
                    <div className='d-flex'>
                      {cards[index].map((card: any, index: number) => {
                        return (
                          <img
                            key={index}
                            src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${card}.png`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const card32VideoOverLay = () => {
    const cards = pushDataToPositionsCard32(lastResult.desc)
    return (
      <div className='videoCards' style={{ width: '100px' }}>
        {[0, 1, 2, 3].map((card: any, index: number) => {
          return (
            <>
              <p className={`${!isMobile ? 'mt-10 mb-10' : 'mbc-5'} text-white`}>
                <b>
                  <span>
                    {getCurrentMatch.slug == 'queen' ? `Total ${index}` : `Player ${index + 8}`}
                  </span>
                  :{' '}
                  <span className='text-warning'>
                    {calculateTotalNumbersFromString(
                      cards[index].filter((ItemCard: any) => ItemCard != 1).join(','),
                    ) + +(getCurrentMatch.slug == 'queen' ? index : index + 8)}
                  </span>
                </b>
              </p>
              <div className='d-flex'>
                {cards[index].map((card: any, index: number) => {
                  if (card == 1) return
                  return (
                    <img
                      key={index}
                      src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${card}.png`}
                    />
                  )
                })}
              </div>
            </>
          )
        })}
      </div>
    )
  }

  const lucky7B = () => {
    const cardName = lastResult && lastResult.C1 != undefined ? lastResult.C1 : '1'
    return (
      <div className='video-overlay'>
        <div className='card-inner'>
          <h3 className='text-white'>Card</h3>{' '}
          <img
            src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${cardName}.png`}
          />
        </div>
      </div>
    )
  }

  const dt20 = () => {
    return (
      <div className='video-overlay'>
        <div className='imgspace d-flex'>
          <img
            src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
          />{' '}
          <img
            src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult?.C2}.png`}
          />
        </div>
      </div>
    )
  }

  const poker = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className='d-flex'>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player A</span>
                </b>
              </p>
              <div className='imgspace'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player B</span>
                </b>
              </p>
              <div className='imgspace'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C4}.png`}
                />
              </div>
            </div>
          </div>
          <div>
            <p className='m-b-0 text-white'>
              <b>
                <span className=''>BOARD</span>
              </b>
            </p>
            <div className='imgspace'>
              <img
                alt=''
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C5}.png`}
              />
              <img
                alt=''
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C6}.png`}
              />
              <img
                alt=''
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C7}.png`}
              />
              <img
                alt=''
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C8}.png`}
              />
              <img
                alt=''
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C9}.png`}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const onedayteen = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player A</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1A}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2A}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3A}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player B</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1B}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2B}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3B}.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const dtl20 = () => {
    return (
      <div className='video-overlay'>
        <div className='card-inner'>
          <h3 className='text-white'>DEALER</h3>{' '}
          <div className='d-flex'>
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
            />
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2}.png`}
            />
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3}.png`}
            />
          </div>
        </div>
      </div>
    )
  }

  const opentp = () => {
    const finalString = lastResult?.cards?.split('#') || []
    const cardData = finalString && finalString[0] && finalString[0].split(',')
    return (
      <div className='video-overlay'>
        <div className='card-inner'>
          <h3 className='text-white'>DEALER</h3>{' '}
          <div className='d-flex'>
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${
                cardData && cardData[8] ? cardData[8] : '1'
              }.png`}
            />
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${
                cardData && cardData[17] ? cardData[17] : '1'
              }.png`}
            />
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${
                cardData && cardData[26] ? cardData[26] : '1'
              }.png`}
            />
          </div>
        </div>
      </div>
    )
  }

  const Cards3J = () => {
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='imgspace d-flex'>
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
            />{' '}
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2}.png`}
            />
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3}.png`}
            />
          </div>
        </div>
      )
    )
  }

  const Cricket2020 = () => {
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='card-inner'>
            <h3 className='text-white'>DEALER</h3>{' '}
            <div className='imgspace d-flex'>
              <img
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
              />{' '}
            </div>
          </div>
        </div>
      )
    )
  }

  const warcasino = () => {
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='card-inner'>
            <h3 className='text-white'>DEALER</h3>{' '}
            <div className='imgspace d-flex'>
              <img
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C7}.png`}
              />{' '}
            </div>
          </div>
        </div>
      )
    )
  }

  const teen20 = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className=''>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player A</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player B</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C4}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C5}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C6}.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const poker6player = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className=''>
            <div className='mr-20'>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C13}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C14}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C15}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C16}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C17}.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const race2020 = () => {
    const cards = pushDataToPositionsRace20(lastResult.desc)
    const cardExtra = lastResult?.desc?.split(',')?.filter((Item: string) => Item != '1') || []
    const carname = [
      'imgs/casino/spade.png',
      'imgs/casino/heart.png',
      'imgs/casino/club.png',
      'imgs/casino/diamond.png',
    ]
    return (
      <div>
        <div className='casino-video-title'>
          <span className='casino-name'>{getCurrentMatch.slug}</span>
          <div className='casino-video-rid'>
            Round ID:
            <span>{lastResult.match_id}</span>
            <div className='total-points'>
              <div>
                <div>Total Card:</div>
                <div>{cardExtra && cardExtra.length}</div>
              </div>
              <div>
                <div>Total Point:</div>
                <div>
                  {cardExtra && cardExtra.length > 0
                    ? calculateTotalNumbersFromString(cardExtra.join(','))
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </div>{' '}
        <div className='video-overlay' style={{ top: isMobile ? '0px' : '120px' }}>
          <div className='videoCards'>
            <div className='video-overlay'>
              <div className='videoCards'>
                <div className=''>
                  <div className='mr-20'>
                    {[0, 1, 2, 3].map((card: any, index: number) => {
                      return (
                        <>
                          <div key={index}>
                            <div className='imgspace d-flex'>
                              <img alt='' src={carname[card]} />
                              {cards[index].map((card: any, index: number) => {
                                return (
                                  <img
                                    key={index}
                                    src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${card}.png`}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>{' '}
        </div>
      </div>
    )
  }

  const testtp = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className=''>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Tiger</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C2}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C3}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Lion</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C4}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C5}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C6}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Dragon</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C7}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C8}.png`}
                />
                <img
                  alt=''
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C9}.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const Superover = () => {
    const cardList = [
      lastResult.C1,
      lastResult.C2,
      lastResult.C3,
      lastResult.C4,
      lastResult.C5,
      lastResult.C6,
    ]
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='imgspace'>
            {cardList &&
              cardList.map((Item: any, key: number) => {
                return (
                  Item != '1' && (
                    <img
                      key={key}
                      src={`/imgs/card/${replacecardstringSuperover(Item)}b.png`}
                      className='mbc-5'
                    />
                  )
                )
              })}
          </div>
        </div>
      )
    )
  }

  const fivecricket = () => {
    const cardList = [
      lastResult.C1,
      lastResult.C2,
      lastResult.C3,
      lastResult.C4,
      lastResult.C5,
      lastResult.C6,
    ]
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay' style={{ background: 'none' }}>
          <div className='imgspace'>
            {cardList &&
              cardList.map((Item: any, key: number) => {
                return (
                  <img
                    alt=''
                    className='mb-1'
                    key={key}
                    src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${Item}.png`}
                  />
                )
              })}
          </div>
        </div>
      )
    )
  }

  const andarbahar = () => {
    const andarData = lastResult?.t3?.[0]?.aall?.split(',') || []
    const baharData = lastResult?.t3?.[0]?.ball?.split(',') || []
    if (lastResult?.t3?.[0]?.aall == '') return
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Andar</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                {/* {andarData.length > 0 &&
                  andarData.length <= 4 &&
                  andarData.map((card: any, k: number) => {
                    return (
                      <img
                        key={k}
                        src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                      />
                    )
                  })} */}
                {andarData.length > 0 && (
                  // @ts-ignore
                  <Carousel ref={refAndarBahar} breakPoints={breakPoints} pagination={false}>
                    {andarData.map((Item: any, key: number) => {
                      return (
                        <img
                          alt=''
                          key={key}
                          src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${Item}.png`}
                        />
                      )
                    })}
                  </Carousel>
                )}
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Bahar</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                {baharData.length > 0 && (
                  // @ts-ignore
                  <Carousel ref={refAndarBaharB} breakPoints={breakPoints} pagination={false}>
                    {baharData.map((Item: any, key: number) => {
                      return (
                        <img
                          alt=''
                          key={key}
                          src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${Item}.png`}
                        />
                      )
                    })}
                  </Carousel>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const andarbahar2 = () => {
    const andarData = pushDataToPositionsAndarBhar(lastResult?.Cards)
    const cards = lastResult?.Cards?.split(',') || []
    if (!cards?.[0] || cards?.[0] == '1') return
    return (
      <div className='video-overlay' style={{ minWidth: '400px' }}>
        <div className='row row5 align-items-center'>
          <div className='col-1'>
            <div className='row row5'>
              <div className='col-12'>
                <p className='mb-0 text-white text-center' style={{ lineHeight: '44px' }}>
                  <b>A</b>
                </p>
              </div>
            </div>
            <div className='row row5'>
              <div className='col-12'>
                <p className='mb-0 text-white text-center' style={{ lineHeight: '44px' }}>
                  <b>B</b>
                </p>
              </div>
            </div>
          </div>
          <div className='col-1 pl-0'>
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${cards?.[0]}.png`}
              className='card-right'
            />
          </div>
          <div className='col-10'>
            <div className='card-inner'>
              <div className='row row5'>
                <div className='col-2'>
                  <img
                    src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${cards?.[2]}.png`}
                  />
                </div>
                <div className='col-10'>
                  {andarData?.[1]?.length > 4 && (
                    <>
                      {/* 
                      // @ts-ignore */}
                      <Carousel ref={refAndarBahar2} breakPoints={breakPoints} pagination={false}>
                        {andarData?.[1]?.map((card: any, k: number) => {
                          return (
                            <img
                              style={{ margin: '2px', display: 'flex' }}
                              key={k}
                              src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                            />
                          )
                        })}
                      </Carousel>
                    </>
                  )}
                  {andarData?.[1]?.length > 0 &&
                    andarData?.[1]?.length <= 4 &&
                    andarData?.[1]?.map((card: any, k: number) => {
                      return (
                        <img
                          key={k}
                          src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                        />
                      )
                    })}
                </div>
              </div>
            </div>
            <div className='card-inner'>
              <div className='row row5'>
                <div className='col-2'>
                  <img
                    src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${cards?.[1]}.png`}
                  />
                </div>
                <div className='col-10'>
                  {andarData?.[0]?.length > 4 && (
                    <>
                      {/* 
                      // @ts-ignore */}
                      <Carousel ref={refAndarBahar2B} breakPoints={breakPoints} pagination={false}>
                        {andarData?.[0]?.map((card: any, k: number) => {
                          return (
                            <img
                              style={{ margin: '2px', display: 'flex' }}
                              key={k}
                              src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                            />
                          )
                        })}
                      </Carousel>
                    </>
                  )}
                  {andarData?.[0]?.length > 0 &&
                    andarData?.[0]?.length <= 4 &&
                    andarData?.[0]?.map((card: any, k: number) => {
                      return (
                        <img
                          key={k}
                          src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                        />
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div>
      {lastResult && (lastResult.match_id || lastResult.id) && (
        <div className='video-overlaybox'>
          {getCurrentMatch.slug == 'queen' ||
          getCurrentMatch.slug == 'card32' ||
          getCurrentMatch.slug == 'card32b' ||
          getCurrentMatch.slug == 'card32eu' ? (
            <>
              <div className='casino-video-title'>
                <span className='casino-name'>{getCurrentMatch.slug}</span>
                <div className='casino-video-rid'>
                  Round ID:
                  <span>{lastResult.match_id}</span>
                </div>
              </div>
              {getCurrentMatch.slug == 'card32' || getCurrentMatch.slug == 'card32b'
                ? card32VideoOverLay()
                : queenVideoOverLay()}
            </>
          ) : (
            ''
          )}

          {getCurrentMatch.slug == 'race2020' ? race2020() : ''}
          {(getCurrentMatch.slug == 'lucky7B' ||
            getCurrentMatch.slug == 'lucky7' ||
            getCurrentMatch.slug == 'AAA' ||
            getCurrentMatch.slug == 'ddb') &&
            lucky7B()}
          {(getCurrentMatch.slug == 'dt20' ||
            getCurrentMatch.slug == 'dt20b' ||
            getCurrentMatch.slug == 'dragontiger1Day') &&
            dt20()}
          {(getCurrentMatch.slug == 'onedaypoker' || getCurrentMatch.slug == 'onedaypoker20') &&
            poker()}

          {getCurrentMatch.slug == 'Tp1Day' && getCurrentMatch?.match_id > 0 && onedayteen()}
          {((!isMobile && getCurrentMatch.slug == 'dtl20') || getCurrentMatch.slug == 'war') &&
            dtl20()}

          {getCurrentMatch.slug == 'opentp' && opentp()}
          {getCurrentMatch.slug == 'teen20' && teen20()}
          {getCurrentMatch.slug == 'poker6player' && poker6player()}
          {getCurrentMatch.slug == 'testtp' && testtp()}
          {(getCurrentMatch.slug == 'Cards3J' ||
            getCurrentMatch.slug == 'worliinstant' ||
            getCurrentMatch.slug == 'worlimatka') &&
            Cards3J()}
          {getCurrentMatch.slug == 'Superover' && Superover()}
          {getCurrentMatch.slug == 'fivewicket' && fivecricket()}
          {getCurrentMatch.slug == 'cricket2020' && Cricket2020()}
          {getCurrentMatch.slug == 'warcasino' && warcasino()}
          {getCurrentMatch.slug == 'Andarbahar' && andarbahar()}
          {getCurrentMatch.slug == 'Andarbahar2' && andarbahar2()}

          {/* {gameId !== 'baccarat2' && gameId !== 'baccarat' ? (
          <div className='video-overlay'>
            <div className='videoCards'>{displaycards()}</div>
          </div>
        ) : (
          ''
        )} */}
        </div>
      )}
    </div>
  )
}
CasinoTitle.propTypes = {
  lastResult: PropTypes.shape({
    C1: PropTypes.string, // Define the expected type for lastResult.C1
    C2: PropTypes.string,
    C3: PropTypes.string,
    C4: PropTypes.string,
    C5: PropTypes.string,
    C6: PropTypes.string,
    // Add PropTypes for other properties of lastResult if needed
  }).isRequired,
}
export default CasinoTitle
