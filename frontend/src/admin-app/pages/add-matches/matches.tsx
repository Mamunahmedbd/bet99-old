import React, { ChangeEvent, FormEvent } from 'react'
import seriesService from '../../../services/sports.service'
import './sports.css'
import { AxiosResponse } from 'axios'
import { useParams } from 'react-router-dom'
import IMatch from '../../../models/IMatch'
import { toast } from 'react-toastify'

const MatchesPage = () => {
  const [matches, setMatches] = React.useState<IMatch[]>([])

  const { sportId, competitionId } = useParams()

  React.useEffect(() => {
    if (sportId) {
      seriesService
        .getSeriesWithMarket(sportId!)
        .then((res: AxiosResponse<any>) => {
          const matchesList = res.data.data

          // .map((match: any): IMatch => {
          //   return {
          //     matchId: match.event.id,
          //     matchDateTime: match.event.openDate,
          //     name: match.event.name,
          //     seriesId: match?.series?.id,
          //     sportId,
          //     active: match.checked ? true : false,
          //   }
          // })

          const sortedMatches = [...matchesList].sort((a, b) => {
            // Convert matchDateTime strings to Date objects for comparison
            const dateA: any = new Date(a.matchDateTime);
            const dateB: any = new Date(b.matchDateTime);

            // Compare the dates
            return dateA - dateB;
          });

          const uniqueEvents = sortedMatches.filter((event, index, self) =>
            index === self.findIndex((e) => e.matchId === event.matchId && event.seriesId != 1)
          );

          const now = new Date();
          const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

          const filteredEvents = Array.from(
            new Map(
              uniqueEvents
                .filter(event => {
                  const matchDate = new Date(event.matchDateTime);
                  return matchDate >= now && matchDate <= threeDaysLater;
                })
                .map(event => [event.matchId, event]) // Map unique matchId
            ).values()
          );
          setMatches(uniqueEvents)
        })
        .catch((e) => {
          const err = e as Error
          toast.error(e.message)
        })
    }
  }, [])

  const handleMatch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const selectdMatches = matches.filter((ele) => ele.active)
    seriesService
      .saveMatch(selectdMatches)
      .then(() => {
        toast.success('Match Saved Successfully')
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }

  const selectMatch = (e: ChangeEvent<HTMLInputElement>, indx: number) => {
    const items: any = [...matches]
    console.log('items[indx]', JSON.stringify(items[indx]))
    items[indx].active = e.target.checked ? true : false
    setMatches(items)
  }

  return (
    <div className='container-fluid'>
      <div className='row'>
        <div className='col-md-12 main-container'>
          <form onSubmit={handleMatch}>
            <div className="text-right">
              <button className='btn btn-primary mb-10' type='submit'>
                Save Match
              </button>
            </div>
            <table className='table table-bordered'>
              <thead className='thead-dark'>
                <tr>
                  <th scope='col'>Matches</th>
                  <th scope='col'>Open Date</th>
                  <th scope='col'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match: IMatch, index: number) => {
                  if (match?.series?.id == '1') return
                  return (
                    <tr key={index}>
                      <td>{match.name}</td>
                      <td>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(match.matchDateTime))}</td>
                      <td>
                        <input
                          type={'checkbox'}
                          name={match.name}
                          onChange={(e) => selectMatch(e, index)}
                          value={match.name || ''}
                          checked={match.active}
                        />
                      </td>
                    </tr>
                  )
                })
                }
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </div>
  )
}
export default MatchesPage
