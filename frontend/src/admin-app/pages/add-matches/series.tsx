import React from 'react'
import seriesService from '../../../services/sports.service'
import './sports.css'
import { AxiosResponse } from 'axios'
import ISport from '../../../models/ISport'
import { useParams } from 'react-router-dom'
import { CustomLink } from '../../../pages/_layout/elements/custom-link'
const SeriesPage = () => {
  const [series, setSeries] = React.useState<ISport[]>([])

  const { sportId } = useParams()

  React.useEffect(() => {
    seriesService.getSeries(sportId!).then((res: AxiosResponse<any>) => {
      setSeries(res.data.sports)
    })
  }, [])

  return (
    <div className='row'>
      <div className='col-md-12 main-container'>
        <table className='table'>
          <thead className='thead-dark'>
            <tr>
              <th scope='col'>Series</th>
            </tr>
          </thead>
          <tbody>
            {series.map((sport: any, index: number) => (
              <tr key={index}>
                <td>
                  <CustomLink to={`/matches/${sportId}/${sport.competition.id}`}>
                    {sport.competition.name}
                  </CustomLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default SeriesPage
