import React from 'react'
import ReactPaginate from 'react-paginate'
import { toast } from 'react-toastify'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import moment from 'moment'
import accountService from '../../services/account.service'
import { SportName } from '../../models/SportTypes'

const ProfitLoss = () => {
  const [filterdata, setfilterdata] = React.useState<any>({ startDate: '', endDate: '' })
  const [bethistory, setbethistory] = React.useState<any>({})
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const filterObj = filterdata
    filterObj.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    filterObj.endDate = moment().format('YYYY-MM-DD')
    setfilterdata(filterObj)
    getAccountStmt(1)
  }, [])

  const getAccountStmt = (page: number) => {
    accountService
      .getProfitLoss(page, filterdata)
      .then((res) => {
        res && res.data && res.data.data && setbethistory(res.data.data)
        setPage(page)
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }
  const handleformchange = (event: any) => {
    const filterObj = filterdata
    filterObj[event.target.name] = event.target.value
    setfilterdata(filterObj)
  }
  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getAccountStmt(1)
  }
  const handlePageClick = (event: any) => {
    getAccountStmt(event.selected + 1)
  }
  const trrepeat = (Item: any, index: number) => {
    const classdata = Item.total > 0 ? 'green' : 'red'
    const splitname = Item.narration != '' ? Item.narration.split('/')[0] : ''
    return (
      <>
        <tr key={index}>
          <td>{SportName[Item.sportId]}</td>
          <td className='text-center wnwrap'>{splitname}</td>
          <td className={`text-center wnwrap ${classdata}`}>{Item?.total?.toFixed(2)}</td>
        </tr>
      </>
    )
  }
  const TransactionData =
    bethistory && bethistory.items && bethistory.items.length ? (
      bethistory.items.map((item: any, index: number) => {
        return trrepeat(item, index)
      })
    ) : (
      <tr>
        <td colSpan={8} style={{ textAlign: 'center' }}>
          No Result Found
        </td>
      </tr>
    )
  return (
    <>
      {mobileSubheader.subheader('Profit/Loss')}
      <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
        <div className=''>
          {mobileSubheader.subheaderdesktop('Profit/Loss')}
          <div className='card-body p0'>
            <form
              className='ng-pristine ng-valid ng-touched mb-0'
              method='post'
              onSubmit={handleSubmitform}
            >
              <div className='row row5'>
                <div className='col-6 col-lg-2 mbc-5'>
                  <div className='form-group mb-0'>
                    <div className='mx-datepicker'>
                      <div className='mx-input-wrapper'>
                        <input
                          name='startDate'
                          type='date'
                          autoComplete='off'
                          onChange={handleformchange}
                          defaultValue={filterdata.startDate}
                          placeholder='Select Date'
                          className='mx-input ng-pristine ng-valid ng-touched'
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-6 col-lg-2 mbc-5'>
                  <div className='form-group mb-0'>
                    <div className='mx-datepicker'>
                      <div className='mx-input-wrapper'>
                        <input
                          name='endDate'
                          type='date'
                          autoComplete='off'
                          defaultValue={filterdata.endDate}
                          onChange={handleformchange}
                          placeholder='Select Date'
                          className='mx-input ng-untouched ng-pristine ng-valid'
                        />
                      </div>
                    </div>
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
                    <th className='text-center bg2 text-white wnwrap'>Event Type</th>
                    <th className='text-center bg2 text-white wnwrap'>Event Name </th>
                    <th className='text-center bg2 text-white wnwrap'>Amount</th>
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
export default ProfitLoss
