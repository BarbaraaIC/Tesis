import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import KinexCenter from './pages/KinexCenter'
import ProtectRoutes from './components/ProtectRoutes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/kinex-center" element={<ProtectRoutes>
                  <KinexCenter />
          </ProtectRoutes>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
