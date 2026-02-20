import React, { ChangeEvent, MouseEvent } from 'react'
import { Button, Container, Dropdown, Form, Modal, Row, Table } from 'react-bootstrap'
import betService from '../../../services/bet.service'
import { AxiosResponse } from 'axios'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectCurrentMatch } from '../../../redux/actions/sports/sportSlice'
import IMatch from '../../../models/IMatch'
import User from '../../../models/User'
import { Paginate } from '../../../models/Paginate'
import IMarket from '../../../models/IMarket'
import { FancyBook, setMarketBookUser } from '../../../redux/actions/bet/betSlice'

const MarketType: any = { M: 'Odds', B: 'Book', F: 'Fancy' }
const MarketTypeKey: any = { M: 'betFair', B: 'book', F: 'fancy' }

const BetLock = ({ markets }: { markets: IMarket[] }) => {
  const [show, setShow] = React.useState(false)
  const currentMatch: IMatch = useAppSelector(selectCurrentMatch)
  const [selectedType, setSelectedType] = React.useState('')
  const dispatch = useAppDispatch()
  const [users, setUsers] = React.useState<Paginate<Array<Partial<User>>>>(
    {} as Paginate<Array<Partial<User>>>,
  )
  const [value, setValue] = React.useState('')
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)
  const [debouncedValue, setDebouncedValue] = React.useState<string>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 500)
    return () => clearTimeout(timer)
  }, [value, 500])

  React.useEffect(() => {
    if (currentMatch && currentMatch.matchId && selectedType) {
      if (debouncedValue) {
        getUserList(debouncedValue)
      } else {
        getUserList('')
      }
    }
  }, [debouncedValue, currentMatch])

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const lock = (e: MouseEvent<HTMLAnchorElement>, status: boolean, type: string) => {
    e.preventDefault()
    if (currentMatch && currentMatch.matchId) {
      betService.betLock({ match: currentMatch, type, status }).then((res: AxiosResponse) => {
        console.log(res.data)
      })
    }
  }

  const getUserList = (username: string) => {
    betService.getChildUserList(currentMatch.matchId, username).then((res: AxiosResponse) => {
      setUsers(res.data.data)
      handleShow()
    })
  }

  const selectUser = (e: MouseEvent<HTMLAnchorElement>, type: string) => {
    e.preventDefault()
    setSelectedType(type)
    getUserList('')
  }

  const lockUser = (e: ChangeEvent<HTMLInputElement>, user: Partial<User>, index: number) => {
    if (currentMatch && currentMatch.matchId) {
      const allUsers = [...users.docs]
      allUsers[index][MarketTypeKey[selectedType]] = e.target.checked
      setUsers({ ...users, docs: allUsers })
      betService
        .betLock({
          match: currentMatch,
          type: selectedType,
          status: e.target.checked,
          userId: user._id,
        })
        .then((res: AxiosResponse) => {
          console.log(res.data)
        })
    }
  }
  const setUserwisebook = (marketId: any, marketName: string) => {
    const filter: FancyBook = {
      matchId: currentMatch.matchId,
      selectionId: marketId,
      marketName: marketName,
    }
    dispatch(setMarketBookUser(filter))
  }

  return (
    <div className='buttons buttons-list row'>
      <Dropdown>
        <Dropdown.Toggle variant='primary' id='dropdown-basic'>
          Bet Lock
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, true, 'M')}
          >
            Lock
          </Dropdown.Item>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, false, 'M')}
          >
            Unlock
          </Dropdown.Item>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => selectUser(e, 'M')}
          >
            Select User
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown>
        <Dropdown.Toggle variant='primary' id='dropdown-basic'>
          BookMaker Lock
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, true, 'B')}
          >
            Lock
          </Dropdown.Item>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, false, 'B')}
          >
            Unlock
          </Dropdown.Item>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => selectUser(e, 'B')}
          >
            Select User
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown>
        <Dropdown.Toggle variant='primary' id='dropdown-basic'>
          Fancy Lock
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, true, 'F')}
          >
            Lock
          </Dropdown.Item>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => lock(e, false, 'F')}
          >
            Unlock
          </Dropdown.Item>
          <Dropdown.Item
            href='#'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => selectUser(e, 'F')}
          >
            Select User
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {markets &&
        markets.map(({ marketName, _id, marketId }: IMarket) => (
          <Button
            className={`mt-10 mrc-5`}
            key={_id}
            onClick={() => {
              setUserwisebook(marketId, marketName)
            }}
          >
            {marketName} Book
          </Button>
        ))}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Form.Group className='mb-3'>
                <Form.Control onChange={onChange} type='text' placeholder='Search User' />
              </Form.Group>
            </Row>
            <Row>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Bet Status</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.docs &&
                    users.docs.map((user: Partial<User>, index) => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>Bet Lock</td>
                        <td>{MarketType[selectedType]}</td>
                        <td>
                          <input
                            type={'checkbox'}
                            checked={user[MarketTypeKey[selectedType]]}
                            value={user._id}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              lockUser(e, user, index)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default BetLock
