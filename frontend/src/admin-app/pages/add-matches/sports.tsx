import React from 'react'
import sportsService from '../../../services/sports.service'
import './sports.css'
import { AxiosResponse } from 'axios'
import ISport from '../../../models/ISport'
import { CustomLink } from '../../../pages/_layout/elements/custom-link'
import { useParams } from 'react-router-dom'
import mobileSubheader from '../_layout/elements/mobile-subheader'

const SportsPage = () => {
  const [sports, setSports] = React.useState<ISport[]>([])
  const [currentUrl, setCurrenUrl] = React.useState('matches')
  const { url } = useParams()

  React.useEffect(() => {
    if (url) setCurrenUrl(url!)
  }, [url])

  React.useEffect(() => {
    sportsService.getSports().then((res: AxiosResponse<{ data: ISport[] }>) => {
      setSports(res.data.data)
    })
  }, [])

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Sports')}
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12 main-container'>
            <table className='table'>
              <tbody>
                {sports.map((sport: ISport) => (
                  <tr key={sport._id}>
                    <td>
                      <CustomLink to={`/${currentUrl}/${sport.sportId}`}>{sport.name}</CustomLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
export default SportsPage
