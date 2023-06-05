import React, { useState, useRef , useEffect} from 'react'
import Modal from 'react-modal'
import logo from '../img/logo.png'
import signoutimg from '../img/signout.png'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate , Link } from "react-router-dom"
import { firestore , storage } from '../firebase'
import { Form, Button, Card, TabContent, TabPane, Image, Container, Nav } from 'react-bootstrap'
import './css/restauranttab.css'

Modal.setAppElement('#root');

export default function Dashboard() {
    const navigate = useNavigate()
    const { currentUser, signout } = useAuth()
    const [ownerHasRestaurant, setOwnerHasRestaurant] = useState(false);
    const [loading, setLoading] = useState(false)
    const nameRef = useRef()
    const phoneRef = useRef()
    const locationRef = useRef()
    const capacityRef = useRef()
    const menuRef = useRef()
    const photoRef = useRef()
    const [restaurant, setRestaurant] = useState(null)
    const [activeTab, setActiveTab] = useState('photo');
    const [editForm, setEditForm] = useState(false);
    const [deleteForm, setDeleteForm] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        if(currentUser){
        const data = await firestore.collection("restaurants").where("ownerId", "==", currentUser.uid).get();
        setOwnerHasRestaurant(!data.empty);

        if(!data.empty) {
          const restaurant = data.docs[0]
          const restaurantData = restaurant.data()

          setRestaurant(restaurantData);
        }
        }
      };
  
      fetchData();
    }, [currentUser]);

    function handleSignOut(){
        signout()
        .then(()=>{
            navigate('/login')
        }) 
    }

    async function handleSubmit(e) {
      e.preventDefault()

      const name = nameRef.current.value
      const phone = phoneRef.current.value
      const location = locationRef.current.value
      const capacity = capacityRef.current.value
      const menuFile = menuRef.current.files[0]
      const photoFile = photoRef.current.files[0]

      setLoading(true)

      const menuStorageRef = storage.ref().child('menus').child(menuFile.name);
      const menuUploadTask = menuStorageRef.put(menuFile);
      await new Promise((resolve, reject) => {
        menuUploadTask.on('state_changed', 
          (snapshot) => {
          }, 
          (error) => {
            reject(error);
          }, 
          () => {
            resolve();
          }
        );
      });

      const menuUrl = await menuUploadTask.snapshot.ref.getDownloadURL();
      
      const photoStorageRef = storage.ref().child('photos').child(photoFile.name);
      const photoUploadTask = photoStorageRef.put(photoFile);
      await new Promise((resolve, reject) => {
        photoUploadTask.on('state_changed', 
          (snapshot) => {
          }, 
          (error) => {
            reject(error);
          }, 
          () => {
            resolve();
          }
        );
      });

      const photoUrl = await photoUploadTask.snapshot.ref.getDownloadURL();

      const restaurantRef = firestore.collection('restaurants').doc();
      const restaurantData = {
        name,
        phone,
        location,
        capacity,
        menuUrl,
        photoUrl,
        ownerId: currentUser.uid,
        restaurantId: restaurantRef.id,
      };

      await restaurantRef.set(restaurantData);

      setLoading(false)

      nameRef.current.value = ''
      phoneRef.current.value = ''
      locationRef.current.value = ''
      menuRef.current.value = ''
      photoRef.current.value = ''

      window.location.reload(false);
    }

    const handleEdit = () => {
      setEditForm(true);
    };

    const handleDelete = () => {
      setDeleteForm(true);
    }; 

    const handleCloseForm = () => {
      setEditForm(false);
      setDeleteForm(false);
    };

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
          { ownerHasRestaurant ? (
            <><h2 className="restaurant-name">{restaurant.name}</h2>
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
                  <Nav.Link eventKey="settings">Settings</Nav.Link>
                </Nav.Item>
              </Nav>

              <TabContent className="tab-content">
                <TabPane eventKey="photo" active={activeTab === 'photo'}>
                  <Image src={restaurant.photoUrl} alt={restaurant.name} />
                </TabPane>
                <TabPane eventKey="menu" active={activeTab === 'menu'}>
                  <Image src={restaurant.menuUrl} alt="Menu" />
                </TabPane>
                <TabPane eventKey="location" active={activeTab === 'location'}>
                <div className="map">
                  <iframe
                    title="Location Map"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCsnBFuUpjzHB_8kC1FXRnofiRaYIq3Jjg&q=${encodeURIComponent(restaurant.location)}`}
                    allowFullScreen
                  ></iframe>
                </div>
                </TabPane>
                <TabPane eventKey="settings" active={activeTab === 'settings'}>
                  <div className='btn-cnt'>
                    <Button className='btn' onClick={handleEdit}>Edit Restaurant</Button>
                    <Button className='btn' onClick={handleDelete}>Delete Restaurant</Button>
                  </div>
                </TabPane>
              </TabContent>
            </Container>
            <Modal show={editForm} onHide={handleCloseForm}>
                <Modal.Header closeButton>
                  <Modal.Title>Edit Restaurant Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {/* Render your edit form here */}
                  {/* Form inputs and fields go here */}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseForm}>Cancel</Button>
                </Modal.Footer>
              </Modal>
            </>
            
          ) : (
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <Card>
                      <Card.Body>
                          <h2 className='text-center mb-4'>Add a restaurant</h2>
                          <Form onSubmit={handleSubmit}>
                              <Form.Group id="name">
                                  <Form.Label>Name</Form.Label>
                                  <Form.Control type="name" ref={nameRef} required />
                              </Form.Group>
                              <Form.Group id="phoneNumber">
                                  <Form.Label>Phone Number</Form.Label>
                                  <Form.Control type="name" ref={phoneRef} required />
                              </Form.Group>
                              <Form.Group id="location">
                                  <Form.Label>Location</Form.Label>
                                  <Form.Control type="name" ref={locationRef} required />
                              </Form.Group>
                              <Form.Group id="capacity">
                                  <Form.Label>Capacity</Form.Label>
                                  <Form.Control type="name" ref={capacityRef} required />
                              </Form.Group>
                              <Form.Group id="photo">
                                  <Form.Label>Photo</Form.Label>
                                  <Form.Control type="file" ref={photoRef} required />
                              </Form.Group>
                              <Form.Group id="menu">
                                  <Form.Label>Menu</Form.Label>
                                  <Form.Control type="file" ref={menuRef} required />
                              </Form.Group>

                              <div className='w-100 text-center mt-2'>
                                  {/*for space purpose*/}
                              </div>
                              <Button disabled={loading} className="w-100" type="submit">Add restaurant</Button>
                          </Form>
                      </Card.Body>
              </Card>
              </div>
          )}
        </div>
        
        </>
    )
}