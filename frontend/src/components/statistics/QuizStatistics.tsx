import { useEffect } from 'react';

import useFetch from '../../hooks/useFetch';
import { type ApiFetchQuizStatsResponse } from '../../lib/api.types';

const QuizStatistics = () => {
  const { data, error, loading, sendRequest } = useFetch<ApiFetchQuizStatsResponse>();

  useEffect(() => {
    sendRequest({ uri: 'stats/quizzes', options: { method: 'GET' } });
  }, []);

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold'>Quizzes</h2>
      <div className='flex w-full flex-col gap-5'>
        {loading ? (
          <span className='loading loading-spinner mx-auto' />
        ) : error ? (
          <div className='error'>Error loading quizzes statistics</div>
        ) : (
          <div className='stats stats-vertical shadow'>
            {data?.map(({ name, avg_points }) => (
              <div key={name} className='stat'>
                <div className='stat-title'>{name}</div>
                <div className='stat-value'>{avg_points}</div>
                <div className='stat-desc'>Average points</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizStatistics;
