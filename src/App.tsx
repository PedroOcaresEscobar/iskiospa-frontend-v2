


import './App.css'

import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/home/HomePage'
import { ContactPage } from './pages/contact/ContactPage'
import { PersonalServicesPage } from './pages/services/PersonalServicesPage'
import { BusinessServicesPage } from './pages/services/BusinessServicesPage'
import { EventPage } from './pages/events/EventPage'




function App() {


  return (
    <>
    <Routes>
   
      <Route element={<MainLayout/>}>

        <Route path='/' element={<HomePage/>} />
        <Route path='/contacto' element={<ContactPage/>}/>
        <Route path='/servicios' element={<PersonalServicesPage/>}/>
        <Route path='/empresas' element={<BusinessServicesPage/>}/>
        <Route path='/eventos' element={<EventPage/>}/>
      </Route>
    </Routes>

    </>
  )
}

export default App
