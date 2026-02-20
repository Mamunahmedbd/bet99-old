import { AxiosResponse } from 'axios'
import React, { ChangeEvent, FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useWebsocketUser } from '../../../../context/webSocketUser'
import authService from '../../../../services/auth.service'
import mobileSubheader from '../../_layout/elements/mobile-subheader'

const Message = () => {
  const { socketUser } = useWebsocketUser()
  const [settingList, setSettingList] = React.useState<
    { name: string; label: string; value: any; active: boolean }[]
  >([])
  React.useEffect(() => {
    authService.getSettingsList().then((res: AxiosResponse<any>) => {
      setSettingList(res.data.data.settings)
    })
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

  const onChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const allSettingList: any = [...settingList]
    allSettingList[index]['value'] = e.target.value
    setSettingList(allSettingList)
  }

  const onChangeActive = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const allSettingList: any = [...settingList]
    allSettingList[index]['active'] = e.target.checked
    setSettingList(allSettingList)
  }

  const handleSettingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    authService.saveSettingList(settingList).then((res: AxiosResponse<any>) => {
      toast.success(res.data.message)
    })
  }

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Messages')}
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12 mt-1'>
            <div className='add-account'>
              <form onSubmit={handleSettingSubmit}>
                <div className='row'>
                  {settingList.map((setting, index) => (
                    <div key={setting.name} className='col-lg-6'>
                      <div className='form-group'>
                        <label>
                          {setting.label} *{' '}
                          {'active' in setting && setting.name == 'userMaintenanceMessage' ? (
                            <input
                              type={'checkbox'}
                              checked={setting.active}
                              onChange={(e) => onChangeActive(e, index)}
                            />
                          ) : (
                            ''
                          )}
                        </label>
                        <div className='form-label-group'>
                          <input
                            type='text'
                            name={setting.name}
                            id='user_name'
                            required
                            className='form-control'
                            placeholder='Admin Text'
                            value={setting.value}
                            onChange={(e) => onChange(e, index)}
                          />
                          {/* {JSON.stringify(setting.active)} */}
                        </div>
                      </div>
                    </div>
                  ))}

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
