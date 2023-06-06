import React from 'react'
import logo from '../img/logo.png'
import { Link } from "react-router-dom"
import './css/button.css'
import './css/user-res.css'
import { useEffect, useState } from 'react'
import { firestore } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from "react-router-dom"
import signoutimg from '../img/signout.png'

export default function Dashboard() {
    const [reservations, setReservations] = useState([])
    const { currentUser, signout } = useAuth()
    const navigate = useNavigate()

    const fetchData = async () => {
        const resCollection = await firestore.collection('reservations').where("userEmail", "==",currentUser.email).get();
        setReservations(resCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    };

    useEffect(() => {
        fetchData();
    }, []
    )

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
                <Link to='/home' className='button'>Restaurants</Link>
                <Link to='/userreservation' style={{ backgroundColor: 'red', color: 'white' }} className='button'>Your reservation</Link>
                <img src={signoutimg} alt="Sign Out" className='sign-out-btn' onClick={handleSignOut} />
            </div>
        </header>
        <div className='user-tables'>
            <div className='user-table'>
            <h1>Your reservations</h1>
            <table className='user-user-table'>
                <thead>
                    <tr>
                        <th>Restaurant Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map(reservation => (
                        <tr key={reservation.resId}>
                            <td>{reservation.restaurantName}</td>
                            <td>{reservation.date}</td>
                            <td>{reservation.time}</td>
                            <td><button>Leave a review</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
        </>
    )
}