import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div>
      <Sidebar />
      <main className="ml-64 max-md:ml-48 min-h-dvh p-6 bg-white">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
