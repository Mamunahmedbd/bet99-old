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
const MobileSubheader = { subheader, subheaderdesktop }
export default MobileSubheader
