import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const RootLayout = () => {
  return (
    <div className='flex min-h-screen justify-center'>
      <div className='flex h-full w-full max-w-3xl flex-col gap-3 p-2 pb-8'>
        <Navbar />

        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
