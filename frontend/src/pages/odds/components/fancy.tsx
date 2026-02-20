/* eslint-disable */
import React, { MouseEvent } from 'react'
import LFancy from '../../../models/LFancy'
import { FancyType, IFancy } from '../../../models/IFancy'
import { SocketContext } from '../../../context/webSocket'
import { FancyList } from './fancy/fancy-list'
import { isMobile } from 'react-device-detect'
import { connect } from 'react-redux'
import { selectFancyType, setFancyType } from '../../../redux/actions/bet/betSlice'
import { store } from '../../../redux/store'
import { setRules } from '../../../redux/actions/common/commonSlice'
import sportsService from '../../../services/sports.service'

type FancyBallTypes = {
  blank: LFancy[]
  ballRun: LFancy[]
  overBallNo: LFancy[]
  [key: string]: LFancy[]
}

class Fancy extends React.Component<
  {
    fancies: LFancy[]
    matchId: string
    fancyType: string
    setRules: (data: { open: boolean; type: string }) => void
    socketUser: any
  },
  {
    fancies: FancyBallTypes
    matchId: string
    fancyUpdate: Record<string, IFancy>
  }
> {
  static contextType = SocketContext
  context!: React.ContextType<typeof SocketContext>

  interval: any

  constructor(props: any) {
    super(props)
    const session = props.fancies
    const updateFancy: Record<string, IFancy> = {}
    const typesFancy: any = {}
    session
      .sort((a: any, b: any) => a.sr_no - b.sr_no)
      .forEach((fancy: LFancy) => {
        updateFancy[fancy.marketId] = {
          gtype: fancy.gtype as FancyType,
          SelectionId: fancy.marketId,
          RunnerName: fancy.fancyName,
        }
        const type = this.FancyBallTypes(fancy.fancyName)
        typesFancy[type] = typesFancy[type] ? [...typesFancy[type], fancy] : [fancy]
      })

    this.state = {
      matchId: props.matchId,
      fancies: typesFancy,
      fancyUpdate: updateFancy,
    }
  }

  componentDidMount(): void {
    this.socketEvents()
  }

  componentDidUpdate(prevProps: Readonly<{ fancies: LFancy[]; matchId: string }>): void {
    if (prevProps.matchId !== this.props.matchId) {
      this.leaveSocketEvents()
      this.socketEvents()
      clearInterval(this.interval)
    }
    if (prevProps.fancies !== this.props.fancies) {
      const typesFancy: any = {}
      this.props.fancies.forEach((fancy: LFancy) => {
        const type = this.FancyBallTypes(fancy.fancyName)
        typesFancy[type] = typesFancy[type] ? [...typesFancy[type], fancy] : [fancy]
      })
      this.setState({ fancies: typesFancy })
    }
  }

  socketEvents = () => {
    this.context.socket.emit('joinRoom', this.props.matchId)
    if (this.props.socketUser) {
      this.props.socketUser.emit('joinRoomMatchIdWUserId', this.props.matchId)
    }
    this.getFancySockets()
    this.addNewFancy()
    this.removeFancy()
    this.suspendedFancy()
    this.context.socket.on('connect', () => {
      this.context.socket.emit('joinRoom', this.props.matchId)
    })
  }

  leaveSocketEvents = () => {
    this.context.socket.off('addNewFancy')
    this.context.socket.off('removeFancy')
    this.context.socket.off('getFancyData')
    this.context.socket.off('suspendedFancy')
    this.context.socket.emit('leaveRoom', this.props.matchId)
  }

  getFancySockets() {
    const handler = () => {
      sportsService.fancyData(+this.props.matchId).then(({ data }) => {
        const fancies = data.data.reduce((acc: Record<string, IFancy>, fancy: IFancy) => {
          acc[fancy.SelectionId] = { ...this.state.fancyUpdate[fancy.SelectionId], ...fancy }
          return acc
        }, {})
        this.setState({ fancyUpdate: fancies })
      })
    }
    this.interval = setInterval(handler, 500)

    // const socketHandler = (fancy: IFancy) => {
    //   this.setState({ fancyUpdate: { ...this.state.fancyUpdate, [fancy.SelectionId]: fancy } })
    // }
    // this.context.socket.on('getFancyData', socketHandler)
  }

  checkFancyKey = (allFancies: LFancy[], fancy: IFancy) => {
    return allFancies.findIndex((f) => f.marketId === fancy.SelectionId)
  }

  addNewFancy = () => {
    if (this.props.socketUser) {
      this.props.socketUser.on('addNewFancy', ({ newFancy, fancy }: any) => {
        const type = this.FancyBallTypes(fancy.RunnerName)
        const allFacies = [...this.state.fancies[type]]

        if (this.checkFancyKey(allFacies, fancy) === -1 && this.props.fancyType == newFancy.gtype) {
          const items = { ...this.state.fancyUpdate }
          allFacies.push(newFancy)
          this.setState({
            fancies: {
              ...this.state.fancies,
              [type]: allFacies.sort((a: any, b: any) => a.sr_no - b.sr_no),
            },
            fancyUpdate: { ...items, [fancy.SelectionId]: fancy },
          })
        }
      })
    }
  }

  removeFancy = () => {
    if (this.props.socketUser)
      this.props.socketUser.on('removeFancy', (fancy: any) => {
        const type = this.FancyBallTypes(fancy.RunnerName)
        const allFacies = [...this.state.fancies[type]]

        const fancies = allFacies.filter((f) => f.marketId !== fancy.marketId)
        delete this.state.fancyUpdate[fancy.marketId]
        this.setState({
          fancies: { ...this.state.fancies, [type]: fancies },
          fancyUpdate: this.state.fancyUpdate,
        })
      })
  }

  suspendedFancy = () => {
    this.context.socket.on('suspendedFancy', ({ fancy, type }) => {
      const fancies = [...this.state.fancies[this.FancyBallTypes(fancy.fancyName)]]

      const fanciesIndex = fancies.findIndex(
        (f) => f.marketId === fancy.marketId && f.matchId === fancy.matchId,
      )

      if (fanciesIndex !== -1) {
        if (type !== 'active') {
          fancies[fanciesIndex].GameStatus = fancy.GameStatus
          fancies[fanciesIndex].isSuspend = fancy.isSuspend
        } else {
          fancies[fanciesIndex].active = fancy.active
        }
        this.setState({
          fancies: { ...this.state.fancies, [type]: fancies },
          fancyUpdate: this.state.fancyUpdate,
        })
      }
    })
  }

  componentWillUnmount(): void {
    this.leaveSocketEvents()
    clearInterval(this.interval)
  }

  FancyBallTypes(fancyName: string) {
    let type = 'blank'
    if (fancyName) {
      if (fancyName.includes(' ball run ')) {
        type = 'ballRun'
      }
      if (
        /^Only/.test(fancyName) ||
        fancyName.includes(' ball No ') //||
        //fancyName.includes(' over run ')
      ) {
        type = 'overBallNo'
      }
    }
    return type
  }

  onFancyType = (type: string) => {
    store.dispatch(setFancyType(type))
    this.setState({ fancies: {} as FancyBallTypes })
  }

  fancyMenu = (fancyType: string) => {
    const menus = [
      { type: 'session', label: 'Fancy', width: isMobile ? '19%' : '11%' },
      { type: 'fancy1', label: 'Fancy1', width: isMobile ? '19%' : '11%' },
      { type: 'meter', label: 'Meter', width: isMobile ? '19%' : '10%' },
      { type: 'khado', label: 'Khado', width: isMobile ? '19%' : '10%' },
      { type: 'odd/even', label: 'Odd/Even', width: isMobile ? '24%' : '11%' },
      { type: 'wkt', label: 'Wicket', width: isMobile ? '24%' : '10%' },
      { type: 'Four', label: 'Four', width: isMobile ? '20%' : '10%' },
      { type: 'Sixes', label: 'Six', width: isMobile ? '20%' : '11%' },
      { type: 'Casino', label: 'Cricket Casino', width: isMobile ? '36%' : '15%' },
    ]

    return menus.map((menu) => (
      <li
        key={menu.type}
        onClick={(e) => this.onFancyType(menu.type)}
        style={{ width: `${menu.width}` }}
        className='nav-item'
      >
        <a
          href='#'
          onClick={(e) => e.preventDefault()}
          role='tab'
          className={`nav-link ${fancyType === menu.type ? 'active' : ''}`}
        >
          <span style={{ textTransform: 'uppercase' }}>{menu.label}</span>
        </a>
      </li>
    ))
  }

  fancyheader = (title: string) => {
    return (
      <div className='table-header'>
        <div className={`float-left ${isMobile ? 'bg-theme text-white' : ''} country-name box-6`}>
          {isMobile ? title : ''}
        </div>
        <div className={`${isMobile ? 'box-2' : 'box-1'} float-left lay text-center`}>
          <b>No</b>
        </div>
        <div className={`${isMobile ? 'box-2' : 'box-1'} float-left back text-center`}>
          <b>Yes</b>
        </div>
        {!isMobile && <div className='box-2 float-left' />}
      </div>
    )
  }
  render(): React.ReactNode {
    const { fancies, matchId, fancyUpdate } = this.state
    const clsgrid = isMobile ? 'col-12' : 'col-6'
    const { fancyType } = this.props

    return (
      <>
        <ul role='tablist' className='nav nav-tabs fancy-group' aria-label='Tabs'>
          {this.fancyMenu(fancyType)}
        </ul>
        <div
          className='fancy-market row  '
          style={{ marginLeft: isMobile ? '0px' : '', marginRight: isMobile ? '0px' : '' }}
        >
          <div className={`${clsgrid}`} style={{ padding: isMobile ? '0px' : '' }}>
            <div>
              {!isMobile && (
                <div className='market-title mt-1'>
                  Session Market
                  <a
                    href='#'
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault()
                      this.props.setRules({
                        open: true,
                        type: 'Fancy-Market-1',
                      })
                    }}
                    className='m-r-5 game-rules-icon'
                  >
                    <span>
                      <i className='fa fa-info-circle float-right' />
                    </span>
                  </a>
                </div>
              )}

              {fancies && (
                <>
                  {this.fancyheader('Session Market')}
                  <FancyList fancies={fancies.blank} fancyUpdate={fancyUpdate} />
                </>
              )}
            </div>
          </div>
          <div className={`${clsgrid}`} style={{ padding: isMobile ? '0px' : '' }}>
            {fancies?.overBallNo?.length > 0 && (
              <div>
                {!isMobile && <div className='market-title mt-1'>Over by Over Session Market</div>}
                {this.fancyheader('Over by Over Session Market')}
                {/* Over by over session here*/}
                {fancies && <FancyList fancies={fancies.overBallNo} fancyUpdate={fancyUpdate} />}
              </div>
            )}
            {fancies?.ballRun?.length > 0 && (
              <div>
                {!isMobile && <div className='market-title mt-1'>Ball by Ball Session Market</div>}
                {this.fancyheader('Ball by Ball Session Market')}

                {/* Ball by Ball Session here*/}
                {fancies && <FancyList fancies={fancies.ballRun} fancyUpdate={fancyUpdate} />}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = (state: any) => ({
  fancyType: state.betReducer.fancyType,
})

const actionCreators = {
  selectFancyType,
  setRules,
}
export default connect(mapStateToProps, actionCreators)(Fancy)
