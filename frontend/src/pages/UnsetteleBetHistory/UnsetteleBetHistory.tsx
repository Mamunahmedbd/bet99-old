import React from 'react'
import ReactPaginate from 'react-paginate'
import { toast } from 'react-toastify'
import UserService from '../../services/user.service'
import moment from 'moment'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import { IBetOn } from '../../models/IBet'

const UnsetteleBetHistory = () => {
  const [bethistory, setbethistory] = React.useState<any>({})
  const [filterdata, setfilterdata] = React.useState<any>({ status: 'pending' })
  const [page, setPage] = React.useState(1)
  const [isLoading, setloading] = React.useState<any>(false)
  React.useEffect(() => {
    getbethistory(1)
  }, [])

  const getbethistory = (page: number) => {
    UserService.getUsercompletedbets(page, filterdata)
      .then((res) => {
        res && res.data && res.data.data && setbethistory(res.data.data)
        setPage(page)
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }
  const createSrNo = (index: number) => {
    return (page - 1) * bethistory.limit + index + 1
  }
  const trrepeat = (Item: any, index: number) => {
    const classdata = Item.isBack ? 'back' : 'lay'
    return (
      <>
        <tr key={index} className={classdata}>
          <td>{createSrNo(index)}</td>
          <td className='text-center wnwrap'>{Item.matchName}</td>
          <td className='text-center wnwrap'>{`${Item.selectionName} / ${
            Item.bet_on == IBetOn.FANCY ? Item.volume : Item.odds
          }`}</td>
          <td className='text-center wnwrap'>{Item.sportId}</td>
          <td className='text-center wnwrap'>{Item.marketName}</td>
          <td className='text-center wnwrap'>{Item.odds}</td>
          <td className='text-center wnwrap'>{Item.stack}</td>
          <td className='text-center wnwrap'>
            {Item.createdAt &&
              moment(Item.createdAt.replace('T', ' ').replace('Z', '')).format(
                'YYYY-MM-DD HH:mm:ss',
              )}
          </td>
        </tr>
      </>
    )
  }
  const handleformchange = (event: any) => {
    const filterObj = filterdata
    if (event.target.name == 'bet_status') {
      filterObj.status = event.target.value == 'deleted' ? 'deleted' : 'pending'
    }
    filterObj[event.target.name] = event.target.value
    setfilterdata(filterObj)
  }
  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getbethistory(1)
  }
  const handlePageClick = (event: any) => {
    getbethistory(event.selected + 1)
  }

  const TransactionData =
    bethistory && bethistory.docs && bethistory.docs.length ? (
      bethistory.docs.map((item: any, index: number) => {
        return trrepeat(item, index)
      })
    ) : isLoading ? (
      <tr>
        <td colSpan={8} style={{ textAlign: 'center' }}>
          Please wait
        </td>
      </tr>
    ) : (
      <tr>
        <td colSpan={8} style={{ textAlign: 'center' }}>
          No Result Found
        </td>
      </tr>
    )
  return (
    <>
      {mobileSubheader.subheader('Unsettle Bet History')}
      <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
        <div className=''>
          {mobileSubheader.subheaderdesktop('Unsettle Bet History')}
          <div className='card-body p0'>
            <form
              className='ng-pristine ng-valid ng-touched mb-0'
              method='post'
              onSubmit={handleSubmitform}
            >
              <div className='row row5'>
                <div className='col-12 col-lg-2 mbc-5'>
                  <div className='form-group mb-0'>
                    <select
                      name='bet_status'
                      onChange={handleformchange}
                      className='custom-select ng-untouched ng-pristine ng-valid'
                    >
                      <option value='ALL'>Bet Type </option>
                      <option value='matched'>Matched </option>
                      <option value='unmatched'>Un-Matched </option>
                      <option value='deleted'>Deleted </option>
                    </select>
                  </div>
                </div>
                <div className='col-12 col-lg-1 mbc-5'>
                  <button type='submit' className='btn btn-primary btn-block'>
                    Submit
                  </button>
                </div>
              </div>
            </form>
            <div className='table-responsive'>
              <table id='customers1'>
                <thead>
                  <tr>
                    <th className='text-center bg2 text-white '>No</th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Event Name
                    </th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Nation
                    </th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Event Type
                    </th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Type
                    </th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Rate{' '}
                    </th>
                    <th className='text-center bg2 text-white '>Amount</th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Place Date
                    </th>
                  </tr>
                </thead>
                <tbody>{TransactionData}</tbody>
              </table>
            </div>
            <ReactPaginate
              breakLabel='...'
              nextLabel='>>'
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={bethistory.totalPages}
              containerClassName={'pagination'}
              activeClassName={'active'}
              previousLabel={'<<'}
              breakClassName={'break-me'}
            />
          </div>
        </div>
      </div>
    </>
  )
}
export default UnsetteleBetHistory
