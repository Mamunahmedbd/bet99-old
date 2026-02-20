const InputComponent = ({ btnName, valName, changeHandler, btnValue, errorMsg, ...props }: any) => {
  const btnObj: any = btnValue ? btnValue : {}
  return (
    <div className='row row5 mb-1'>
      <div className='col-6 col-lg-4'>
        <div className='form-group mb-0'>
          <input
            placeholder='Button Name'
            name={btnName}
            type='text'
            maxLength={7}
            className='form-control'
            value={btnObj?.[btnName] || ''}
            onChange={changeHandler}
          />
          {!btnObj[btnName] && errorMsg?.[btnName] && (
            <span id='username-required' className='error'>
              {errorMsg?.[btnName]}
            </span>
          )}
        </div>
      </div>
      <div className='col-6 col-lg-4'>
        <div className='form-group mb-0'>
          <input
            placeholder='Button Value'
            name={valName}
            type='number'
            min={1}
            max={99999999}
            maxLength={9}
            className='form-control'
            value={btnObj?.[valName] || ''}
            onChange={changeHandler}
          />
          {!btnObj[valName] && errorMsg?.[valName] && (
            <span id='username-required' className='error'>
              {errorMsg?.[valName]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default InputComponent
