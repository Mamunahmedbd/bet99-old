import { AxiosResponse } from 'axios'
import React, { FormEvent } from 'react'
import ReactModal from 'react-modal'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import LFancy from '../../../models/LFancy'
import fancyService from '../../../services/fancy.service'

const GetAllFancy = () => {
  const [fancies, setFancies] = React.useState([])
  const [fancy, setFancy] = React.useState<LFancy>({} as LFancy)
  const [result, setResult] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string>('session')
  const [isOpen, setIsOpen] = React.useState(false)

  const { matchId } = useParams()

  const getFancyResult = () => {
    fancyService.getActiveFancies(matchId!, status).then((res: AxiosResponse) => {
      setFancies(res.data.data)
    })
  }
  React.useEffect(() => {
    getFancyResult()
    const timeInterval = setInterval(() => {
      getFancyResult()
    }, 20 * 1000)
    return () => {
      clearInterval(timeInterval)
    }
  }, [status])

  const resultPropmet = (e: any, fancy: LFancy) => {
    e.preventDefault()
    setIsOpen(true)
    setFancy(fancy)
  }

  const onSubmitHandle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!result) toast.error('Please enter result')

    fancyService
      .fancyResult(fancy.marketId, fancy.matchId, result!)
      .then(() => {
        toast.success('Result Set')
        setIsOpen(false)
        setResult('')
        getFancyResult()
      })
      .catch((e) => {
        const err = e as Error
        toast.error(err.message)
      })
  }

  const suspendedFancy = (e: any, fancy: LFancy, type: 'isSuspend' | 'active') => {
    e.preventDefault()
    fancyService.suspendFancy(fancy.marketId, fancy.matchId, type).then((res) => {
      const allFancies = [...fancies]
      const updatedFancies: any = allFancies.map((el: LFancy) =>
        el.marketId === fancy.marketId ? { ...fancy, [type]: !fancy[type] } : el,
      )
      setFancies(updatedFancies)
    })
  }

  const rollBack = (e: any, fancy: LFancy) => {
    e.preventDefault()
    fancyService
      .fancyResultRollback(fancy.marketId, fancy.matchId)
      .then(() => {
        toast.success('Result Rollback Successfully')
        getFancyResult()
      })
      .catch((e) => {
        const err = e as Error
        toast.error(err.message)
      })
  }

  const onFancyType = (type: string) => {
    setStatus(type)
  }

  const fancyMenu = (fancyType: string) => {
    const menus = [
      { type: 'session', label: 'Fancy' },
      { type: 'fancy1', label: 'Fancy1' },
      { type: 'wkt', label: 'Wicket' },
      { type: 'Four', label: 'Four' },
      { type: 'Sixes', label: 'Six' },
      { type: 'meter', label: 'Meter' },
      { type: 'khado', label: 'Khado' },
      { type: 'odd/even', label: 'Odd/Even' },
      { type: 'ballRun', label: 'Ball Run' },
    ]

    return menus.map((menu) => (
      <li key={menu.type} onClick={(e) => onFancyType(menu.type)} className='nav-item'>
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

  return (
    <div className='col-md-12 mt-2'>
      <div className='' style={{ maxWidth: '100%' }}>
        <ul
          role='tablist'
          className='nav nav-tabs fancy-group d-flex align-items-center justify-content-center'
          aria-label='Tabs'
        >
          {fancyMenu(status)}
        </ul>
        <table
          style={{ width: '100%' }}
          className='table  table table-striped table-bordered m-t-10'
        >
          <tbody>
            <tr>
              <td colSpan={8} style={{ fontSize: '18px' }}>
                Pending Fancy
              </td>
            </tr>
            {fancies.map((fancy: LFancy, index: number) => (
              <tr
                key={fancy.marketId + fancy.fancyName + index}
                style={{
                  backgroundColor: fancy.result ? '#5eb873' : fancy.bet ? 'yellow' : '',
                  color: fancy.result ? 'white' : 'black',
                }}
                role='row'
                className='odd'
              >
                <td>
                  <i
                    className={`fas fa-circle ${
                      fancy.active ? 'text-success' : 'text-danger'
                    } fa-lg mr-2`}
                  />
                </td>
                <td className='text-left'>{fancy.fancyName}</td>
                <td className='text-left'>{fancy.result}</td>
                <td className='text-left'>{fancy.active ? 'Active' : 'In-Active'}</td>
                <td className='text-left'>{fancy.isSuspend ? 'Suspend' : 'Un-Suspend'}</td>
                <td className='text-left'>
                  <a onClick={(e) => suspendedFancy(e, fancy, 'active')} href='#'>
                    InActivate
                  </a>
                </td>
                <td className='text-left'>
                  <a onClick={(e) => suspendedFancy(e, fancy, 'isSuspend')} href='#'>
                    Click To Suspend
                  </a>
                </td>
                <td className='text-left'>
                  {!fancy.result && (
                    <a onClick={(e) => resultPropmet(e, fancy)} href='#'>
                      Result Declare
                    </a>
                  )}
                  {fancy.result && (
                    <a onClick={(e) => rollBack(e, fancy)} href='#'>
                      Rollback
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
     
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
            <h5>Set Result {fancy.fancyName}</h5>
            <button onClick={() => setIsOpen(false)} className='close float-right'>
              X
            </button>
          </div>
          <form onSubmit={onSubmitHandle} className='form loginform'>
            <div className='modal-body'>
              <div className='row form-group'>
                <div className='col-md-5'>
                  <label>Enter Result</label>
                </div>
                <div className='col-md-7'>
                  <input
                    type={'text'}
                    name={'result'}
                    onChange={(e) => setResult(e.target.value)}
                    value={result || ''}
                  />
                  {fancy.gtype === 'fancy1' && <strong>Note: Yes=1, No=0</strong>}
                </div>
              </div>
              <label>
                <input
                  type={'checkbox'}
                  name={'result'}
                  onChange={(e) => setResult(e.target.value)}
                  value={'-1'}
                />{' '}
                Abandoned
              </label>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='btn btn-info'
                data-dismiss='modal'
              >
                <i className='fas fa-undo-alt' /> Close
              </button>
              <button type='submit' className='btn btn-primary'>
                <i className='fas fa-paper-plane' /> Submit
              </button>
            </div>
          </form>
        </div>
      </ReactModal>
      {/* End Modal */}
    </div>
  )
}

export default GetAllFancy
