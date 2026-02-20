import React, { ChangeEvent, FormEvent, MouseEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import userService from '../../../services/user.service'
import { AxiosResponse } from 'axios'
import User, { RoleName, RoleType } from '../../../models/User'
import UserService from '../../../services/user.service'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DepositModal from './modals/DepositModal'
import StatusModal from './modals/StatusModal'
import WithdrawModal from './modals/WithdrawModal'
import PasswordModal from './modals/PasswordModal'
import ExposureCreditModal from './modals/ExposureCreditModal'
import { CustomLink } from '../../../pages/_layout/elements/custom-link'
import { useWebsocketUser } from '../../../context/webSocketUser'
import Pdf from 'react-to-pdf'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import moment from 'moment'
import { useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import GeneralSettingsModal from './modals/GeneralSettingsModal'
import Modal from 'react-modal'
import { Container, Form, Modal as BModal, Row } from 'react-bootstrap'
import { selectLoader } from '../../../redux/actions/common/commonSlice'
import SubmitButton from '../../../components/SubmitButton'
import { debounce } from 'lodash'
import betService from '../../../services/bet.service'
import ReactPaginate from 'react-paginate'

const ListClients = () => {
  const ref: any = React.createRef()
  const userState = useAppSelector(selectUserData)
  const loading = useAppSelector(selectLoader)
  const [page, setPage] = React.useState(1)

  const [users, setUserList] = React.useState<{ items: User[]; totalPages?: number }>()
  const [usersTotal, setUserListTotal] = React.useState<any>({
    totalcr: 0,
    totalbalance: 0,
    clientpl: 0,
    exposer: 0,
    totalExposer: 0,
    avl: 0,
  })
  const { socketUser } = useWebsocketUser()
  const [userbook, setUserBook] = React.useState<any>(false)
  const { username, search } = useParams()
  const [searchParams] = useSearchParams()
  const [depositUser, setDepositUser] = React.useState<User>({} as User)
  const [userBookData, setUserBookData] = React.useState<any>({})
  const [modalType, setModalType] = React.useState('EXP')
  const [callbacklist, setcallbacklist] = React.useState(false)
  const [txnPassword, setTxnPassword] = React.useState('')
  const [searchClient, setSearchClient] = React.useState('')
  const [debouncedValue, setDebouncedValue] = React.useState<string>(searchClient)
  const [selectAll, setSelectAll] = React.useState(false)
  const [activeDeactive, setActiveDeactive] = React.useState(true)

  const [showDialog, setDialog] = React.useState<{
    d?: boolean
    p?: boolean
    s?: boolean
    w?: boolean
    e?: boolean
    gs?: boolean
  }>({
    d: false,
    p: false,
    s: false,
    w: false,
    e: false,
    gs: false,
  })

  const [show, setShow] = React.useState(false)

  const [searchObj, setSearchObj] = React.useState<any>({
    type: '',
    username: '',
    status: '',
    search: '',
  })

  const roles = React.useMemo(() => {
    const { user } = userState
    const allOptions = Object.keys(RoleType)
    const startIndex = allOptions.indexOf(user.role!)
    return allOptions.slice(startIndex + 1).filter((role) => role !== 'admin')
  }, [userState])

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  React.useEffect(() => {
    Modal.setAppElement('body')
    const ac = new AbortController()
    return () => ac.abort()
  }, [])

  React.useEffect(() => {
    setSearchObj({ ...searchObj, username: username! })
  }, [username])

  React.useEffect(() => {
    const search = searchParams.get('search') ? searchParams.get('search') : ''
    getList({ username: username!, search: search!, type: '' })
    setPage(1)
  }, [username, searchParams.get('search'), callbacklist])

  React.useEffect(() => {
    clientlistdata(users)
  }, [users])

  const handlePageClick = (event: any) => {
    //
    setPage(event.selected + 1)
    getList({ ...searchObj, page: event.selected + 1 })
  }

  const openModal = (type: string) => {
    const types = { ...showDialog, [type]: true }
    setcallbacklist(false)
    setDialog(types)
  }

  const closeModal = (type: string) => {
    const types = { ...showDialog, [type]: false }
    setDialog(types)
  }

  const refreshClientList = (type: boolean) => {
    setcallbacklist(type)
  }

  const getUserDetail = (user: any) => {
    const username = user.username
    UserService.getParentUserDetail(username).then((res: AxiosResponse<any>) => {
      setDepositUser(res.data.data[0])
    })
  }

  const getList = (obj: {
    username: string
    type: string
    search: string
    status?: string
    page?: number
  }) => {
    if (!obj.page) obj.page = 1
    userService.getUserList(obj).then((res: AxiosResponse<any>) => {
      setSearchObj(obj)
      console.log(res.data.data)
      setUserList(res.data.data)
      clientlistdata(res.data.data.items)
    })
  }

  /***** UPDATE USER AND BAT STATUS ****/

  const updateStatus = (itemIndex: number, value: any, type: string) => {
    const updateListOfItems = users && users.items.length > 0 ? [...users.items] : []
    const item = updateListOfItems[itemIndex]
    type === 'user' ? (item.isLogin = value) : (item.betLock = value)
    setUserList({ ...users, items: updateListOfItems })
    const formData = {
      isUserActive: item.isLogin ? item.isLogin : false,
      isUserBetActive: item.betLock ? item.betLock : false,
      username: item.username,
      single: true,
    }

    UserService.updateUserAndBetStatus(formData)
      .then(() => {
        closeModal('s')
        toast.success('Status Updated Successfully')
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }

  /******** UPDATE LIST DATA ********/

  const updateListUser = (user: User) => {
    // if (user.balance) {
    //   console.log(user)
    //   const updateListOfItems = [...users]
    //   const index = updateListOfItems.findIndex((u) => u.username === user.username)
    //   updateListOfItems[index].balance = user.balance
    //   //updateListOfItems[index].profitLoss = user.amount
    //   clientlistdata(updateListOfItems)
    //   setUserList(updateListOfItems)
    // }
    getList({ ...searchObj, search: 'false' })
  }
  const logOutAllUsers = () => {
    socketUser.emit('logoutAll')
  }
  const exportExcel = () => {
    // export pdf
    const usersData = users?.items.map((user) => {
      const { username, creditRefrences, balance, isLogin, betLock, exposerLimit, role } = user
      return {
        Username: username,
        'Credit Refrences': creditRefrences,
        Balance: balance?.balance.toFixed(2),
        'Client Pnl': getclientpl(user),
        Exposer: balance?.exposer?.toFixed(2),
        'Available Balance': ((balance?.balance || 0) - (balance?.exposer || 0)).toFixed(2),
        'Is Login': isLogin,
        'Bet Lock': betLock,
        'Exposer Limit': exposerLimit,
        Percentage: 0,
        Role: RoleName[role!],
      }
    })
    exportToExcel(usersData)
  }

  const setuserresponse = () => {
    if (!userbook) {
      userService.getUserBook().then((res: AxiosResponse<any>) => {
        setUserBook(true)
        setUserBookData(res.data.data)
      })
    } else {
      setUserBook(false)
    }
  }

  const getclientpl = (row: any) => {
    const clientpl = row.balance?.profitLoss || 0
    // if (row) {
    //   clientpl = (parseFloat(row?.creditRefrences) - parseFloat(row?.balance?.balance)).toFixed(2)
    // }
    return clientpl
  }

  const exportToExcel = (data: any) => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Convert the data into a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // Generate an Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

    // Convert the Excel buffer to a Blob
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Save the Blob as a file
    saveAs(blob, `users-${moment().format('MMMM-Do-YYYY-h:mm:ss-a')}.xlsx`)
  }

  const clientlistdata = (userd: any) => {
    let objTotal: any = {
      totalcr: 0,
      totalbalance: 0,
      clientpl: 0,
      exposer: 0,
      totalExposer: 0,
      avl: 0,
    }
    if (userd) {
      userd.items
        ?.filter((user: User) => user.isLogin === activeDeactive)
        ?.map((user: User, index: number) => {
          const balance: any = mainBalance(user)
          const casinoexposer: any =
            user && user.balance && user.balance.casinoexposer ? user.balance.casinoexposer : 0
          const exposer: any =
            user && user.balance && user.balance.exposer
              ? user.balance.exposer + +casinoexposer
              : 0 + +casinoexposer
          const mainbalance: any =
            user && user.balance && user.balance.balance ? user.balance.balance : 0
          const totalcr =
            objTotal.totalcr + +(user && user.creditRefrences ? user.creditRefrences : 0)
          const totalbalance: number = objTotal.totalbalance + +balance
          const clientpl: number = objTotal.clientpl + +getclientpl(user)
          const totalExposer: number = objTotal.totalExposer + +exposer
          const avl: number = objTotal.avl + +(mainbalance - exposer)

          objTotal = {
            ...objTotal,
            ...{ totalbalance, totalcr, clientpl, exposer, totalExposer, avl },
          }
        })
    }
    setUserListTotal(objTotal)
  }

  const resetTxnPassword = (user: User) => {
    setDepositUser(user)
    handleShow()
  }

  const resetTxnPasswordSubmit = (e: any) => {
    e.preventDefault()
    userService
      .resetTxnPassword({ userId: depositUser._id, transactionPassword: txnPassword })
      .then((res: AxiosResponse) => {
        toast.success(res.data.message)
        handleClose()
      })
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    //setSearchClient('')
    getList({ ...searchObj, search: 'true' })
  }

  const getcurrentpartnership = (users: any) => {
    const userp = users?.partnership || {}
    const ownration = userp[4] ? userp[4].ownRatio : '0'
    return ownration
  }

  const isAdmin = React.useCallback(
    (user: User) => {
      if (userState.user.role !== RoleType.admin && userState.user.role !== RoleType.sadmin) {
        return user?.parentStr?.[user?.parentStr?.length - 1] === userState.user._id
      }
      return true
    },
    [userState],
  )

  const mainBalance = (row: any) => {
    const creditRef = row?.creditRefrences || 0
    const clientpl = row.balance?.profitLoss || 0
    return (parseFloat(creditRef) + +parseFloat(clientpl))?.toFixed(2)
  }
  /* Checkbox functionality */
  const handleSelectItem = (user: User) => {
    if (users && users.items.length > 0) {
      const updatedUsers = users.items.map((u) =>
        u === user ? { ...u, selected: !u.selected } : u,
      )

      setUserList({ ...users, items: updatedUsers })
    }
  }

  const handleSelectAll = () => {
    setSelectAll(!selectAll) // Toggle the state of "Select All" checkbox
    if (users) {
      const updatedHistory = users.items.map((user: User) => ({
        ...user,
        selected: !selectAll,
      }))
      setUserList({ ...users, items: updatedHistory })
    }
  }

  const lock = (e: MouseEvent<HTMLAnchorElement>, lock: boolean, type: string) => {
    e.preventDefault()

    const select = users?.items.reduce((selected: boolean, item: User) => {
      if (item.selected) {
        selected = true
      }
      return selected
    }, false)
    if (selectAll || select) {
      const selectedItems: any = users?.items
        .filter((item: User) => item.selected)
        .map((item: User) => item._id)
      if (selectedItems.length > 0 && users) {
        betService.usersLockClientList({ ids: selectedItems, lock, type }).then((res) => {
          if (res.data.data.success) {
            const updatedUsers = users.items.map((u) => ({
              ...u,
              selected: !u.selected,
              [type === 'betLock' ? 'betLock' : 'isLogin']: lock,
            }))
            setUserList({ ...users, items: updatedUsers })
            setSelectAll(false)
            toast.success(res.data.message)
          }
        })
      }
    } else {
      toast.error('Please select one item')
    }
  }

  const onSearch = (e: string) => {
    if (e) getList({ username: e, search: 'true', type: '' })
    else if (username) getList({ username: username, search: 'false', type: '' })
    else getList({ username: '', search: 'false', type: '' })
  }

  const typesOfClients = (e: MouseEvent<HTMLAnchorElement>, status: string) => {
    e.preventDefault()
    setActiveDeactive(status === 'true')
    getList({ username: username!, search: 'false', type: '', status })
  }

  const debouncedChangeHandler = React.useCallback(debounce(onSearch, 500), [username])
  const finalExposer = (userB: any) => {
    const ex = userB?.exposer?.toString() || '0'
    const cex = userB?.casinoexposer?.toString() || '0'
    console.log(ex)
    const finalE = parseFloat(ex) + +parseFloat(cex)
    return finalE.toFixed(2)
  }
  return (
    <>
      <div className='container-fluid'>
        <div className='row'>
          <div className='master-balance'>
            <div
              className='text-center'
              onClick={() => {
                setuserresponse()
              }}
            >
              <span className='far fa-arrow-alt-circle-down' id='user-balance' />
              <span className='far fa-arrow-alt-circle-up' />
            </div>
            {userbook && (
              <div className='master-balance-detail m-t-20' id='master-balance-detail'>
                <div className='master-balance'>
                  <div className='master-balance-detail m-t-20' id='master-balance-detail'>
                    <ul className='row'>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left  p-0'>
                          Upper Level Credit Referance:
                        </label>
                        <span className='text-right col-md-4  p-0'>
                          {userBookData.uplevelcr?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>Down level Occupy Balance:</label>
                        <span className='text-right col-md-4  p-0'>
                          {userBookData.downlineob?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0 '>
                          Down Level Credit Referance:
                        </label>
                        <span className='text-right col-md-4  p-0'>
                          {userBookData.downcr?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>Total Master Balance</label>
                        <span className='text-right col-md-4 p-0'>
                          {userBookData.totalmasterb?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>Upper Level:</label>
                        <span className='text-right col-md-4 p-0'>
                          {userBookData.upperlvell?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>Down Level Profit/Loss :</label>
                        <span className='text-right col-md-4 p-0'>
                          {userBookData.downpl?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>Available Balance:</label>
                        <span className='text-right col-md-4 p-0'>
                          {userBookData.availableB?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>
                          Available Balance With Profit/Loss:
                        </label>
                        <span className='text-right col-md-4 p-0'>
                          {userBookData.avpl?.toFixed(2)}
                        </span>
                      </li>
                      <li className='col-md-4'>
                        <label className='col-md-8 text-left p-0'>My Profit/Loss:</label>
                        <span className='text-right col-md-4 p-0'>
                          {userBookData.mypl?.toFixed(2)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12 main-container'>
            <div className='listing-grid'>
              <div className='detail-row '>
                <div className=' row'>
                  <div className='col-md-10 '>
                    <div className=''>
                      <h2 className='d-inline-block'>Account List</h2>
                      <p>
                        {(userState.user.role == RoleType.admin ||
                          userState.user.role == RoleType.sadmin) && (
                            <button
                              type='submit'
                              onClick={logOutAllUsers}
                              className='btn btn-primary'
                            >
                              Logout All Users
                            </button>
                          )}

                        <button type='submit' onClick={exportExcel} className='btn btn-small bg-green mrc-5 mlc-5'>
                          Excel
                        </button>

                        <Pdf
                          targetRef={ref}
                          filename={`users-${moment().format('MMMM-Do-YYYY-h:mm:ss-a')}.pdf`}
                        >
                          {({ toPdf }: any) => (
                            <button className='btn btn-small bg-red' onClick={toPdf}>
                              PDF
                            </button>
                          )}
                        </Pdf>
                      </p>
                    </div>
                    {/* <Form onSubmit={handleSearch} className='col-md-4 row'>
                      <div className='col-md-6'>
                        <Form.Label htmlFor='user-type'>Select Type</Form.Label>
                        <Form.Select
                          className='mx-input'
                          onChange={(e) => setSearchObj({ ...searchObj, type: e.target.value })}
                          id='user-type'
                          aria-label='Default select example'
                        >
                          <option>Select Type</option>
                          {roles.map((role: any) => (
                            <option key={role} value={role}>
                              {RoleName[role]}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className='col-md-6'>
                        <Form.Label>&nbsp;</Form.Label>
                        <SubmitButton className='btn btn-primary form-group w-100'>
                          Search
                        </SubmitButton>
                      </div>
                    </Form>
                    <div className='col-md-3'>
                      <Form.Label>&nbsp;</Form.Label>
                      <Dropdown>
                        <Dropdown.Toggle variant='primary' id='dropdown-basic'>
                          User Action
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                              lock(e, false, 'betLock')
                            }
                          >
                            Bet Lock
                          </Dropdown.Item>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, true, 'betLock')}
                          >
                            Bet Unlock
                          </Dropdown.Item>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                              lock(e, false, 'loginLock')
                            }
                          >
                            Login Lock
                          </Dropdown.Item>
                          <Dropdown.Item
                            href='#'
                            onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                              lock(e, true, 'loginLock')
                            }
                          >
                            Login unlock
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div> */}

                    {/* <div className='col-md-2'>
                      <Form.Label>&nbsp;</Form.Label>
                      <button className='btn btn-primary form-group w-100'>Bet Lock</button>
                    </div> */}
                  </div>
                  <div className='float-right col-md-2 m-b-10'>
                    <p className='text-right'>
                      {username ? (
                        <CustomLink to={`/add-user/${username}`} className='btn btn-diamond'>
                          Add Account
                        </CustomLink>
                      ) : (
                        <CustomLink to={`/add-user`} className='btn btn-diamond'>
                          Add Account
                        </CustomLink>
                      )}
                    </p>
                    <input
                      type='text'
                      placeholder='Search client'
                      className='mx-input mt-2'
                      onChange={(e) => debouncedChangeHandler(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <ul className='nav nav-tabs'>
                <li className='nav-item'>
                  <a
                    className={`nav-link ${activeDeactive ? 'active' : ''}`}
                    aria-current='page'
                    href='#'
                    onClick={(e) => typesOfClients(e, 'true')}
                  >
                    Active
                  </a>
                </li>
                <li className='nav-item'>
                  <a
                    className={`nav-link ${!activeDeactive ? 'active' : ''}`}
                    href='#'
                    onClick={(e) => typesOfClients(e, 'false')}
                  >
                    Deactive
                  </a>
                </li>
              </ul>
              <div className='table-responsive data-table' ref={ref}>
                <table
                  id='clientListTable'
                  className='table table-striped  table-bordered '
                  style={{ width: '100%' }}
                >
                  <thead>
                    <tr>
                      {/* <th>
                        <input
                          type={'checkbox'}
                          checked={selectAll || false}
                          onChange={handleSelectAll}
                        />
                      </th> */}
                      <th>User Name</th>
                      <th>Credit Referance</th>
                      <th>Balance</th>
                      <th>Client (P/L)</th>
                      <th>Exposure</th>
                      <th>Available Balance</th>
                      <th className='noExport'>U St</th>
                      <th className='noExport'>B St</th>
                      <th>Exposure Limit</th>
                      <th>Default %</th>
                      <th>Account Type</th>
                      <th className='noExport'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* <th></th> */}
                      <th>Total</th>
                      <th>{usersTotal.totalcr.toFixed(2)}</th>
                      <th>{usersTotal.totalbalance.toFixed(2)}</th>
                      <th>{usersTotal.clientpl.toFixed(2)}</th>
                      <th>{usersTotal.totalExposer.toFixed(2)}</th>
                      <th>{usersTotal.avl.toFixed(2)}</th>
                      <th className='noExport'></th>
                      <th className='noExport'></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th className='noExport'></th>
                    </tr>
                    {users?.items?.map((user: User, index: number) => {
                      if (activeDeactive !== user.isLogin && user.role !== RoleType.admin)
                        return null
                      return (
                        <tr key={user._id}>
                          {/* <td>
                            <input
                              type={'checkbox'}
                              checked={user.selected || false}
                              onChange={() => handleSelectItem?.(user)}
                            />
                          </td> */}
                          <td>
                            {user.role !== RoleType.user && (
                              <CustomLink to={`/list-clients/${user.username}`}>
                                {user.username}
                              </CustomLink>
                            )}
                            {user.role === RoleType.user && (
                              <a className='bg-success'>{user.username}</a>
                            )}
                          </td>
                          <td>{user?.creditRefrences ? user.creditRefrences : 0}</td>
                          <td>{mainBalance(user)}</td>
                          <td
                            className={
                              user?.balance?.profitLoss && user?.balance?.profitLoss > 0
                                ? ''
                                : ''
                            }
                          >
                            {user?.balance?.profitLoss?.toFixed(2) || 0}
                          </td>
                          <td>{finalExposer(user?.balance)}</td>
                          <td>
                            {(
                              (user.balance?.balance || 0) -
                              (user.balance?.exposer || 0) -
                              (user.balance?.casinoexposer || 0)
                            ).toFixed(2)}
                          </td>
                          <td>
                            {user.role !== RoleType.admin && (
                              <input
                                className='form-control'
                                type='checkbox'
                                name={'U St'}
                                checked={user?.isLogin}
                                onChange={() => updateStatus(index, !user?.isLogin, 'user')}
                              />
                            )}
                          </td>
                          <td>
                            {user.role !== RoleType.admin && (
                              <input
                                className='form-control'
                                type='checkbox'
                                name={'B St'}
                                checked={user?.betLock}
                                onChange={() => updateStatus(index, !user?.betLock, 'bet')}
                              />
                            )}
                          </td>
                          <td>{user.exposerLimit ? user.exposerLimit : 0}</td>
                          <td>{getcurrentpartnership(user)}</td>
                          <td>{RoleName[user.role!]}</td>
                          <td>
                            <a
                              onClick={() => {
                                openModal('d')
                                getUserDetail(user)
                              }}
                            >
                              D
                            </a>
                            <a
                              onClick={() => {
                                openModal('w')
                                getUserDetail(user)
                              }}
                            >
                              W
                            </a>

                            {isAdmin(user) && user.role !== RoleType.admin && (
                              <a
                                onClick={() => {
                                  openModal('e')
                                  getUserDetail(user)
                                  setModalType('EXP')
                                }}
                              >
                                L
                              </a>
                            )}
                            {isAdmin(user) && user.role !== RoleType.admin && (
                              <a
                                onClick={() => {
                                  openModal('e')
                                  getUserDetail(user)
                                  setModalType('CRD')
                                }}
                              >
                                C
                              </a>
                            )}
                            {isAdmin(user) && user.role !== RoleType.admin && (
                              <a
                                onClick={() => {
                                  openModal('p')
                                  getUserDetail(user)
                                }}
                              >
                                P
                              </a>
                            )}
                            {isAdmin(user) && user.role !== RoleType.admin && (
                              <a
                                onClick={() => {
                                  openModal('s')
                                  getUserDetail(user)
                                }}
                              >
                                S
                              </a>
                            )}
                            {isAdmin(user) && (
                              <a
                                onClick={() => {
                                  openModal('gs')
                                  getUserDetail(user)
                                }}
                              >
                                GS
                              </a>
                            )}
                            {isAdmin(user) && (
                              <a
                                onClick={() => {
                                  resetTxnPassword(user)
                                }}
                              >
                                T
                              </a>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <ReactPaginate
                breakLabel='...'
                nextLabel='>>'
                forcePage={page - 1}
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={users?.totalPages || 0}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                breakClassName={'break-me'}
              />
            </div>

            <DepositModal
              showDialog={showDialog.d!}
              closeModal={(status: string, balance: any) => {
                closeModal(status); updateListUser({ ...depositUser });
              }}
              depositUser={depositUser}
            />

            <StatusModal
              showDialog={showDialog.s!}
              closeModal={() => {
                closeModal('s'); updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
              refreshClientList={refreshClientList}
            />

            <WithdrawModal
              showDialog={showDialog.w!}
              closeModal={(status: string, balance: any) => {
                closeModal(status); updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
            />

            <PasswordModal
              showDialog={showDialog.p!}
              closeModal={() => {
                closeModal('p'); updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
            />

            <ExposureCreditModal
              showDialog={showDialog.e!}
              closeModal={() => {
                closeModal('e'); updateListUser({ ...depositUser });
              }}
              userDetails={depositUser}
              modalType={modalType}
            />

            <GeneralSettingsModal
              showDialog={showDialog.gs!}
              closeModal={(status: string, balance: any) => {
                closeModal(status); updateListUser({ ...depositUser, balance });
              }}
              depositUser={depositUser}
            />
            <BModal show={show} onHide={handleClose}>
              <BModal.Header closeButton>
                <BModal.Title>Reset User Transaction Password</BModal.Title>
              </BModal.Header>
              <BModal.Body>
                <Container>
                  <form onSubmit={resetTxnPasswordSubmit}>
                    <Row>
                      <Form.Group className='form-group col-md-12'>
                        <Form.Control
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setTxnPassword(e.target.value)
                          }
                          type='text'
                          placeholder='Type Your Transaction Password'
                        />
                      </Form.Group>
                    </Row>

                    <BModal.Footer>
                      <SubmitButton type='submit' className='btn btn-submit' disabled={loading}>
                        Submit
                        <i className='fas fa-sign-in-alt' />
                      </SubmitButton>
                    </BModal.Footer>
                  </form>
                </Container>
              </BModal.Body>
            </BModal>
          </div>
        </div>
      </div>
    </>
  )
}
export default ListClients
