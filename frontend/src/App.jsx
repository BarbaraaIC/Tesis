import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import KinexCenter from './pages/KinexCenter'
import Usuarios from './pages/Usuarios'
import Reservas from './pages/Reservas'
import Perfil from './pages/Perfil'
import Servicios from './pages/Servicios'
import Horas from './pages/Horas'
import ProtectRoutes from './components/ProtectRoutes'
import Layout from './components/Layout'
import Historial from './pages/Historial'
import Recuperar from './pages/RecuperarPassword'
import Restablecer from './pages/RestablecerPassword'
import Reportes from './pages/Reportes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-password" element={<Recuperar />} />
        <Route path="/restablecer-password" element={<Restablecer />} />

        <Route element={<Layout />}>
        <Route path="/kinex-center" element={
          <ProtectRoutes><KinexCenter /></ProtectRoutes>
        } />

        <Route path="/usuarios" element={
        <ProtectRoutes rolesPermitidos={['administrador', 'profesional']}>
          <Usuarios />
        </ProtectRoutes>
      } />

        <Route path="/servicios" element={
        <ProtectRoutes rolesPermitidos={['administrador', 'profesional']}>
          <Servicios />
        </ProtectRoutes>
      } />

        <Route path="/reservas" element={
          <Reservas />
        } />

        <Route path="/misHoras" element={
          <ProtectRoutes><Horas /></ProtectRoutes>
        } />

        <Route path="/perfil" element={
          <ProtectRoutes><Perfil /></ProtectRoutes>
        } />
        <Route path="/historialMedico" element={
            <Historial/>
        } />
            <Route path="/historialMedico/:id_usuario" element={
        <ProtectRoutes rolesPermitidos={['administrador', 'profesional']}>
          <Historial />
        </ProtectRoutes>
      } />

        <Route path="/reportes" element={
    <ProtectRoutes rolesPermitidos={['administrador', 'profesional']}>
      <Reportes />
    </ProtectRoutes>
  } />


      </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
