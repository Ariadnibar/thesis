import { useRouteError, useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <div className='hero min-h-screen bg-base-200'>
      <div className='hero-content text-center'>
        <div className='max-w-md'>
          <h1 className='text-5xl font-bold'>Oops!</h1>
          <p className='py-6'>Sorry, an unexpected error has occured.</p>

          <div className='flex flex-col items-center justify-center gap-5'>
            {/* @ts-expect-error The properties exist */}
            <i>{error.statusText || error.message}</i>
            <button className='btn btn-primary' onClick={() => navigate(0)}>
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
