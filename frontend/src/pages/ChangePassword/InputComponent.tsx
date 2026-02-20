const InputComponent = ({
  valName,
  changeHandler,
  labelName,
  btnValue,
  errorMsg,
  ...props
}: any) => {
  const btnObj: any = btnValue ? btnValue : {}
  return (
    <div className='row row5 mb-1'>
      <div className='col-12'>
        <div className='form-group mb-0'>
          <label>{labelName}</label>
          <input
            placeholder=''
            name={valName}
            type='password'
            className='form-control'
            onChange={changeHandler}
          />
          {errorMsg?.[valName] && (
            <span id='username-required' className='error mt-10'>
              {errorMsg?.[valName]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default InputComponent
