import React from "react"

const CasinoLimits = (props: any) => {
  const { min, max } = props
  return (
    <div className='row'>
          <div className='col-12 text-right'>
            <div className='info-block'>
              <a
                href=''
                data-toggle='collapse'
                data-target='#min-max-info1'
                className='info-icon'
              >
                <i className='fas fa-info-circle m-l-10'></i>
              </a>
              <div id='min-max-info1' className='collapse min-max-info'>
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
          </div>
        </div>
  )
}
export default React.memo(CasinoLimits)
