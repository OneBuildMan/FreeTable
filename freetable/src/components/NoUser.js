import React from 'react'
import logo from '../img/logo.png'
import { Button } from 'react-bootstrap'
import { Link } from "react-router-dom"

export default function Dashboard() {
    return (
        <>
        <header>
        <div className="header-section"></div>
        <div className="header-section">
            <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="header-section button-group">
            <Link to="/login">
                <Button variant="outline-danger">Login</Button>
            </Link>
            <Link to="/signup">
                <Button variant="outline-danger">Sign Up</Button>
            </Link>
        </div>
        </header>
        <div>
            nouser
        </div>
        </>
    )
}