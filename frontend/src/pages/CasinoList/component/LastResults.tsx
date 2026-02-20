import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useNavigate } from 'react-router-dom'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { useAppSelector } from '../../../redux/hooks'
import CasinoResultDetail from '../CasinoResultDetail'
// ARimport { useState } from "react"

const gameWiseResultStyle: any = {
  dt20: {
    '0': {
      clsname: 'ball-runs playerc last-result',
      shortName: '',
    },
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'D',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'T',
    },
    '3': {
      clsname: 'ball-runs playerc last-result',
      shortName: 'T',
    },
  },
  Tp1Day: {
    '0': {
      clsname: 'ball-runs playerc last-result',
      shortName: 'T',
    },
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'A',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'B',
    },
  },
  lucky7B: {
    '0': {
      clsname: 'ball-runs playerc last-result',
      shortName: 'T',
    },
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'L',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'H',
    },
  },
  aaa: {
    '3': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'C',
    },
    '1': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'A',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'B',
    },
  },
  baccarat: {
    '3': {
      clsname: 'ball-runs ctie last-result',
      shortName: 'T',
    },
    '1': {
      clsname: 'ball-runs cplayer last-result',
      shortName: 'P',
    },
    '2': {
      clsname: 'ball-runs cbanker last-result',
      shortName: 'B',
    },
  },
  card32: {
    '1': {
      clsname: 'ball-runs playerb last-result',
      shortName: '8',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: '9',
    },
    '3': {
      clsname: 'ball-runs playerb last-result',
      shortName: '10',
    },
    '4': {
      clsname: 'ball-runs playerb last-result',
      shortName: '11',
    },
  },
  ddb: {
    '1': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'A',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'B',
    },
    '3': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'C',
    },
    '4': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'D',
    },
    '5': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'E',
    },
    '6': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'F',
    },
  },
  onedaypoker: {
    '11': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'A',
    },
    '21': {
      clsname: 'ball-runs playera last-result',
      shortName: 'B',
    },
    '0': {
      clsname: 'ball-runs playerc last-result',
      shortName: 'T',
    },
  },
  onedaypoker20: {
    '11': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'A',
    },
    '21': {
      clsname: 'ball-runs playera last-result',
      shortName: 'B',
    },
    '0': {
      clsname: 'ball-runs playerc last-result',
      shortName: 'T',
    },
  },
  dtl20: {
    '1': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'D',
    },
    '21': {
      clsname: 'ball-runs playera last-result',
      shortName: 'T',
    },
    '41': {
      clsname: 'ball-runs playerc last-result',
      shortName: 'L',
    },
  },
  testtp: {
    '11': {
      clsname: 'ball-runs playera last-result',
      shortName: 'T',
    },
    '21': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'L',
    },
    '31': {
      clsname: 'ball-runs playera last-result',
      shortName: 'D',
    },
    '0': {
      clsname: 'ball-runs playera last-result bg-red',
      shortName: 'T',
    },
  },
  teen20: {
    '1': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'A',
    },
    '3': {
      clsname: 'ball-runs playera last-result',
      shortName: 'B',
    },
  },
  poker6player: {
    '11': {
      clsname: 'ball-runs playerb last-result',
      shortName: '1',
    },
    '12': {
      clsname: 'ball-runs playera last-result',
      shortName: '2',
    },
    '13': {
      clsname: 'ball-runs playerb last-result',
      shortName: '3',
    },
    '14': {
      clsname: 'ball-runs playera last-result',
      shortName: '4',
    },
    '15': {
      clsname: 'ball-runs playerb last-result',
      shortName: '5',
    },
    '16': {
      clsname: 'ball-runs playera last-result',
      shortName: '6',
    },
    '0': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'T',
    },
  },
  race2020: {
    '1': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src='imgs/casino/spade.png' style={{ width: !isMobile ? '28px' : '24px' }} />,
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src='imgs/casino/heart.png' style={{ width: !isMobile ? '28px' : '24px' }} />,
    },
    '3': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src='imgs/casino/club.png' style={{ width: !isMobile ? '28px' : '24px' }} />,
    },
    '4': {
      clsname: 'ball-runs playerb last-result',
      shortName: (
        <img src='imgs/casino/diamond.png' style={{ width: !isMobile ? '28px' : '24px' }} />
      ),
    },
  },
  Superover: {
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'E',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'R',
    },
    '0': {
      clsname: 'ball-runs playera last-result',
      shortName: 'T',
    },
  },
  worli2: {
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'R',
    },
    '0': {
      clsname: 'ball-runs playera last-result',
      shortName: 'R',
    },
  },
  fivewicket: {
    '0': {
      clsname: 'ball-runs playertie last-result',
      shortName: 'T',
    },
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'A',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'I',
    },
  },
  cmatch20: {
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: <img src={`imgs/casino/ball2.png`} className='img-fluid ball-image' />,
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball3.png`} className='img-fluid ball-image' />,
    },
    '3': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball4.png`} className='img-fluid ball-image' />,
    },
    '4': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball5.png`} className='img-fluid ball-image' />,
    },
    '5': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball6.png`} className='img-fluid ball-image' />,
    },
    '6': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball7.png`} className='img-fluid ball-image' />,
    },
    '7': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball8.png`} className='img-fluid ball-image' />,
    },
    '8': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball9.png`} className='img-fluid ball-image' />,
    },
    '9': {
      clsname: 'ball-runs playerb last-result',
      shortName: <img src={`imgs/casino/ball10.png`} className='img-fluid ball-image' />,
    },
  },
  Andarbahar: {
    '0': {
      clsname: 'ball-runs playera last-result',
      shortName: 'R',
    }
  },
  Andarbahar2: {
    '1': {
      clsname: 'ball-runs playera last-result',
      shortName: 'A',
    },
    '2': {
      clsname: 'ball-runs playerb last-result',
      shortName: 'B',
    },
  }

}
const LastResults = (props: any) => {
  const { lastResult, gameId } = props
  const navigate = useNavigate()
  const [popupdata, setPopData] = useState<any>({})
  const [popupstatus, setPopStatus] = useState<any>(false)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)

  const getShortName = ({ shortName, result }: any) => {
    return <span className={`player${result}`}>{shortName}</span>
  }
  const handleResultsClick = (Item: any) => {

    setPopData({ ...Item, ...{ title: getCurrentMatch.title, slug: getCurrentMatch.slug, "event_data": { title: getCurrentMatch.title } } })
    setPopStatus(true)
  }

  const datamapItem = (Item: any, key: number) => {
    let clsname = ''
    let shortName = ''
    if (!Item.result) return
    try {
      switch (gameId) {
        case 'race20':
          clsname = 'ball-runs playerb last-result playersuit'
          break
        case 'lucky7B':
        case 'lucky7':
          clsname = gameWiseResultStyle['lucky7B'][Item.result]['clsname']
          shortName = gameWiseResultStyle['lucky7B'][Item.result]['shortName']
          break
        case 'AAA':
          clsname = gameWiseResultStyle['aaa'][Item.result]['clsname']
          shortName = gameWiseResultStyle['aaa'][Item.result]['shortName']
          break
        case 'baccarat':
        case 'baccarat2':
          clsname = gameWiseResultStyle['baccarat'][Item.result]['clsname']
          shortName = gameWiseResultStyle['baccarat'][Item.result]['shortName']
          break
        case 'queen':
          clsname = 'ball-runs playerb last-result'
          shortName = (Item.result - 1).toString()
          break
        case 'Tp1Day':
          clsname = gameWiseResultStyle['Tp1Day'][Item.result]['clsname']
          shortName = gameWiseResultStyle['Tp1Day'][Item.result]['shortName']
          break
        case 'card32':
        case 'card32b':
          clsname = gameWiseResultStyle['card32'][Item.result]['clsname']
          shortName = gameWiseResultStyle['card32'][Item.result]['shortName']
          break
        case 'ddb':
          clsname = gameWiseResultStyle['ddb'][Item.result]['clsname']
          shortName = gameWiseResultStyle['ddb'][Item.result]['shortName']
          break
        case 'dt20':
        case 'dt20b':
        case 'dragontiger1Day':
          clsname = gameWiseResultStyle['dt20'][Item.result]['clsname']
          shortName = gameWiseResultStyle['dt20'][Item.result]['shortName']
          break
        case 'onedaypoker':
          clsname = gameWiseResultStyle['onedaypoker'][Item.result]['clsname']
          shortName = gameWiseResultStyle['onedaypoker'][Item.result]['shortName']
          break
        case 'onedaypoker20':
          clsname = gameWiseResultStyle['onedaypoker'][Item.result]['clsname']
          shortName = gameWiseResultStyle['onedaypoker'][Item.result]['shortName']
          break
        case 'dtl20':
          clsname = gameWiseResultStyle['dtl20'][Item.result]['clsname']
          shortName = gameWiseResultStyle['dtl20'][Item.result]['shortName']
          break
        case 'teen20':
          clsname = gameWiseResultStyle['teen20'][Item.result]['clsname']
          shortName = gameWiseResultStyle['teen20'][Item.result]['shortName']
          break
        case 'poker6player':
          clsname = gameWiseResultStyle['poker6player'][Item.result]['clsname']
          shortName = gameWiseResultStyle['poker6player'][Item.result]['shortName']
          break
        case 'race2020':
          clsname = gameWiseResultStyle['race2020'][Item.result]['clsname']
          shortName = gameWiseResultStyle['race2020'][Item.result]['shortName']
          break
        case 'testtp':
          clsname = gameWiseResultStyle['testtp'][Item?.result || 0]['clsname']
          shortName = gameWiseResultStyle['testtp'][Item?.result || 0]['shortName']
          break
        case 'Superover':
          clsname = gameWiseResultStyle['Superover'][Item.result]['clsname']
          shortName = gameWiseResultStyle['Superover'][Item.result]['shortName']
          break
        case 'fivewicket':
          clsname = gameWiseResultStyle['fivewicket'][Item.result]['clsname']
          shortName = gameWiseResultStyle['fivewicket'][Item.result]['shortName']
          break
        case 'worliinstant':
        case 'worlimatka':
        case 'warcasino':
        case 'opentp':
        case 'cmeter2020':
        case 'Cards3J':
        case 'ab1':
        case 'Andarbahar':
          clsname = gameWiseResultStyle['worli2'][1]['clsname']
          shortName = gameWiseResultStyle['worli2'][1]['shortName']
          break
        case 'Andarbahar2':
          clsname = gameWiseResultStyle['Andarbahar2'][Item.result]['clsname']
          shortName = gameWiseResultStyle['Andarbahar2'][Item.result]['shortName']
          break

        default:
          clsname = 'ball-runs playerb last-result'
          shortName = Item.result
          break
      }
    } catch (error) {
      console.log('deni')
    }

    let clsscolor =
      (gameId == 'baccarat2' && Item.winnerName == 'Player') ||
        (gameId == 'baccarat' && Item.winnerName == 'Player')
        ? 'player-color'
        : ''
    clsscolor =
      (gameId == 'baccarat2' && Item.winnerName == 'Banker') ||
        (gameId == 'baccarat' && Item.winnerName == 'Banker')
        ? 'banker-color'
        : clsscolor
    clsscolor =
      (gameId == 'baccarat2' && Item.winnerName == 'Tie Game') ||
        (gameId == 'baccarat' && Item.winnerName == 'Tie Game')
        ? 'tie-color'
        : clsscolor

    return (
      <span
        key={key}
        onClick={() => {
          handleResultsClick(Item)
        }}
        className={`${clsname} ${clsscolor}`}
      >
        {getShortName({ shortName })}
      </span>
    )
  }

  const datamap = () => {
    return lastResult && lastResult.results && lastResult.results.data
      ? lastResult.results.data.map((Item: any, key: number) => {
        return datamapItem(Item, key)
      })
      : ''
  }
  const datamapnew = () => {
    return lastResult && lastResult.results && lastResult.results
      ? lastResult.results.map((Item: any, key: number) => {
        return datamapItem(Item, key)
      })
      : ''
  }
  return (
    <>
      <div className='card m-b-10 my-bet mt-10'>
        <div className='card-header casino'>
          <h6 className='card-title d-inline-block'>
            {'Last Result'}
            <span
              className='float-right'
              onClick={() => {
                navigate(`/casino/result/${gameId}`)
              }}
            >
              View All{' '}
            </span>
          </h6>
        </div>
        <div className='card-body' style={{ padding: '5px', textAlign: 'right' }}>
          {lastResult && lastResult.results && lastResult.results.data && datamap()}
          {lastResult && lastResult.results && !lastResult.results.data && datamapnew()}
        </div>
      </div>
      <CasinoResultDetail
        popupdata={popupdata}
        setPopStatus={setPopStatus}
        popupstatus={popupstatus}
      />
    </>
  )
}
export default LastResults
