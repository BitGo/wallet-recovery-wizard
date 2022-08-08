import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <>
      <Link to="/">To Home</Link>
      <Outlet />
    </>
  );
}
