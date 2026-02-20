import axios, { AxiosResponse } from 'axios'
import QueryString from 'qs'
import React, { useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { useWebsocket } from '../../../context/webSocket'

const Score = ({ matchId, isT10 }: { matchId: number; isT10: boolean }) => {
  const [scoreData, setScoreData] = React.useState<any>('')
  const { socket } = useWebsocket()



  const scoreApi = useCallback(() => {
    const data = QueryString.stringify({
      /* eslint-disable camelcase */
      event_id: matchId,
    })
    const config = {
      method: isT10 ? 'get' : 'post',
      maxBodyLength: Infinity,
      url: isT10
        ? `http://172.105.61.186:3000/t10score?marketId=${matchId}`
        : 'https://odds.99exch.com/ws/getScoreData',
      'Content-Type': 'application/x-www-form-urlencoded',
      data,
    }
    axios.request(config).then((response: AxiosResponse) => {
      if (response.data) {
        setScoreData(isT10 ? response?.data?.data : response.data)
      }
    })
  }, [matchId, isT10])

  const scoreT10Api = useCallback(() => {
    socket.on('score-t10', (scorecard) => {
      if (scorecard?.EventID === matchId) {
        setScoreData(scorecard)
      }
    })
  }, [socket, matchId])

  React.useEffect(() => {
    //socket.on('score', handler)
    let clear: any = null
    if (!isT10) {
      clear = setInterval(scoreApi, 500)
    } else {
      scoreT10Api()
    }
    return () => {
      if (clear) clearInterval(clear)
      if (isT10) socket.off('score-t10')
    }
  }, [isT10, scoreApi, scoreT10Api, socket])

  const ballRunClass = (data: string) => {
    let cls = ''
    switch (data) {
      case '6':
        cls = 'six'
        break
      case '4':
        cls = 'four'
        break
      case 'ww':
        cls = 'wicket'
        break
    }
    return cls
  }

  const deskT10LayOut = () => {
    return (
      <div className='scorecard m-b-5'>
        <div className='row row5'>
          <div className='col-md-5'>
            <p key={scoreData?.spnnation1 || 0} className='team-1 row m-t-10'>
              <span className='team-name col-md-3'>{scoreData?.spnnation1}</span>
              <span className='score col-md-9 text-right'>{scoreData?.score1}</span>
            </p>
            <p key={scoreData?.spnnation2 || 1} className='team-1 row m-t-10'>
              <span className='team-name col-md-3'>{scoreData?.spnnation2}</span>
              <span className='score col-md-9 text-right'>{scoreData?.score2}</span>
            </p>
          </div>
          <div className='col-md-7'>
            <div className='row row5'>
              <div className='col-md-5'>
                <div className='row row5'>
                  <span className='team-name'>
                    {scoreData && scoreData.activenation1 === '1' ? (
                      <p className='team-1  m-t-10'>
                        <span>
                          CRR{' '}
                          {scoreData && scoreData.activenation1 === '1'
                            ? scoreData.spnrunrate1
                            : scoreData.spnrunrate2}
                        </span>{' '}
                        RR{' '}
                        {scoreData && scoreData.activenation1 === '1'
                          ? scoreData.spnreqrate1
                          : scoreData.spnreqrate2}
                      </p>
                    ) : (
                      <p className='team-1 m-t-10'>
                        <span>&nbsp;</span>
                      </p>
                    )}
                    {scoreData && scoreData.activenation2 === '1' ? (
                      <p className='team-1 m-t-10'>
                        <span>
                          CRR{' '}
                          {scoreData && scoreData.activenation1 === '1'
                            ? scoreData.spnrunrate1
                            : scoreData.spnrunrate2}
                        </span>{' '}
                        RR{' '}
                        {scoreData && scoreData.activenation1 === '1'
                          ? scoreData.spnreqrate1
                          : scoreData.spnreqrate2}
                      </p>
                    ) : (
                      <p className='team-1 m-t-10'>
                        <span>&nbsp;</span>
                      </p>
                    )}
                    &nbsp;
                  </span>
                </div>
              </div>
              <div className='col-md-7'>
                <div className='text-right'>
                  <p className='m-b-0'>{scoreData?.spnmessage}</p>
                </div>
                <div className='row'>
                  <div className='col-md-12'>
                    <p className='text-right ball-by-ball m-t-10'>
                      {scoreData &&
                        scoreData.balls &&
                        scoreData.balls.map(
                          (ball: any, index: number) =>
                            ball !== '' && (
                              <span
                                key={index}
                                className={`ball-runs m-l-5 ${ballRunClass(ball)}`}
                              >
                                {ball}
                              </span>
                            ),
                        )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const mobileT10LayOut = () => {
    return (
      <div className='scorecard m-b-5'>
        <div className='row row5'>
          <div className='col-6'>
            <p key={scoreData?.spnnation1} className='team-1 row m-t-10'>
              <span className='team-name col-md-3 col-6'>{scoreData?.spnnation1}</span>
              <span className='score col-md-9 text-right col-6'>{scoreData?.score1}</span>
            </p>
          </div>

          <div className='col-6'>
            <p key={scoreData?.spnnation2} className='team-1 row m-t-10'>
              <span className='team-name col-md-3 col-6'>{scoreData?.spnnation2}</span>
              <span className='score col-md-9 text-right col-6'>{scoreData?.score2}</span>
            </p>
          </div>
        </div>
        <div className='row row5 mt-10'>
          <div className='col-md-5 col-3'>
            <span className='team-name'>
              {scoreData && scoreData.activenation1 === '1' ? (
                <p className='team-1  m-t-10'>
                  <span>
                    CRR{' '}
                    {scoreData && scoreData.activenation1 === '1'
                      ? scoreData.spnrunrate1
                      : scoreData.spnrunrate2}
                  </span>{' '}
                  RR{' '}
                  {scoreData && scoreData.activenation1 === '1'
                    ? scoreData.spnreqrate1
                    : scoreData.spnreqrate2}
                </p>
              ) : (
                <p className='team-1 m-t-10'>
                  <span>&nbsp;</span>
                </p>
              )}
              {scoreData && scoreData.activenation2 === '1' ? (
                <p className='team-1 m-t-10'>
                  <span>
                    CRR{' '}
                    {scoreData && scoreData.activenation1 === '1'
                      ? scoreData.spnrunrate1
                      : scoreData.spnrunrate2}
                  </span>{' '}
                  RR{' '}
                  {scoreData && scoreData.activenation1 === '1'
                    ? scoreData.spnreqrate1
                    : scoreData.spnreqrate2}
                </p>
              ) : (
                <p className='team-1 m-t-10'>
                  <span>&nbsp;</span>
                </p>
              )}
              &nbsp;
            </span>
          </div>
          <div className='col-md-7 col-9'>
            <div className='row'>
              <div className='col-12'>
                <div className='text-right'>
                  <p className='m-b-0'>{scoreData?.spnmessage}</p>
                </div>
              </div>
              <div className='col-md-12'>
                <p className='text-right ball-by-ball m-t-10'>
                  {scoreData &&
                    scoreData.balls &&
                    scoreData.balls.map(
                      (ball: any, index: number) =>
                        ball !== '' && (
                          <span
                            key={ball + index}
                            className={`ball-runs m-l-5 ${ballRunClass(ball)}`}
                          >
                            {ball}
                          </span>
                        ),
                    )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      {!isT10 && <div dangerouslySetInnerHTML={{ __html: scoreData }}></div>}
      {/* <div className='container1'>
        <iframe
          className='tab_video'
          src={`https://score.onlyscore.live/Scorebord?id=${matchId}`}
        ></iframe>
      </div> */}
      {isT10 && scoreData && !isMobile && deskT10LayOut()}
      {isT10 && scoreData && isMobile && mobileT10LayOut()}

      {/* <div className='scorecard m-b-5'>
          <div className='row'>
            <div className='col-md-5'>
              {scoreData &&
                scoreData &&
                scoreData.teams &&
                scoreData.teams.map((team: any) => (
                  <p key={team.team_short_name} className='team-1 row m-t-10'>
                    <span className='team-name col-md-3'>{team.team_short_name}</span>
                    <span className='score col-md-9 text-right'>{team.score}</span>
                  </p>
                ))}
            </div>
            <div className='col-md-7'>
              <div className='row'>
                <div className='col-md-5'>
                  <div className='row'>
                    <span className='team-name'>
                      <span>CRR {scoreData ? scoreData.currentRunRate : ''}</span>
                      <span>RR {scoreData ? scoreData.requireRunRate : ''}</span>
                      &nbsp;
                    </span>
                  </div>
                  <div className='row m-t-10'>
                    <span className='team-name'>
                    </span>
                  </div>
                </div>
                <div className='col-md-7'>
                  <div className='text-right'>

                    <p className='m-b-0'>

                      {scoreData && scoreData && scoreData ? scoreData.msg : ''}
                    </p>
                  </div>
                  <div className='row'>
                    <div className='col-md-12'>
                      <p className='text-right ball-by-ball m-t-10'>
                        {scoreData &&
                          scoreData &&
                          scoreData.last24ballsNew &&
                          scoreData.last24ballsNew.map((ball: any, index: number) => (
                            <span
                              key={ball.score_card + index}
                              className={`ball-runs m-l-5 ${ballRunClass(ball.score_card)}`}
                            >
                              {ball.score_card}
                            </span>
                          ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
    </>
  )
}
export default Score
