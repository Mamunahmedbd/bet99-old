import React from "react"

const LimitInfo = (props:any) => {
    const { nameString, min, max, clsName} = props;
    const clsNameFinal = clsName?'text-right':'tx-left';
    return <div className={`info-block ${clsNameFinal}`}>
    <a
      href=''
      data-toggle='collapse'
      data-target={`#min-max-info${nameString.replace(' ', '')}`}
      aria-expanded='false'
      className='info-icon collapsed'
    >
      <i className='fas fa-info-circle m-l-10'></i>
    </a>
    <div id={`min-max-info${nameString.replace(' ', '')}`} className='min-max-info collapse'>
      <span className='m-r-5'>
        <b>Min:</b>
        {min}
      </span>{' '}
      <span className='m-r-5'>
        <b>Max:</b>
        {max}
      </span>
    </div>
  </div>
}
export default React.memo(LimitInfo)
