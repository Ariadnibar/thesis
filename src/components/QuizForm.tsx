import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import QuizQuestion from './QuizQuestion';
import QuizContext from '../contexts/QuizContext';
import useFetch from '../hooks/useFetch';
import { ApiCreateQuizRequest } from '../lib/api.types';

const QuizForm = () => {
  const {
    quiz,
    resetQuiz,
    editing,
    validationError: quizValidationError,
    validateQuiz,
    updateName,
    addQuestion,
  } = useContext(QuizContext);

  const { error: fetchError, loading, completed, sendRequest } = useFetch();

  const navigate = useNavigate();

  useEffect(() => {
    if (completed) {
      editing ? navigate('/') : resetQuiz();
    }
  }, [completed]);

  const onSubmit = async () => {
    if (!validateQuiz()) {
      return;
    }

    const body: ApiCreateQuizRequest = {
      name: quiz.name,
      questions: quiz.questions.map((question) => ({
        content: question.content,
        order: question.order,
        answers: question.answers.map((answer) => ({
          content: answer.content,
          isCorrect: answer.isCorrect,
        })),
      })),
    };

    if (editing) {
      await sendRequest({
        uri: `quizzes/${quiz.id}`,
        options: {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      });

      return;
    }

    await sendRequest({
      uri: 'quizzes',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    });
  };

  return (
    <main className='flex flex-col'>
      <div className='sticky top-0 z-10 flex justify-between bg-base-100 py-2'>
        <h2 className='mb-5 text-2xl font-bold'>{editing ? 'Edit quiz' : 'Create quiz'}</h2>

        <button className='btn btn-primary' disabled={loading} onClick={onSubmit}>
          {loading ? (
            <>
              <span className='loading loading-spinner' />
              Please wait
            </>
          ) : (
            <>
              {editing ? (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-save'
                  >
                    <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
                    <polyline points='17 21 17 13 7 13 7 21' />
                    <polyline points='7 3 7 8 15 8' />
                  </svg>
                  Save
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-plus'
                  >
                    <path d='M5 12h14' />
                    <path d='M12 5v14' />
                  </svg>
                  Create
                </>
              )}
            </>
          )}
        </button>
      </div>

      {(fetchError || quizValidationError) && (
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
          <span>{fetchError?.message || quizValidationError}</span>
        </div>
      )}

      <div className='flex w-full flex-col gap-5'>
        {/* Quiz name */}
        <label className='form-control'>
          <div className='label'>
            <span className='label-text'>Quiz name</span>
          </div>
          <input
            type='text'
            placeholder='e.g. Awesome quiz'
            className='input input-bordered w-full'
            value={quiz.name}
            onChange={(e) => updateName(e.target.value)}
          />
        </label>

        {/* Questions */}
        <div className='flex flex-col gap-3'>
          <h4 className='text-lg font-semibold'>Questions</h4>

          <button className='btn w-full' onClick={addQuestion}>
            Add question
          </button>

          <div className='flex flex-col gap-5'>
            {quiz.questions
              .sort((a, b) => a.order - b.order)
              .map((question) => (
                <QuizQuestion key={question.id} question={question} />
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizForm;
