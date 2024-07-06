import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { QuizContextProvider } from '../contexts/QuizContext';
import QuizForm from '../components/QuizForm';
import useFetch from '../hooks/useFetch';
import { ApiFetchQuizResponse } from '../lib/api.types';

const EditQuizPage = () => {
  const { id } = useParams();

  const { data, error, loading, sendRequest } = useFetch<ApiFetchQuizResponse>();

  useEffect(() => {
    sendRequest({ uri: `quizzes/${id}`, options: { method: 'GET' } });
  }, [id]);

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
    <QuizContextProvider quizToEdit={data}>
      <QuizForm />
    </QuizContextProvider>
  );
};

export default EditQuizPage;
