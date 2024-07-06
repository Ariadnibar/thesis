import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { setSessionItem } from '../lib/utils';
import type { ApiSignInResponse } from '../lib/api.types';
import useFetch from '../hooks/useFetch';

const SignInPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [usernameEmpty, setUsernameEmpty] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);

  const navigate = useNavigate();

  const { data, error, loading, sendRequest } = useFetch<ApiSignInResponse>();

  useEffect(() => {
    if (!data) {
      return;
    }

    setSessionItem('token', data.access_token);

    navigate('/');
  }, [data, navigate]);

  const validateInputs = (): boolean => {
    setUsernameEmpty(false);
    setPasswordEmpty(false);

    if (!username) {
      setUsernameEmpty(true);
    }

    if (!password) {
      setPasswordEmpty(true);
    }

    return !!username && !!password;
  };

  const onSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    await sendRequest({
      uri: 'auth/sign-in',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      },
      withAuth: false,
      onErrorHandler: (status, setError) => {
        switch (status) {
          case 401:
            setError({ message: 'Invalid credentials', status });
            return;
          default:
            setError({ message: 'Something went wrong', status });
            break;
        }
      },
    });
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <form
        className='flex w-full max-w-lg flex-col gap-3 p-4'
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h3 className='text-3xl font-bold'>Sign in</h3>

        <label className='form-control w-full'>
          <div className='label'>
            <span className='label-text'>Username</span>
          </div>
          <input
            type='text'
            placeholder='Username'
            className={usernameEmpty ? 'input input-bordered input-error w-full' : 'input input-bordered w-full'}
            value={username}
            onChange={(e) => {
              setUsernameEmpty(false);
              setUsername(e.target.value);
            }}
          />
        </label>

        <label className='form-control w-full'>
          <div className='label'>
            <span className='label-text'>Password</span>
          </div>

          <div
            className={
              passwordEmpty
                ? 'input input-bordered input-error flex w-full items-center gap-2'
                : 'input input-bordered flex w-full items-center gap-2'
            }
          >
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              className='grow'
              value={password}
              onChange={(e) => {
                setPasswordEmpty(false);
                setPassword(e.target.value);
              }}
            />
            <button
              type='button'
              className='btn btn-square btn-ghost btn-sm'
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
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
                  className='lucide lucide-eye-off'
                >
                  <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' />
                  <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' />
                  <path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' />
                  <line x1='2' x2='22' y1='2' y2='22' />
                </svg>
              ) : (
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
                  className='lucide lucide-eye'
                >
                  <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                  <circle cx='12' cy='12' r='3' />
                </svg>
              )}
            </button>
          </div>
        </label>

        <button type='submit' className='btn btn-primary mt-2 w-full' disabled={loading}>
          {loading ? (
            <>
              <span className='loading loading-spinner' />
              Please wait
            </>
          ) : (
            <>Sign in</>
          )}
        </button>

        {error && (
          <div role='alert' className='alert alert-error'>
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
        )}
      </form>
    </div>
  );
};

export default SignInPage;
