import React, { useEffect, useState } from 'react'
import './depositstatement.css'
import { useLocation } from 'react-router-dom'
import moment from 'moment'
import depositWithdrawService from '../../services/deposit-withdraw.service'
const DepositStatement = () => {
  const location = useLocation()
  const [depositStatement, setDepositStatement] = useState([])
  // const [pageCount, setPageCount] = React.useState<any>(0)

  const [filterData, setFilterData] = useState<any>({
    startDate: '',
    endDate: '',
    reportType: '',
  })
  useEffect(() => {
    getAccountStmt(1)
  }, [])

  React.useEffect(() => {
    const filterObj = filterData
    filterObj.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    filterObj.endDate = moment().format('YYYY-MM-DD')
    setFilterData(filterObj)
  }, [])

  const getAccountStmt = (page: number) => {
    const type = location.pathname == '/withdrawstatement' ? 'withdraw' : 'deposit'
    depositWithdrawService
      .getDepositWithdrawLists({ type: type, ...filterData })
      .then((res) => setDepositStatement(res?.data?.data))
  }

  const handleformchange = (event: any) => {
    const filterObj = filterData
    filterObj[event.target.name] = event.target.value
    setFilterData(filterObj)
  }

  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getAccountStmt(1)
  }
  // const location = useLocation()
  // const [depositStatement, setDepositStatement] = useState([])
  // useEffect(() => {
  //   location.pathname == '/withdrawstatement'
  //     ? getDepositData('withdraw')
  //     : getDepositData('deposit')
  // }, [])
  // const getDepositData = async (type: string) => {
  //   const response = await depositWithdrawService.getDepositWithdrawLists({ type })
  //   if (response?.data?.data) {
  //     setDepositStatement(response?.data?.data)
  //   }
  // }
  return (
    <div className='mt-10' >
      <div className='card mb-10'>
        <div className="card-header"><h4 className="mb-0"> {location.pathname == '/withdrawstatement' ? `Withdraw Statement` : `Deposit Statement`}</h4></div>
        <div className='card-body'>
        <div className='report-search search-box'>
      <form className='report-form' method='post' onSubmit={handleSubmitform}>
      <div className='container-fluid'>
      <div className='row'>
        <div className='col-lg-2' style={{paddingLeft:"0px"}}> 
                    <div className='form-group from-date' style={{ width: "100%" }}>
          <label>From</label>
          
              <input
                name='startDate'
                type='date'
                autoComplete='off'
                className='form-control'
                onChange={handleformchange}
                defaultValue={filterData.startDate}
                style={{width:"100%"}}
              />
          
        </div>
        </div>
                  <div className='col-lg-2'>

                    <div className='form-group to-date' style={{ width: "100%" }}>
          <label>To</label>
        
              <input
                name='endDate'
                type='date'
                autoComplete='off'
                defaultValue={filterData.endDate}
                onChange={handleformchange}
                className='form-control'
                style={{ width: "100%" }}
              />
          
        </div>
        </div>
        <div className='col-lg-2'>

                    <div className='form-group' style={{ width: "100%" }}>
          <label>Type</label>
          <select name='reportType' style={{width:"100%"}} onChange={handleformchange} className='form-control'>
            <option value=''>All </option>
            <option value='approved'>Approved</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
          </select>
        </div>
        </div>
        <div className='col-lg-3'>
        <label style={{width:"100%"}}>&nbsp;</label>
        <button type='submit' className='btn btn-primary'>
          Submit
        </button>
        </div>
                </div>
              </div>
      </form>
  
       <div className='table-responsive mt-10'>
        <table className='table table-bordered' id='customers1'>
          <thead>
            <tr>
              <th className='bet-event-name'>
                <div>Type</div>
              </th>
              <th className='bet-event-name'>
                <div>Amount</div>
              </th>
              <th className='bet-date'>
                <div>Date</div>
              </th>
              <th className='bet-event-name'>
                <div>Status</div>
              </th>
              <th className='bet-event-name'>
                <div>Remark</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {depositStatement ? (
              depositStatement.map((deposit: any) => {
                const dateData = moment(deposit.createdAt).format('DD/MM/YYYY h:mm:ss A')
                return (
                  <tr key={deposit._id}>
                    <td>{deposit.type}</td>
                    <td>{deposit.amount}</td>
                    <td>{dateData}</td>
                    <td>{deposit.status}</td>
                    <td>{deposit.remark}</td>
                  </tr>
                )
              })
            ) : (
              <tr className='no-record'>
                <td colSpan={7}>No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositStatement
