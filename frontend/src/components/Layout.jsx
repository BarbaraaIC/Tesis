import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const esMovil = () => window.matchMedia('(max-width: 767px)').matches

const Layout = () => {
  const [colapsado, setColapsado] = useState(() => esMovil())
  const location = useLocation()

  useEffect(() => {
    if (esMovil()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColapsado(true)
    }
  }, [location.pathname])

  const retraerSiEsMovil = () => {
    if (!colapsado && esMovil()) {
      setColapsado(true)
    }
  }

  return (
    <div>
      <Sidebar colapsado={colapsado} setColapsado={setColapsado} />
      <main
        onClick={retraerSiEsMovil}
        className={`min-h-dvh p-6 max-md:p-4 bg-white transition-all duration-300 ${
          colapsado ? 'ml-20' : 'ml-64 max-md:ml-20'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default Layout