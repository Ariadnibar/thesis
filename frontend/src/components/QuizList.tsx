import { useEffect } from 'react';

import useFetch from '../hooks/useFetch';
import { type ApiFetchQuizzesResponse } from '../lib/api.types';
import QuizCard from './QuizCard';

const QuizList = () => {
  const { data, error, loading, sendRequest } = useFetch<ApiFetchQuizzesResponse>();

  useEffect(() => {
    sendRequest({ uri: 'quizzes', options: { method: 'GET' } });
  }, []);

  if (loading) {
    return (
      <div className='mt-10 flex w-full items-center justify-center'>
        <span className='loading loading-spinner loading-lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div role='alert' className='alert alert-error my-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 shrink-0 stroke-current'
          fill='none'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <span>{error.message}</span>
      </div>
    );
  }

  if (!data) {
    return <></>;
  }

  return (
    <main className='flex flex-col items-center gap-4'>
      {data.length === 0 ? (
        <h2 className='text-xl font-bold'>No quizzes found</h2>
      ) : (
        <>
          {data
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
        </>
      )}
    </main>
  );
};

export default QuizList;
