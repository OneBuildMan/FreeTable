import React from 'react'
import logo from '../img/logo.png'
import { Link } from "react-router-dom"
import './css/header.css'
import './css/button.css'

export default function Dashboard() {
    return (
        <>
        <header>
            <div className="logo">
                <img src={logo} alt="Logo"/>
            </div>
            <div className='buttons'>
                <Link to='/login' className='button'>Log In</Link>
                <Link to='/signup' className='button'>Sign Up</Link>
            </div>
        </header>
        <div>
            nouser
        </div>
        </>
    )
}
