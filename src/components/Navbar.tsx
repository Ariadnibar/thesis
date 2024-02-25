import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='navbar flex items-center justify-center gap-2 bg-base-100 p-0'>
      <Link to='/' className='btn btn-ghost text-lg'>
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
          className='lucide lucide-list'
        >
          <line x1='8' x2='21' y1='6' y2='6' />
          <line x1='8' x2='21' y1='12' y2='12' />
          <line x1='8' x2='21' y1='18' y2='18' />
          <line x1='3' x2='3.01' y1='6' y2='6' />
          <line x1='3' x2='3.01' y1='12' y2='12' />
          <line x1='3' x2='3.01' y1='18' y2='18' />
        </svg>
        Quizzes
      </Link>

      <Link to='/create' className='btn btn-ghost text-lg'>
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
      </Link>
    </div>
  );
};

export default Navbar;
