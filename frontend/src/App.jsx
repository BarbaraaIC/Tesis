import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import KinexCenter from './pages/KinexCenter'
import Usuarios from './pages/Usuarios'
import Reservas from './pages/Reservas'
import Servicios from './pages/Servicios'
import ProtectRoutes from './components/ProtectRoutes'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

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
          <ProtectRoutes><Reservas /></ProtectRoutes>
        } />
        <Route path="/reservas" element={
          <ProtectRoutes><Reservas /></ProtectRoutes>
        } />

      </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
