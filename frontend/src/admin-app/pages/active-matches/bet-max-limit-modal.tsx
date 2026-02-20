import React, { ChangeEvent, Fragment, MouseEvent } from 'react'
import ReactModal from 'react-modal'
import IMatch from '../../../models/IMatch'
import { SportsType } from '../../../models/SportTypes'
import { selectLoader } from '../../../redux/actions/common/commonSlice'
import { useAppSelector } from '../../../redux/hooks'
import sportsService from '../../../services/sports.service'
type Props = {
  showDialog: boolean
  closeModal: (
    e: MouseEvent<HTMLAnchorElement | undefined>,
    match?: IMatch,
    closed?: boolean,
  ) => void
  selectedMatch: IMatch
}

const BetMaxLimitModal = ({ showDialog, closeModal, selectedMatch }: Props) => {
  const [matchSetting, setMatchSetting] = React.useState<IMatch>({} as IMatch)
  const loading = useAppSelector(selectLoader)

  React.useEffect(() => {
    setMatchSetting(selectedMatch)
  }, [selectedMatch])

  const onChangeMatchSetting = (e: ChangeEvent<HTMLInputElement>) => {
    setMatchSetting({ ...matchSetting, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    sportsService.saveSportSettings(matchSetting).then(() => {
      closeModal(e, matchSetting)
    })
  }

  return (
    <div>
  
      <ReactModal
        isOpen={showDialog}
        onRequestClose={(e: any) => {
          closeModal(e, matchSetting, true)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog'}
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>Set Max Bet Limit</h4>
            <button
              type='button'
              className='close'
              data-dismiss='modal'
              onClick={(e: any) => {
                closeModal(e, matchSetting, true)
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='row col-md-12'>
              <div className='col-sm-6'>
                <div className='text-center m-xl-3'>
                  <strong>In Play</strong>
                </div>
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label> Min Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.inPlayMinLimit || ''}
                      onChange={onChangeMatchSetting}
                      name={'inPlayMinLimit'}
                      className='form-control intr'
                    />
                  </div>
                </div>
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label> Max Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.inPlayMaxLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='inPlayMaxLimit'
                      className='form-control intr'
                    />
                  </div>
                </div>
                {selectedMatch.sportId === SportsType.cricket && (
                  <Fragment>
                    <div className='row form-group'>
                      <div className='col-md-4'>
                        <label>Fancy Min Limit</label>
                      </div>
                      <div className='col-md-8'>
                        <input
                          type='text'
                          required
                          value={matchSetting.inPlayFancyMinLimit || ''}
                          onChange={onChangeMatchSetting}
                          name='inPlayFancyMinLimit'
                          className='form-control intr'
                          defaultValue={100}
                        />
                      </div>
                    </div>
                    <div className='row form-group'>
                      <div className='col-md-4'>
                        <label>Fancy Max Limit</label>
                      </div>
                      <div className='col-md-8'>
                        <input
                          type='text'
                          required
                          value={matchSetting.inPlayFancyMaxLimit || ''}
                          onChange={onChangeMatchSetting}
                          name='inPlayFancyMaxLimit'
                          className='form-control intr'
                          defaultValue={25000}
                        />
                      </div>
                    </div>
                  </Fragment>
                )}
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label>Book Min Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.inPlayBookMinLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='inPlayBookMinLimit'
                      className='form-control intr'
                      defaultValue={100}
                    />
                  </div>
                </div>
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label>Book Max Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.inPlayBookMaxLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='inPlayBookMaxLimit'
                      className='form-control intr'
                      defaultValue={25000}
                    />
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='text-center m-xl-3'>
                  <strong>Off Play</strong>
                </div>
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label> Min Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.offPlayMinLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='offPlayMinLimit'
                      className='form-control intr'
                    />
                  </div>
                </div>
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label> Max Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.offPlayMaxLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='offPlayMaxLimit'
                      className='form-control intr'
                    />
                  </div>
                </div>
                {selectedMatch.sportId === SportsType.cricket && (
                  <Fragment>
                    <div className='row form-group'>
                      <div className='col-md-4'>
                        <label>Fancy Min Limit</label>
                      </div>
                      <div className='col-md-8'>
                        <input
                          type='text'
                          required
                          value={matchSetting.offPlayFancyMinLimit || ''}
                          onChange={onChangeMatchSetting}
                          name='offPlayFancyMinLimit'
                          className='form-control intr'
                          defaultValue={100}
                        />
                      </div>
                    </div>
                    <div className='row form-group'>
                      <div className='col-md-4'>
                        <label>Fancy Max Limit</label>
                      </div>
                      <div className='col-md-8'>
                        <input
                          type='text'
                          required
                          value={matchSetting.offPlayFancyMaxLimit || ''}
                          onChange={onChangeMatchSetting}
                          name='offPlayFancyMaxLimit'
                          className='form-control intr'
                          defaultValue={1}
                        />
                      </div>
                    </div>
                  </Fragment>
                )}
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label>Book Min Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.offPlayBookMinLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='offPlayBookMinLimit'
                      className='form-control intr'
                      defaultValue={100}
                    />
                  </div>
                </div>
                <div className='row form-group'>
                  <div className='col-md-4'>
                    <label>Book Max Limit</label>
                  </div>
                  <div className='col-md-8'>
                    <input
                      type='text'
                      required
                      value={matchSetting.offPlayBookMaxLimit || ''}
                      onChange={onChangeMatchSetting}
                      name='offPlayBookMaxLimit'
                      className='form-control intr'
                      defaultValue={1}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                disabled={loading}
                type='button'
                className='btn btn-info'
                data-dismiss='modal'
                onClick={(e: any) => {
                  closeModal(e)
                }}
              >
                <i className='fas fa-undo-alt' /> No
              </button>
              <button disabled={loading} type='submit' className='btn btn-primary'>
                <i className='fas fa-paper-plane' /> Yes
              </button>
            </div>
          </form>
        </div>
      </ReactModal>
    </div>
  )
}

export default BetMaxLimitModal
