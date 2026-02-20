import { AxiosResponse } from 'axios'
import moment from 'moment'
import React, { FormEvent } from 'react'
import ReactModal from 'react-modal'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import IMarket from '../../../models/IMarket'
import IRunner from '../../../models/IRunner'
import marketService from '../../../services/market.service'
import seriesService from '../../../services/sports.service'
import { dateFormat } from '../../../utils/helper'

const ActiveMarkets = () => {
  const [markets, setMarkets] = React.useState<IMarket[]>([])
  const [selectedMarket, setMarket] = React.useState<IMarket>({} as IMarket)
  const [selectedRunner, setSelectedRunner] = React.useState<string>('')
  const [isOpen, setIsOpen] = React.useState(false)

  const { matchId } = useParams()

  React.useEffect(() => {
    getActiveMarkets()
    // .catch(() => {})
  }, [])

  const getActiveMarkets = () => {
    marketService.getActiveMarkets(matchId!).then((res: AxiosResponse) => {
      setMarkets(res.data.data)
    })
  }

  const changeStatus = (e: any, market: IMarket) => {
    e.preventDefault()
    ///const con = confirm('Are you sure you want to change this market status')
    const con = true
    if (con) {
      // /change-status-markets
      marketService.changeStatusMarket(market.marketId, market.matchId).then((res) => {
        const allMarkets: IMarket[] = [...markets]
        const index = allMarkets.findIndex((m: IMarket) => m.marketId === market.marketId)
        allMarkets[index].isActive = !market.isActive
        setMarkets(allMarkets)
      })
    }
  }

  const deleteMarket = (e: any, market: IMarket) => {
    e.preventDefault()
    ///const con = confirm('Are you sure you want to delete this market')
    const con = true
    if (con) {
      marketService.deleteMarket(market.marketId, market.matchId).then((res) => {
        const allMarkets: any = [...markets]
        const index = allMarkets.findIndex((m: IMarket) => m.marketId === market.marketId)

        allMarkets[index].isDelete = !market.isDelete
        setMarkets(allMarkets)
      })
    }
  }

  const resultPropmet = (e: any, market: IMarket) => {
    e.preventDefault()
    setIsOpen(true)
    setMarket(market)
  }
  const onSubmitRollbackHandle = (e: any, market: IMarket) => {
    e.preventDefault()
    marketService
      .rollbackmarketResult(market.marketId, market.matchId)
      .then(() => {
        getActiveMarkets()
        toast.success('Result Rollback')
      })
      .catch((e) => {
        const err = e as Error
        toast.error(err.message)
      })
  }
  const onSubmitHandle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedRunner) toast.error('Please select winner')
    marketService
      .marketResult(selectedMarket.marketId, selectedMarket.matchId, selectedRunner!)
      .then(() => {
        toast.success('Result Set')
        setIsOpen(false)
        getActiveMarkets()
      })
      .catch((e) => {
        const err = e as Error
        toast.error(err.message)
      })
  }

  const syncMarket = () => {
    seriesService
      .saveMatch([{ matchId }], true)
      .then(() => {
        toast.success('Synk Data Successfully. Please wait')
        getActiveMarkets()
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }

  return (
    <div className='container-fluid'>
      <div className='row'>
   
        <ReactModal
          isOpen={isOpen}
          onRequestClose={(e: any) => {
            setIsOpen(false)
          }}
          contentLabel='Set Max Bet Limit'
          className={'modal-dialog'}
          ariaHideApp={false}
        >
          <div className='modal-content'>
            <div className='modal-header'>
              <h5>Choose To Win Match</h5>
              <button onClick={() => setIsOpen(false)} className='close float-right'>
                X
              </button>
            </div>
            <form onSubmit={onSubmitHandle} className='form loginform'>
              <div className='modal-body'>
                <div className='row form-group'>
                  <div className='col-md-5'>
                    <label>Winning Team Select</label>
                  </div>
                  <div className='col-md-7'>
                    <select
                      onChange={(e) => setSelectedRunner(e.target.value)}
                      name='win_team'
                      id='win_team'
                      required
                    >
                      <option value=''>Please Select Winning Team</option>
                      {selectedMarket.marketId &&
                        selectedMarket.runners.map((runner: IRunner) => (
                          <option key={runner.selectionId} value={runner.selectionId}>
                            {runner.runnerName}
                          </option>
                        ))}
                      <option value='-1'>Abandoned</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-info' data-dismiss='modal'>
                  <i className='fas fa-undo-alt' /> No
                </button>
                <button type='submit' className='btn btn-primary'>
                  <i className='fas fa-paper-plane' /> Yes
                </button>
              </div>
            </form>
          </div>
        </ReactModal>

        <div className='col-md-12 main-container'>
          <button onClick={syncMarket} className='btn btn-primary' style={{ marginBottom: '10px' }}>
            Sync Markets
          </button>

          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>In Play</th>
                <th>Game</th>
                <th>Start Time</th>
                <th>Status</th>
                <th>Action</th>
                <th>Set Result</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market: IMarket) => (
                <tr key={market.marketId}>
                  <td>
                    <i
                      className={`fas fa-circle ${
                        market.isActive ? 'text-success' : 'text-danger'
                      } fa-lg mr-2`}
                    ></i>
                  </td>
                  <td>{market.marketName}</td>
                  <td>{moment(market.marketStartTime).format(dateFormat)}</td>
                  <td>{market.isActive ? 'Active' : 'In-Active'}</td>
                  <td>
                    <div>
                      <a href='#' onClick={(e) => changeStatus(e, market)}>
                        Click To {market.isActive ? 'In-Active' : 'Active'}
                      </a>
                      <br />
                      <a href='#' onClick={(e) => deleteMarket(e, market)}>
                        Click To {market.isDelete ? 'Undo' : 'Delete'}
                      </a>
                    </div>
                  </td>
                  <td className='text-left'>
                    {market?.resultDelcare == 'yes' ? (
                      <a
                        onClick={(e) => onSubmitRollbackHandle(e, market)}
                        href='#'
                        style={{ color: 'red' }}
                      >
                        Rollback Result
                      </a>
                    ) : (
                      <a onClick={(e) => resultPropmet(e, market)} href='#'>
                        Result Declare
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ActiveMarkets
