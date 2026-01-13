import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/home/HomePage'
import { ContactPage } from './pages/contact/ContactPage'


function App() {


  return (
    <>
    <Routes>
      <Route element={<MainLayout/>}>
        <Route path='/' element={<HomePage/>} />
        <Route path='/contacto' element={<ContactPage/>}/>
       
      </Route>
    </Routes>

    </>
  )
}

export default App
