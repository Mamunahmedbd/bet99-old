import { isMobile } from 'react-device-detect'
const subheader = (title: string) => {
  return isMobile ? (
    <div className='game-heading'>
      <span className='card-header-title'>{title}</span>
    </div>
  ) : (
    ''
  )
}
const subheaderdesktop = (title: string) => {
  return !isMobile ? (
    <div className='card-header'>
      <h4 className='mb-0'>{title}</h4>
    </div>
  ) : (
    ''
  )
}
const subheaderdesktopadmin = (title: string, subtitle = '') => {
  return (
    <div className='card-header card-header-admin mb-20'>
      <h4 className='mb-0'>{title}</h4>
      {subtitle != '' ? <div className='m-t-5'>{subtitle}</div> : ''}
    </div>
  )
}
export default { subheader, subheaderdesktop, subheaderdesktopadmin }
