import React from "react"
import Signup from "./Signup"
import { Container } from 'react-bootstrap'
import { AuthProvider } from "../contexts/AuthContext"
import Home from "./Home"
import Login from "./Login"
import OwnerHome from "./OwnerHome"
import Admin from "./admin"
import NoUser from "./NoUser"
import UserRes from "./userreservation"
import Reports from "./reports"
import './css/header.css'
import logo from '../img/logo.png'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/signup' element={
              <><header>
                <div className="logo">
                  <img src={logo} alt="Logo" />
                </div>
              </header>
              <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                <div className="w-100" style={{ maxWidth: '400px' }}>
                  <Signup />
                </div>
              </Container></>
            } />
            <Route path='/login' element={
              <><header>
                <div className="logo">
                  <img src={logo} alt="Logo" />
                </div>
              </header>
              <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                <div className="w-100" style={{ maxWidth: '400px' }}>
                  <Login />
                </div>
              </Container></>
            } />
            <Route path='/' element={<NoUser />} />
            <Route path='/home' element={<Home />} />
            <Route path='/ownerhome' element={<OwnerHome />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/userreservation' element={<UserRes />} />
            <Route path='/reports' element={<Reports />} />
          </Routes>
        </AuthProvider>
      </Router><footer>{'Licenta CTI RO 2023'}</footer>
    </>
  )
}

export default App
