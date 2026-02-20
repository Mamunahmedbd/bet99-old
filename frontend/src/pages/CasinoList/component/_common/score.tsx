import React from 'react'

const Score = (parmas: any) => {
  const { scoreData } = parmas
  const ballRunClass = (data: any) => {
    let cls = ''
    switch (data) {
      case '6':
      case 6:
        cls = 'six'
        break
      case '4':
      case 4:
        cls = 'four'
        break
      case 'ww':
      case 'W':
        cls = 'wicket'
        break
    }
    return cls
  }
  console.log('scoreData', scoreData)
  return (
    <>
      {scoreData && (
        <div className='scorecard m-b-5'>
          <div className='row'>
            <div className='col-md-5 col-12'>
              <div className='mobile-flex'>
                {scoreData && scoreData.teamA ? (
                  <p key={scoreData.teamA.name} className='team-1 d-flex  m-t-10'>
                    <span className='team-name col-md-3 pl10'>{scoreData.teamA.name}</span>
                    <span className='score col-md-9 text-right'>{`${scoreData?.teamA?.totalRun} - ${
                      scoreData?.teamA?.totalWickets || scoreData.teamA.totalWickets
                    } (${scoreData?.teamA?.overs || 0})`}</span>
                  </p>
                ) : (
                  ''
                )}
                {scoreData && scoreData.teamB ? (
                  <p key={scoreData.teamB.name} className='team-1 d-flex m-t-10'>
                    <span className='team-name col-md-3 pl10'>{scoreData.teamB.name}</span>
                    <span className='score col-md-9 text-right'>{`${scoreData.teamB.totalRun} - ${
                      scoreData?.teamB?.totalWickets || 0
                    } (${scoreData?.teamB?.overs || 0})`}</span>
                  </p>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className='col-md-7 col-12'>
              <div className='row'>
                <div className='col-md-5 col-4'>
                  <div className='row'>
                    <span className='team-name mobilescorcard' style={{ paddingTop: '10px' }}>
                      <p style={{ marginRight: '1px' }}>CRR {scoreData ? scoreData.CRR : ''} </p>
                      <p style={{ marginRight: '1px' }}> RR {scoreData ? scoreData.RR : ''}</p>
                      &nbsp;
                    </span>
                  </div>
                </div>
                <div className='col-md-7 col-8'>
                  {scoreData?.targetString && (
                    <div className='text-right'>
                      <p className='m-b-0' style={{ paddingTop: '10px' }}>
                        {scoreData ? scoreData.targetString : ''}
                      </p>
                    </div>
                  )}
                  <div className='row'>
                    <div className='col-md-12'>
                      <p className='text-right ball-by-ball m-t-10'>
                        {scoreData &&
                          scoreData &&
                          scoreData.overRun &&
                          scoreData.overRun.map((ball: any, index: number) => (
                            <span
                              key={ball.score_card + index}
                              className={`ball-runs m-l-5 ${ballRunClass(ball)}`}
                            >
                              {ball}
                            </span>
                          ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default React.memo(Score)
