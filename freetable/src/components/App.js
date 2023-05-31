import React from "react"
import Signup from "./Signup"
import { Container } from 'react-bootstrap'
import { AuthProvider } from "../contexts/AuthContext"
import Home from "./Home"
import Login from "./Login"
import OwnerHome from "./OwnerHome"
import Admin from "./admin"
import logo from '../img/logo.png'

import './css/header.css'

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function App() {
  return (
      <>
      <header>
            <img src={logo} alt="Logo" className="logo" />
      </header>
      <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path='/' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
              <Route path='/login' element={<Login />} />
              <Route path='/home' element={<Home />} />
              <Route path='/ownerhome' element={<OwnerHome />} />
              <Route path='/admin' element={<Admin />} />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </Container><footer className='footer'>{'Licenta CTI RO 2023'}</footer></>
  )
}

export default App
