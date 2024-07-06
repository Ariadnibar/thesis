import { useContext } from 'react';

import type { Answer } from '../lib/types';
import QuizContext from '../contexts/QuizContext';

interface Props {
  answer: Answer;
}

const QuizAnswer = ({ answer }: Props) => {
  const { updateAnswer, removeAnswer } = useContext(QuizContext);

  return (
    <div className='flex flex-col gap-2'>
      <label className='form-control'>
        <div className='label'>
          <span className='label-text'>Content</span>
        </div>
        <input
          type='text'
          placeholder='e.g. Paris'
          className='input input-bordered w-full'
          value={answer.content}
          onChange={(e) => updateAnswer({ ...answer, content: e.target.value })}
        />
      </label>

      <div className='form-control'>
        <label className='label cursor-pointer'>
          <span className='label-text'>Correct</span>
          <input
            type='checkbox'
            className='toggle'
            checked={answer.isCorrect}
            onChange={(e) => updateAnswer({ ...answer, isCorrect: e.target.checked })}
          />
        </label>
      </div>

      <button className='btn btn-error' onClick={() => removeAnswer(answer.id)}>
        Remove
      </button>
    </div>
  );
};

export default QuizAnswer;
