import React from 'react'
import logo from '../img/logo.png'
import signout from '../img/signout.png'
import { Link } from "react-router-dom"
import './css/button.css'
import './css/userstable.css'
import './css/admin-table.css'
import { useEffect, useState } from 'react'
import { firestore } from '../firebase'

export default function Dashboard() {
    const [users, setUsers] = useState([])
    const [owners, setOwners] = useState([])
    const [bannedUsers, setBannedUsers] = useState([])
    const [restaurants, setRestaurants] = useState([])

    const fetchData = async () => {
        const userCollection = await firestore.collection('users').where("banned", "==", "no").get()
        setUsers(userCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})).filter(user => user.role === 'user'))
        setOwners(userCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})).filter(user => user.role === 'owner'))

        const restaurantCollection = await firestore.collection('restaurants').get()
        setRestaurants(restaurantCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))

        const bannedCollection = await firestore.collection('users').where("banned", "==", "yes").get()
        setBannedUsers(bannedCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    }


    useEffect(() => {
        fetchData()
    }, [])

    const banUser = async (userId) => {
        if(window.confirm('Are you sure you want to ban this user?')){
            await firestore.collection('users').doc(userId).update({
                banned: 'yes'
            })
            fetchData()
        }
    }

    const unbanUser = async (userId) => {
        if(window.confirm('Are you sure you want to unban this user?')){
            await firestore.collection('users').doc(userId).update({
                banned: 'no'
            })
            fetchData()
        }
    }

    const deleteRestaurant = async (resId) => {
        if(window.confirm('Are you sure you want to delete this user?')){
            await firestore.collection('restaurants').doc(resId).delete()
            fetchData()
        }
    }

    return (
        <>
        <header>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className='buttons'>
                <Link to='/admin' style={{ backgroundColor: 'red', color: 'white' }} className='button'>All users</Link>
                <Link to='/reports' className='button'>Reports</Link>
                <Link to='/login'><img src={signout} alt="signout" className='sign-out-btn'/></Link>
            </div>
        </header>
        <div className='admin-tables'>
            <div className='admin-table'>
            <h1>Users</h1>
            <table className='admin-table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><button onClick={() => banUser(user.id)}>Ban</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            
            <div className='admin-table'>
            <h1>Owners</h1>
            <table className='admin-table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {owners.map(owner => (
                        <tr key={owner.id}>
                            <td>{owner.name}</td>
                            <td>{owner.email}</td>
                            <td><button onClick={() => banUser(owner.id)}>Ban</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            
            <div className='admin-table'>
            <h1>Restaurants</h1>
            <table className='admin-table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {restaurants.map(restaurant => (
                        <tr key={restaurant.id}>
                            <td>{restaurant.name}</td>
                            <td><button onClick={() => deleteRestaurant(restaurant.id)}>Delete restaurant</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <div className='admin-table'>
            <h1>Banned users</h1>
            <table className='admin-table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {bannedUsers.map(bannedUser => (
                        <tr key={bannedUser.id}>
                            <td>{bannedUser.name}</td>
                            <td>{bannedUser.email}</td>
                            <td>{bannedUser.role}</td>
                            <td><button onClick={() => unbanUser(bannedUser.id)}>Unban</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
        </>
    )
}