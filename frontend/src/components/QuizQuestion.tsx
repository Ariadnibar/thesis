import { useContext } from 'react';

import type { Question } from '../lib/types';
import QuizAnswer from './QuizAnswer';
import QuizContext from '../contexts/QuizContext';

interface Props {
  question: Question;
}

const QuizQuestion = ({ question }: Props) => {
  const { updateQuestion, updateQuestionOrder, removeQuestion, addAnswer } = useContext(QuizContext);

  return (
    <div className='card w-full bg-base-100 shadow-xl'>
      <div className='card-body gap-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <button
                className='btn btn-square btn-circle btn-ghost btn-sm'
                onClick={() => updateQuestionOrder(question.id, 'up')}
              >
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
                  className='lucide lucide-chevron-up size-4'
                >
                  <path d='m18 15-6-6-6 6' />
                </svg>
              </button>

              {question.order}

              <button
                className='btn btn-square btn-circle btn-ghost btn-sm'
                onClick={() => updateQuestionOrder(question.id, 'down')}
              >
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
                  className='lucide lucide-chevron-down size-4'
                >
                  <path d='m6 9 6 6 6-6' />
                </svg>
              </button>
            </div>

            <h4 className='text-lg font-medium'>Question</h4>
          </div>
          <button className='btn btn-square btn-circle btn-error btn-sm' onClick={() => removeQuestion(question.id)}>
            ✕
          </button>
        </div>

        <label className='form-control'>
          <div className='label'>
            <span className='label-text'>Content</span>
          </div>
          <textarea
            placeholder='e.g. What is the capital of France?'
            className='textarea textarea-bordered w-full'
            value={question.content}
            onChange={(e) => {
              updateQuestion({ ...question, content: e.target.value });
            }}
          />
        </label>

        <div className='flex flex-col gap-3'>
          <h4 className='font-medium'>Answers</h4>

          <button className='btn w-full' onClick={() => addAnswer(question.id)}>
            Add answer
          </button>

          <div className='flex flex-col'>
            {question.answers
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((answer, index) => (
                <div key={answer.id}>
                  <QuizAnswer answer={answer} />

                  {index !== question.answers.length - 1 && <div className='divider' />}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
