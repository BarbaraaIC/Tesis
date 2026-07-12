import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  const [colapsado, setColapsado] = useState(false)

  return (
    <div>
      <Sidebar colapsado={colapsado} setColapsado={setColapsado} />
      <main
        className={`min-h-dvh p-6 bg-white transition-all duration-300 ${
          colapsado ? 'ml-20' : 'ml-64 max-md:ml-48'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default Layout