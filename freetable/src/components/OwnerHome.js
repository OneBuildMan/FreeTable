import React from 'react'
import logo from '../img/logo.png'
import signoutimg from '../img/signout.png'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate , Link } from "react-router-dom"

export default function Dashboard() {
    const navigate = useNavigate()
    const { signout } = useAuth()

    function handleSignOut(){
        signout()
        .then(()=>{
            navigate('/login')
        }) 
    }

    return (
        <>
        <header>
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className='buttons'>
            <Link to='/ownerhome' style={{ backgroundColor: 'red', color: 'white' }} className='button'>Your restuarant</Link>
            <img src={signoutimg} alt="Sign Out" className='sign-out-btn' onClick={handleSignOut} />
          </div>
        </header>
        <div>
            stay tunned for owner cr7
        </div>
        </>
    )
}