import React, { useEffect , useState } from 'react'
import logo from '../img/logo.png'
import './css/header.css'
import './css/button.css'
import './css/restauranttab.css'
import './css/restaurantbox.css'
import Modal from 'react-modal'
import { firestore } from '../firebase'
import { Button, TabContent, TabPane, Image, Container, Nav } from 'react-bootstrap'
import { Link , useNavigate } from "react-router-dom"

Modal.setAppElement('#root')

export default function Dashboard() {

    const [restaurants, setRestaurants] = useState([]);
    const [activeTab, setActiveTab] = useState('photo')
    const [currentRestaurant, setCurrentRestaurant] = useState({})
    const [restaurantModal, setRestaurantModal] = useState(false)
    const navigate = useNavigate()

    const fetchData = async () => {
        const restaurantCollection = await firestore.collection('restaurants').get()
        setRestaurants(restaurantCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    };

    useEffect(() => {
        fetchData();
    }, []
    )

    function openModal(restaurant) {
        setCurrentRestaurant(restaurant)
        setRestaurantModal(true)
    }

    function closeModal() {
        setRestaurantModal(false)
    }

    function handleGoLogin() {
        navigate('/login')
    }

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
                  <div className='btn-cnt'>
                    <Button className='btn' onClick={handleGoLogin}>You have to be logged in to make a reservation!</Button>
                  </div>
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
