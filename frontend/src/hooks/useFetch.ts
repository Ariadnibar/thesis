import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiUrl, removeSessionItem } from '../lib/utils';

interface FetchError {
  message: string;
  status: number;
}

interface SendRequestProps {
  uri: string;
  options: RequestInit;
  withAuth?: boolean;
  onErrorHandler?: (status: number, setError: (error: FetchError) => void) => void;
}

interface UseFetch<T> {
  data: T | null;
  error: FetchError | null;
  loading: boolean;
  completed: boolean;
  sendRequest: (props: SendRequestProps) => Promise<void>;
}

const useFetch = <T>(): UseFetch<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<FetchError | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const navigate = useNavigate();

  const onError = (status: number) => {
    switch (status) {
      case 401:
        setError({ message: 'Unauthorized', status });
        return;
      case 403:
        setError({ message: 'Forbidden', status });
        return;
      case 404:
        setError({ message: 'Not found', status });
        return;
      default:
        setError({ message: 'Something went wrong', status });
        break;
    }
  };

  const addAuthHeader = (options: RequestInit) => {
    const accessToken = window.sessionStorage.getItem('token');

    if (!accessToken) {
      setError({ message: 'Unauthorized', status: 401 });
      return;
    }

    if (!options.headers) {
      options.headers = {};
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  };

  const sendRequest = async ({ uri, options, withAuth = true, onErrorHandler }: SendRequestProps) => {
    setCompleted(false);
    setError(null);
    setData(null);
    setLoading(true);

    if (withAuth) {
      addAuthHeader(options);

      if (error) {
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${getApiUrl()}/${uri}`, options);

      if (!res.ok) {
        if (withAuth && res.status === 401) {
          removeSessionItem('token');
          navigate('/sign-in');
        }

        onErrorHandler ? onErrorHandler(res.status, setError) : onError(res.status);

        setLoading(false);
        return;
      }

      const data = (await res.json()) as T;
      setData(data);
    } catch (error) {
      setError({ message: 'Something went wrong', status: 0 });
    } finally {
      setLoading(false);
      setCompleted(true);
    }
  };

  return { data, error, loading, completed, sendRequest };
};

export default useFetch;
