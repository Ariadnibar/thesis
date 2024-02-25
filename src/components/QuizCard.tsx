import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { ApiFetchQuizResponse } from '../lib/api.types';
import { copyToClipboard } from '../lib/utils';
import QuizDeleteDialog from './QuizDeleteDialog';

interface Props {
  quiz: ApiFetchQuizResponse;
}

const QuizCard = ({ quiz }: Props) => {
  const [tooltipText, setTooltipText] = useState('Copy');

  return (
    <div className='card w-full bg-base-100 shadow-xl'>
      <div className='card-body gap-5'>
        <div className='flex items-center justify-between'>
          <h4 className='text-xl font-bold'>{quiz.name}</h4>

          <div className='flex gap-2'>
            <Link to={`/edit/${quiz.id}`} className='btn btn-square btn-circle btn-secondary btn-sm'>
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
                className='lucide lucide-pencil size-4'
              >
                <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
                <path d='m15 5 4 4' />
              </svg>
            </Link>

            <QuizDeleteDialog id={quiz.id} name={quiz.name} />
          </div>
        </div>

        <div className='card-actions items-end justify-between'>
          <div className='tooltip' data-tip={tooltipText}>
            <button
              className='btn btn-primary btn-sm'
              onClick={() => {
                copyToClipboard(quiz.id);
                setTooltipText('Copied');

                setTimeout(() => setTooltipText('Copy'), 1000);
              }}
            >
              {quiz.id}
            </button>
          </div>

          <div className='badge badge-outline'>{new Date(quiz.updatedAt).toLocaleString()}</div>
        </div>

        <div className='flex flex-col gap-0 rounded-lg border border-base-300 bg-base-200 px-4 py-2 text-sm'>
          {quiz.questions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <>
                <span key={question.id} className='font-medium'>
                  - {question.content}
                </span>

                <>
                  {question.answers
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((answer) => (
                      <>
                        {answer.isCorrect ? (
                          <span key={answer.id} className='flex items-center gap-1 pl-4 font-light text-success'>
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
                              className='lucide lucide-check size-4'
                            >
                              <path d='M20 6 9 17l-5-5' />
                            </svg>{' '}
                            {answer.content}
                          </span>
                        ) : (
                          <span key={answer.id} className='flex items-center gap-1 pl-4 font-light text-error'>
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
                              className='lucide lucide-x size-4'
                            >
                              <path d='M18 6 6 18' />
                              <path d='m6 6 12 12' />
                            </svg>{' '}
                            {answer.content}
                          </span>
                        )}
                      </>
                    ))}
                </>
              </>
            ))}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
