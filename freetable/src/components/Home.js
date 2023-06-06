import React , { useEffect , useState } from 'react'
import logo from '../img/logo.png'
import signoutimg from '../img/signout.png'
import { useAuth } from '../contexts/AuthContext'
import { Link , useNavigate } from "react-router-dom"
import { Button, TabContent, TabPane, Image, Container, Nav } from 'react-bootstrap'
import { firestore } from '../firebase'
import Modal from 'react-modal'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

Modal.setAppElement('#root')

export default function Dashboard() {
    const navigate = useNavigate()
    const { currentUser, signout } = useAuth()
    const [activeTab, setActiveTab] = useState('photo')
    const [currentRestaurant, setCurrentRestaurant] = useState({})
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantModal, setRestaurantModal] = useState(false)
    const [startDate, setStartDate] = useState(new Date());
    const [numPeople, setNumPeople] = useState(1);
    const [reservationTime, setReservationTime] = useState(new Date());

    const fetchData = async () => {
        const restaurantCollection = await firestore.collection('restaurants').get()
        setRestaurants(restaurantCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))

    };

    useEffect(() => {
        fetchData();
        console.log(currentUser)
    }, [currentUser])


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
        const copy = new Date(Number(date));
        copy.setDate(date.getDate() + days);
        return copy;
    }

    const handleReservation = async (restaurantId, restaurantName) => {
        try {
            const reservationData = {
                date: format(startDate, 'MMMM d'),
                numberOfPeople: numPeople,
                time: format(reservationTime, 'HH:mm'),
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
            console.log("Document written with ID: ", docRef.id);
        } catch (error) {
            console.error("Error adding document: ", error);
        }

        setRestaurantModal(false)
    };

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
                  <div className='btn-cnt'>
                    <h2>aici o sa vina reviews</h2>
                  </div>
                </TabPane>
                <TabPane eventKey="reserve" active={activeTab === 'reserve'}>
                    <h2 className='title'>Reserve as {currentUser ? currentUser.email : "Guest"}</h2>
                    <div className='picker'>
                        <label className='date'>Select a date:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            minDate={new Date()}
                            maxDate={addDays(new Date(), 30)}
                            dateFormat='MMMM d'
                        />
                    </div>

                    <div className='picker'>
                        <label className='people'>Select number of people:</label>
                        <select value={numPeople} onChange={(e) => setNumPeople(parseInt(e.target.value))}>
                            {[...Array(10).keys()].map(num =>
                                <option key={num + 1} value={num + 1}>{num + 1}</option>
                            )}
                        </select>
                    </div>

                    <div className='picker'>
                        <label className='time'>Select reservation time:</label>
                        <DatePicker
                            selected={reservationTime}
                            onChange={(time) => setReservationTime(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="HH:mm"
                        />
                    </div>
                    <button className='btn' onClick={() => handleReservation(currentRestaurant.id, currentRestaurant.name)}>Reserve</button>
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