import React from 'react'
import logo from '../img/logo.png'
import signout from '../img/signout.png'
import { Link } from "react-router-dom"
import './css/button.css'
import { useEffect, useState } from 'react'
import { firestore } from '../firebase'

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [owners, setOwners] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const userCollection = await firestore.collection('users').where("banned", "==", "no").get();
            setUsers(userCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})).filter(user => user.role === 'user'))
            setOwners(userCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})).filter(user => user.role === 'owner'))
        };

        fetchData();
    }, []
    )


    return (
        <>
        <header>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className='buttons'>
                <Link to='/login'><img src={signout} alt="signout" className='sign-out-btn'/></Link>
            </div>
        </header>
        <div>
            <h1>Users</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h1>Owners</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {owners.map(owner => (
                        <tr key={owner.id}>
                            <td>{owner.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    )
}