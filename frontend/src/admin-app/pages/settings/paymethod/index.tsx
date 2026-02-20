import { AxiosResponse } from 'axios'
import React, { ChangeEvent, FormEvent, useRef } from 'react'
import { toast } from 'react-toastify'
import { useWebsocketUser } from '../../../../context/webSocketUser'
import authService from '../../../../services/auth.service'
import mobileSubheader from '../../_layout/elements/mobile-subheader'

const Message = () => {
  const { socketUser } = useWebsocketUser()
  const formRef = useRef(null)
  const [settingList, setSettingList] = React.useState<
    {
      name: string
      label: string
      value: any
      active: boolean
      inputType: string
      category: string
      index: number
    }[]
  >([])

  React.useEffect(() => {
    getSettings()
  }, [])

  React.useEffect(() => {
    socketUser.on('loggedOut', (msg) => {
      toast.success(msg)
    })
    return () => {
      socketUser.off('logoutAll')
      socketUser.off('loggedOut')
    }
  })

  const getSettings = () => {
    authService.getpymentSettingsList().then((res: AxiosResponse<any>) => {
      setSettingList(res.data.data.settings)
    })
  }

  const onChange = (e: any, index: number) => {
    const allSettingList: any = [...settingList]
    const file = e.target.files ? e.target.files[0] : null

    console.log('e.target.value', e.target.value)

    allSettingList[index]['value'] = e.target.value
    if (file) allSettingList[index][`${allSettingList[index]['name']}-file`] = file

    setSettingList(allSettingList)
  }

  const onChangeActive = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const allSettingList: any = [...settingList]
    allSettingList[index]['active'] = e.target.checked
    setSettingList(allSettingList)
  }

  const handleSettingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    for (const key in settingList) {
      formData.append(settingList[key].name, JSON.stringify(settingList[key]))
    }
    authService.savepaymentSettingList(settingList).then((res: AxiosResponse<any>) => {
      // eslint-disable-next-line
      //@ts-expect-error
      if (formRef?.current) formRef.current.reset()
      getSettings()
      toast.success(res.data.message)
    })
  }

  const getCategorize = () => {
    return settingList.reduce((acc: any, setting, currentIndex) => {
      if (!acc[setting.category]) acc[setting.category] = []
      setting.index = currentIndex
      acc[setting.category].push(setting)
      return acc
    }, {})
  }

  console.log('getCategorize', settingList)

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Messages')}
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12 mt-1'>
            <div className='add-account'>
              <form onSubmit={handleSettingSubmit} ref={formRef}>
                <div className='row'>
                  {Object.keys(getCategorize()).map((key) => {
                    return (
                      <div key={key} className='col-md-12'>
                        <h4 className='text-capitalize p-2'>{key}</h4>
                        <div key={key} className='row'>
                          {getCategorize()[key].map((setting: any) => (
                            <div key={setting.name} className='col-lg-6'>
                              <div className='form-group'>
                                <label>
                                  {setting.label} *{' '}
                                  {'active' in setting &&
                                    setting.name == 'userMaintenanceMessage' ? (
                                    <input
                                      type={'checkbox'}
                                      checked={setting.active}
                                      onChange={(e) => onChangeActive(e, setting.index)}
                                    />
                                  ) : (
                                    ''
                                  )}
                                  {setting.value && setting.inputType === 'file' && (
                                    <a
                                      href={process.env.REACT_APP_SITE_URL + setting.value}
                                      target='__blank'
                                    >
                                      <img
                                        src={process.env.REACT_APP_SITE_URL + setting.value}
                                        width={20}
                                      />
                                    </a>
                                  )}
                                </label>
                                <div className='form-label-group'>
                                  {!setting.inputType ? (
                                    <input
                                      type={'text'}
                                      name={setting.name}
                                      id='user_name'
                                      className='form-control'
                                      placeholder={setting?.label}
                                      value={setting.value}
                                      onChange={(e) => onChange(e, setting.index)}
                                    />
                                  ) : (
                                    <>
                                      <input
                                        type={setting.inputType}
                                        name={setting.name}
                                        id='user_name'
                                        className='form-control'
                                        placeholder={setting?.label}
                                        onChange={(e) => onChange(e, setting.index)}
                                      />
                                    </>
                                  )}
                                  {/* {JSON.stringify(setting.active)} */}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  <div className='col-lg-12'>
                    <div className='tr'>
                      <button type='submit' className='btn btn-primary'>
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Message
