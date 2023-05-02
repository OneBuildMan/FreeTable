import React from "react"
import Signup from "./Signup"
import { Container } from 'react-bootstrap'
import { AuthProvider } from "../contexts/AuthContext"
import Home from "./Home"
import Login from "./Login"

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function App() {
  return (
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh"} }
      >
        <div className="w-100" style={{ maxWidth: '400px'}}>
          <Router>
            <AuthProvider>
              <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/signup' element={<Signup/>} />
                <Route path='/login' element={<Login/>} />
                <Route path='/home' element={<Home/>} />
              </Routes>
            </AuthProvider>
          </Router>
        </div>
      </Container>
  )
}

export default App
