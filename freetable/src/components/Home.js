import React , { useEffect , useState } from 'react'
import logo from '../img/logo.png'
import signoutimg from '../img/signout.png'
import { useAuth } from '../contexts/AuthContext'
import { Link , useNavigate } from "react-router-dom"
import { Button, TabContent, TabPane, Image, Container, Nav } from 'react-bootstrap'
import { firestore } from '../firebase'
import Modal from 'react-modal'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, setHours, setMinutes} from 'date-fns'
import './css/reserve.css'
import './css/review.css'
import emailjs from '@emailjs/browser'

Modal.setAppElement('#root')

export default function Dashboard() {
    const navigate = useNavigate()
    const { currentUser, signout } = useAuth()
    const [activeTab, setActiveTab] = useState('photo')
    const [currentRestaurant, setCurrentRestaurant] = useState({})
    const [restaurants, setRestaurants] = useState([])
    const [restaurantModal, setRestaurantModal] = useState(false)
    const [startDate, setStartDate] = useState(new Date())
    const [numPeople, setNumPeople] = useState(0)
    const [reservationTime, setReservationTime] = useState()
    const tomorrow = addDays(new Date(), 1)
    const minDateTime = setHours(setMinutes(tomorrow, 0), 0)
    const [reviews, setReviews] = useState([])
    const [occupiedChairs, setOccupiedChairs] = useState(0)
    // eslint-disable-next-line
    const [reservations, setReservations] = useState([])

    const times = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
    ]

    const fetchData = async () => {
        const restaurantCollection = await firestore.collection('restaurants').get()
        setRestaurants(restaurantCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))

        const reservationsCollection = await firestore.collection('reservations').get()
        setReservations(reservationsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    }

    const fetchReviews = async (resId) => {
        const reviewsCollection = await firestore.collection('restaurants').doc(resId).collection('reviews').get()
        setReviews(reviewsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    }


    useEffect(() => {
        fetchData()
        if (currentRestaurant) {
            fetchReviews(currentRestaurant.id)
          }
    }, [currentUser, currentRestaurant])


    function handleSignOut(){
        signout()
        .then(()=>{
            navigate('/login')
        }) 
    }

    function openModal(restaurant) {
        setCurrentRestaurant(restaurant)
        setRestaurantModal(true)
    }

    function closeModal() {
        setRestaurantModal(false)
    }

    function addDays(date, days) {
        const copy = new Date(Number(date))
        copy.setDate(date.getDate() + days)
        return copy;
    }

    const handleReservation = async (restaurantId, restaurantName) => {
        try {
            const reservationData = {
                date: format(startDate, 'MMMM d'),
                numberOfPeople: numPeople,
                time: reservationTime,
                userEmail: currentUser.email,
                resturantId: restaurantId,
                restaurantName: restaurantName,
                resId: ''
            };

            const docRef = await firestore.collection('reservations').add(reservationData);
            const updatedReservationData = {
                ...reservationData,
                resId: docRef.id
            };
  
            await docRef.update(updatedReservationData);
            console.log("Document written with ID: ", docRef.id)
        } catch (error) {
            console.error("Error adding document: ", error)
        }

        const template = {
            to_email: currentUser.email,
            message: restaurantName + " at " + reservationTime + " in " + format(startDate, 'MMMM d'),
        }
        emailjs.send('service_uqpvqhw', 'template_88pwz1d', template, 'dBzO3rpxjsvE0RGC4')
        handleDatePick(startDate, restaurantId)
        setReservationTime('')
        setRestaurantModal(false)
    }

    const handleDatePick = async(date, resId) => {
        const formatD = format(date, 'MMMM d');

        const resCollection = await firestore.collection('reservations').where("resturantId", "==", resId).where("date", "==", formatD).get()
        const reservations = resCollection.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const total = reservations.reduce((total, reservation) => total + reservation.numberOfPeople, 0);
        setOccupiedChairs(total)
    }

    return (
        <>
        <header>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className='buttons'>
                <Link to='/home' style={{ backgroundColor: 'red', color: 'white' }} className='button'>Restaurants</Link>
                <Link to='/userreservation' className='button'>Your reservation</Link>
                <img src={signoutimg} alt="Sign Out" className='sign-out-btn' onClick={handleSignOut} />
            </div>
        </header>
        <div className="restaurant-list">
            {restaurants.map(restaurant => (
            <div className='restaurant-box' key={restaurant.name}>
                <button onClick={() => openModal(restaurant)}>
                    <h2>{restaurant.name}</h2>
                    <img src={restaurant.photoUrl} alt={restaurant.name} />
                </button>
            </div>
            ))}
        </div> 
        <Modal
            isOpen={restaurantModal}
            onRequestClose={closeModal}
            contentLabel="Restaurant">
            <h2 className="restaurant-name">{currentRestaurant.name}</h2>
            <Container className="restaurant">
              <Nav variant="tabs" defaultActiveKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="photo">Restaurant</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="menu">Menu</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="location">Location</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reserve">Reserve</Nav.Link>
                </Nav.Item>
              </Nav>

              <TabContent className="tab-content">
                <TabPane eventKey="photo" active={activeTab === 'photo'}>
                  <Image src={currentRestaurant.photoUrl} alt={currentRestaurant.name} />
                </TabPane>
                <TabPane eventKey="menu" active={activeTab === 'menu'}>
                  <Image src={currentRestaurant.menuUrl} alt="Menu" />
                </TabPane>
                <TabPane eventKey="location" active={activeTab === 'location'}>
                <div className="map">
                  <iframe
                    title="Location Map"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCsnBFuUpjzHB_8kC1FXRnofiRaYIq3Jjg&q=${encodeURIComponent(currentRestaurant.location)}`}
                    allowFullScreen
                  ></iframe>
                </div>
                </TabPane>
                <TabPane eventKey="reviews" active={activeTab === 'reviews'}>
                    <div className='review-cont'>
                        {reviews.map((review) => (
                        <div key={review.id} className='review-item'>
                            <p className='review-text'>{review.text}</p>
                            <p className='review-user'>By: {review.userId}</p>
                        </div>
                        ))}
                    </div>
                </TabPane>
                <TabPane eventKey="reserve" active={activeTab === 'reserve'}>
                    <h2 className='title'>Reserve as {currentUser ? currentUser.email : "Guest"}</h2>
                    <div className='picker'>
                        <label className='date'>Select a date:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {setStartDate(date); handleDatePick(date, currentRestaurant.id)}}
                            dateFormat='MMMM d'
                            minDate={tomorrow}
                            minTime={minDateTime}
                            maxTime={setHours(setMinutes(tomorrow, 23), 59)}
                        />
                    </div>

                    <div className='picker'>
                        <label className='people'>Select number of people:</label>
                        <select
                            value={numPeople}
                            onChange={e => setNumPeople(Number(e.target.value))}
                        >
                            {Array.from({ length: currentRestaurant.capacity-occupiedChairs }, (_, i) => i + 1).map((number) => (
                                <option key={number} value={number}>
                                    {number}
                                </option>
                            ))}
                        </select>
                        <p>Available places: {currentRestaurant.capacity-occupiedChairs}</p>
                    </div>

                    <div className='picker'>
                        <label className='select-time'>Select reservation time:</label>
                        <select value={reservationTime} onChange={e => setReservationTime(e.target.value)}>
                            {times.map((time, index) => (
                                <option key={index} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                    <button className='btn-reserve' onClick={() => handleReservation(currentRestaurant.id, currentRestaurant.name)}>Reserve</button>
                </TabPane> 
              </TabContent>
            </Container>
            <Button className="btn" onClick={closeModal} style={{
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