import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className='hero min-h-screen bg-base-200'>
      <div className='hero-content text-center'>
        <div className='max-w-md'>
          <h1 className='text-5xl font-bold'>Oops!</h1>
          <p className='py-6'>You're not supposed to be here.</p>

          <Link to='/' className='btn btn-primary'>
            Take me back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
