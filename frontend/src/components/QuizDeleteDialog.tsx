import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';

import useFetch from '../hooks/useFetch';

interface Props {
  id: string;
  name: string;
}

const QuizDeleteDialog = ({ id, name }: Props) => {
  const [open, setOpen] = useState(false);

  const { error, loading, completed, sendRequest } = useFetch();

  const navigate = useNavigate();

  useEffect(() => {
    if (completed && !error) {
      setOpen(false);
      navigate(0);
    }
  }, [completed]);

  const onSubmit = async () => {
    await sendRequest({ uri: `quizzes/${id}`, options: { method: 'DELETE' } });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className='btn btn-square btn-circle btn-error btn-sm'>✕</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black bg-opacity-50' />

        <Dialog.Content className='fixed left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 transform items-center justify-center'>
          <form
            className='relative w-full max-w-lg rounded-3xl bg-base-100 p-6'
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Dialog.Close type='button' className='btn btn-circle btn-ghost btn-sm absolute right-2 top-2'>
              ✕
            </Dialog.Close>

            <h3 className='text-lg font-bold'>Remove quiz</h3>
            <p className='pb-2 pt-4'>Are you sure you want to remove this quiz?</p>

            <span className='font-semibold'>{name}</span>

            <div className='flex justify-end gap-2 pt-4'>
              <Dialog.Close type='button' className='btn btn-ghost'>
                Cancel
              </Dialog.Close>
              <button type='submit' className='btn btn-error' disabled={loading}>
                {loading ? (
                  <>
                    <span className='loading loading-spinner' />
                    Please wait
                  </>
                ) : (
                  <>Remove</>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default QuizDeleteDialog;
