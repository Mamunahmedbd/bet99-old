import React from 'react'
import Modal from 'react-modal'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import 'react-toastify/dist/ReactToastify.css'
import { useAppSelector } from '../../../../redux/hooks'
import ISport from '../../../../models/ISport'
import { selectSportList } from '../../../../redux/actions/sports/sportSlice'
import userService from '../../../../services/user.service'
import { AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
import SubmitButton from '../../../../components/SubmitButton'
import { RoleType } from '../../../../models/User'

const GeneralSettingsModal = (props: any) => {
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList)

  const depositValidationSchema = Yup.object().shape({
    transactionPassword: Yup.string().required('Transaction Password is required'),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      userId: '',
      userSetting: props?.depositUser?.userSetting
        ? props?.depositUser?.userSetting
        : props?.depositUser?.parent?.userSetting,
      transactionPassword: '',
    },
    resolver: yupResolver(depositValidationSchema),
  })

  console.log(props?.depositUser)
  React.useEffect(() => {
    const userSettings = props?.depositUser?.userSetting
    const parentSettings = props?.depositUser?.parent?.userSetting
    const settings = userSettings || parentSettings
    if (settings && Object.keys(settings).length > 0) {
      setValue('userId', props?.depositUser._id)
      const keys = Object.keys(settings)
      keys.map((key) => {
        setValue(`userSetting.${key}.minBet`, settings[key]['minBet'])
        setValue(`userSetting.${key}.maxBet`, settings[key]['maxBet'])
        setValue(`userSetting.${key}.delay`, settings[key]['delay'])
      })
    }
  }, [props.depositUser])

  const onSubmit = handleSubmit((data) => {
    const userSettingsObject: any = {}
    data.userSetting.forEach((userSettings: any, index: number) => {
      if (userSettings !== null) {
        userSettingsObject[index] = userSettings
      }
    })

    data.userSetting = userSettingsObject

    userService.saveGeneralSetting(data).then((res: AxiosResponse) => {
      props.closeModal('gs')
      reset()
      toast.success(res.data.message)
    })
  })

  return (
    <>
     
      <Modal
        isOpen={props.showDialog}
        onRequestClose={() => {
          props.closeModal('gs')
          reset()
        }}
        contentLabel='General Settings'
        className={'modal-dialog'}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>General Settings</h4>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              onClick={() => {
                props.closeModal('gs')
                reset()
              }}
            >
              ×
            </button>
          </div>
          <form id='DepositForm' method='post' autoComplete='off' onSubmit={onSubmit}>
            <div className='modal-body row'>
              <div className='card-header col-md-12 mb-20'>
                <h4 className='mb-0'>Sport Settings</h4>
              </div>
              <div className='container-fluid'>
                <table className='table table-striped table-bordered'>
                  <thead>
                    <tr>
                      <th />
                      {sportListState.sports?.map((sports: any) =>
                        sports.sportId === 1 || sports.sportId === 2 || sports.sportId === 4 ? (
                          <th key={sports._id}>{sports.name}</th>
                        ) : null,
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Min Bet</td>
                      {sportListState.sports?.map(({ _id, sportId }) =>
                        sportId == 1 || sportId == 2 || sportId == 4 ? (
                          <td key={_id}>
                            <input
                              id={`minBet.${sportId}`}
                              className={`minBet.${sportId}`}
                              {...register(`userSetting.${sportId}.minBet`)}
                              placeholder={''}
                              max={
                                props?.depositUser.role !== RoleType.admin
                                  ? props.depositUser?.parent?.userSetting?.[sportId].minBet
                                  : null
                              }
                              min={0}
                              type='number'
                            />
                            <span className='error' />
                          </td>
                        ) : null,
                      )}
                    </tr>
                    <tr>
                      <td>Max Bet</td>
                      {sportListState.sports?.map(({ _id, sportId }) =>
                        sportId == 1 || sportId == 2 || sportId == 4 ? (
                          <td key={_id}>
                            <input
                              id={`maxBet.${sportId}`}
                              className={`maxBet.${sportId}`}
                              {...register(`userSetting.${sportId}.maxBet`)}
                              placeholder={''}
                              max={
                                props?.depositUser.role !== RoleType.admin
                                  ? props.depositUser?.parent?.userSetting?.[sportId].maxBet
                                  : null
                              }
                              min={0}
                              type='number'
                            />
                            <span className='error' />
                          </td>
                        ) : null,
                      )}
                    </tr>
                    <tr>
                      <td>Delay</td>
                      {sportListState.sports?.map(({ _id, sportId }) =>
                        sportId == 1 || sportId == 2 || sportId == 4 ? (
                          <td key={_id}>
                            <input
                              id={`delay.${sportId}`}
                              className={`delay.${sportId}`}
                              {...register(`userSetting.${sportId}.delay`)}
                              placeholder={''}
                              max={
                                props?.depositUser.role !== RoleType.admin
                                  ? props.depositUser?.parent?.userSetting?.[sportId].delay
                                  : null
                              }
                              type='number'
                            />
                            <span className='error' />
                          </td>
                        ) : null,
                      )}
                    </tr>
                  </tbody>
                </table>

                <div className='row m-t-20'>
                  <div className='col-md-4'>
                    <label>Transaction Password</label>
                  </div>
                  <div className='col-md-8'>
                    <input type='password' id='mpassword' {...register('transactionPassword')} />
                    {errors?.transactionPassword && (
                      <span className='error'>{errors.transactionPassword.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <input type='hidden' name='uid' id='uid' />
              <button
                type='button'
                className='btn btn-back'
                data-dismiss='modal'
                onClick={() => {
                  props.closeModal('gs')
                  reset()
                }}
              >
                <i className='fas fa-undo' />
                Back
              </button>
              <SubmitButton type='submit' className='btn btn-submit'>
                Submit
                <i className='fas fa-sign-in-alt' />
              </SubmitButton>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

export default GeneralSettingsModal
