import { createBrowserRouter, redirect } from 'react-router-dom';

import { getAccessToken, getApiUrl } from './lib/utils';
import Layout from './components/RootLayout';

import ErrorPage from './pages/ErrorPage';
import NotFoundPage from './pages/NotFoundPage';

import SignInPage from './pages/SignInPage';

import QuizListPage from './pages/QuizListPage';
import CreateQuizPage from './pages/CreateQuizPage';
import EditQuizPage from './pages/EditQuizPage';
import StatisticsPage from './pages/StatisticsPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    loader: async () => {
      const accessToken = getAccessToken();

      try {
        const res = await fetch(`${getApiUrl()}/users/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          return redirect('/sign-in');
        }
      } catch (err) {
        return redirect('/sign-in');
      }

      return null;
    },
    children: [
      {
        path: '/',
        element: <QuizListPage />,
      },
      {
        path: '/create',
        element: <CreateQuizPage />,
      },
      {
        path: '/edit/:id',
        element: <EditQuizPage />,
      },
      {
        path: '/statistics',
        element: <StatisticsPage />,
      },
    ],
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
    loader: () => {
      const accessToken = getAccessToken();

      if (accessToken) {
        return redirect('/');
      }

      return null;
    },
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
