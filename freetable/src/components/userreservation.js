import React from 'react'
import logo from '../img/logo.png'
import { Link } from "react-router-dom"
import './css/button.css'
import './css/user-res.css'
import './css/review.css'
import { useEffect, useState } from 'react'
import { firestore } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from "react-router-dom"
import signoutimg from '../img/signout.png'
import Modal from 'react-modal'
import { Button } from 'react-bootstrap'

Modal.setAppElement('#root')

export default function Dashboard() {
    const [pastReservations, setPastReservations] = useState([])
    const [futureReservations, setFutureReservations] = useState([])
    const { currentUser, signout } = useAuth()
    const navigate = useNavigate()
    const [reviewModal, setReviewModal] = useState(false)
    const [restaurantReview, setRestaurantReview] = useState("")
    const [restaurantName, setRestaurantName] = useState("")

    const fetchData = async () => {
        let currentDate = new Date()
        const resCollection = await firestore.collection('reservations').where("userEmail", "==", currentUser.email).where("unformatedDate", "<", currentDate).get()
        setPastReservations(resCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))

        const resFutureCollection = await firestore.collection('reservations').where("userEmail", "==", currentUser.email).where("unformatedDate", ">", currentDate).get()
        setFutureReservations(resFutureCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))

        console.log(currentDate, futureReservations, pastReservations)
    };


    useEffect(() => {
        fetchData()
    }, [currentUser])

    function handleSignOut(){
        signout()
        .then(()=>{
            navigate('/login')
        }) 
    }

    function openReviewModal(restaurantName) {
        setRestaurantName(restaurantName)
        setReviewModal(true)
    }

    function closeReviewModal() {
        setRestaurantReview("")
        setRestaurantName("")
        setReviewModal(false)
    }

    async function leaveReview() {
        const review = {
            text: restaurantReview,
            userId: currentUser.email, 
            restaurantName: restaurantName,
        }
        
        const restaurant = await firestore.collection('restaurants').where("name", "==", restaurantName).get()
        const rId = restaurant.docs[0].id
        const newReview = await firestore.collection('restaurants').doc(rId).collection('reviews').add(review)
        const reviewId = newReview.id
        await newReview.update({id: reviewId})

        setRestaurantReview("")
        closeReviewModal()
    }

    async function deleteReservation(resId) {
        await firestore.collection('reservations').doc(resId).delete()
        fetchData()
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
            <h1>Your current reservations</h1>
            <table className='user-user-table'>
                <thead>
                    <tr>
                        <th>Restaurant Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Pending review</th>
                        <th>Delete reseravion</th>
                    </tr>
                </thead>
                <tbody>
                {futureReservations.map(reservation => (
                        <tr key={reservation.resId}>
                            <td>{reservation.restaurantName}</td>
                            <td>{reservation.date}</td>
                            <td>{reservation.time}</td>
                            <td>Pending</td>
                            <td><button onClick={() => deleteReservation(reservation.id)}>Delete reservation</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>

        <div className='user-tables'>
            <div className='user-table'>
            <h1>Your past reservations</h1>
            <table className='user-user-table'>
                <thead>
                    <tr>
                        <th>Restaurant Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Review</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {pastReservations.map(reservation => (
                        <tr key={reservation.resId}>
                            <td>{reservation.restaurantName}</td>
                            <td>{reservation.date}</td>
                            <td>{reservation.time}</td>
                            <td><button onClick={() => openReviewModal(reservation.restaurantName)}>Review it</button></td>
                            <td><button onClick={() => deleteReservation(reservation.id)}>Delete reservation</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>

        <Modal
            isOpen={reviewModal}
            onRequestClose={closeReviewModal}
            contentLabel='LeaveReview'>
            <h2 className="restaurant-name">Leave a review</h2>
            <textarea  
                className='review'
                onChange={(e) => setRestaurantReview(e.target.value)} 
                placeholder="Write your review here..." 
            />
            <button className='btn-reserve' onClick={() => leaveReview()}>Leave review</button>
            <Button className="btn" onClick={closeReviewModal} style={{
                display: 'inline-block',
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                
                }}>Close</Button>
        </Modal>

        </>
    )
}