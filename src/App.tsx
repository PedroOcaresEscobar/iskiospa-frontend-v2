


import './App.css'

import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/home/HomePage'
import { ContactPage } from './pages/contact/ContactPage'
import { PersonalServicesPage } from './pages/services/PersonalServicesPage'
import { BusinessServicesPage } from './pages/services/BusinessServicesPage'
import { EventPage } from './pages/events/EventPage'
import LoginPage from './pages/auth/LoginPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import AdminPage from './pages/admin/AdminPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AgendarPage } from './pages/agendar/AgendarPage'




function App() {


  return (
    <>
    <Routes>
   
      <Route element={<MainLayout/>}>

        <Route path='/' element={<HomePage/>} />
        <Route path='/contacto' element={<ContactPage/>}/>
        <Route path='/agendar' element={<AgendarPage/>}/>
        <Route path='/servicios' element={<PersonalServicesPage/>}/>
        <Route path='/empresas' element={<BusinessServicesPage/>}/>
        <Route path='/eventos' element={<EventPage/>}/>
      </Route>
      <Route path='/login' element={<LoginPage/>} />
      <Route path='/reset-password' element={<ResetPasswordPage/>} />
      <Route
        path='/admin'
        element={
          <ProtectedRoute requiredRole='admin'>
            <AdminPage/>
          </ProtectedRoute>
        }
      />
    </Routes>

    </>
  )
}

export default App
