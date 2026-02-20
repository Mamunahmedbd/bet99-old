import InputComponent from './InputComponent'
import React, { ChangeEvent } from 'react'
import { toast } from 'react-toastify'
import UserService from '../../services/user.service'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'

const ButtonValues = () => {
  const [btn, setBtn] = React.useState<any>({})
  const [errorMsg, setErrorMsg] = React.useState({})

  React.useEffect(() => {
    UserService.getUserStake()
      .then((res) => {
        setBtn(res.data.data.userStake)
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }, [])

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const btnObj = { ...btn }
    btnObj[event.target.name] = event.target.value
    setBtn(btnObj)
  }

  const submitHandler = () => {
    UserService.updateUserStake(btn)
      .then(() => {
        toast.success('Buttons Values Updated Successfully')
      })
      .catch((e) => {
        const error = e.response.data.message
        setErrorMsg(e.response.data.errors)
        toast.error(error)
      })
  }

  const renderButtonValue = () => {
    const inputButtons = []
    for (let i = 1; i <= 10; i++) {
      inputButtons.push(
        <InputComponent
          key={i}
          btnName={`name${i}`}
          valName={`value${i}`}
          changeHandler={changeHandler}
          btnValue={btn}
          errorMsg={errorMsg}
        />,
      )
    }
    return inputButtons
  }

  return (
    <>
      {mobileSubheader.subheader('Change Button Values')}
      <div className={!isMobile ? 'col-lg-12 mt-1' : 'col-12 padding-custom'}>
        <div className='card'>
          {mobileSubheader.subheaderdesktop('Change Button Values')}
          <div className='card-body p10'>
            <div className='row row5 mbc-5'>
              <div className='col-6 col-lg-4'>
                <div className='button-title'>
                  <span>
                    <b>Price Label</b>
                  </span>
                </div>
              </div>
              <div className='col-6 col-lg-4'>
                <div className='button-title'>
                  <span>
                    <b>Price Value</b>
                  </span>
                </div>
              </div>
            </div>
            {renderButtonValue()}
            <div className='row row5 mt-2'>
              <div className='col-12 col-lg-2'>
                <button className='btn btn-primary' onClick={submitHandler}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default ButtonValues
