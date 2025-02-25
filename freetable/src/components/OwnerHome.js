import React, { useState, useRef , useEffect} from 'react'
import Modal from 'react-modal'
import logo from '../img/logo.png'
import signoutimg from '../img/signout.png'
import userIcon from '../img/user-icon.png'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate , Link } from "react-router-dom"
import { firestore , storage } from '../firebase'
import { Form, Button, Card, TabContent, TabPane, Image, Container, Nav } from 'react-bootstrap'
import './css/restauranttab.css'
import './css/review.css'
import './css/res-rez.css'
import './css/profile.css'

Modal.setAppElement('#root')

export default function Dashboard() {
    const navigate = useNavigate()
    const { currentUser, signout } = useAuth()
    const [ownerHasRestaurant, setOwnerHasRestaurant] = useState(false)
    const [loading, setLoading] = useState(false)
    const nameRef = useRef()
    const phoneRef = useRef()
    const locationRef = useRef()
    const capacityRef = useRef()
    const menuRef = useRef()
    const photoRef = useRef()
    const [restaurant, setRestaurant] = useState(null)
    const [restaurants, setRestaurants] = useState([])
    const [activeTab, setActiveTab] = useState('photo')
    const [editForm, setEditForm] = useState(false)
    const [deleteForm, setDeleteForm] = useState(false)
    const [restaurantModal, setRestaurantModal] = useState(false)
    const [currentRestaurant, setCurrentRestaurant] = useState({})
    const [newRestaurantModal, setNewRestaurantModal] = useState(false)
    const [reviews, setReviews] = useState([])
    const [reviewId, setReviewId] = useState("")
    const [restaurantId, setRestaurantId] = useState("")
    const [reportModal, setReportModal] = useState(false)
    const [reviewReport, setReviewReport] = useState("")
    const [reservations, setReservations] = useState([])
    const [reportedReview, setReportedReview] = useState("")
    const [reportedUser, setReportedUser] = useState("")
    const [r1, setr1] = useState([])
    const [profileModal, setProfileModal] = useState(false)
    const [reportResModal, setReportResModal] = useState(false)
    const [reportedRes, setReportedRes] = useState("")
    const [LastUser, setLastUser] = useState("")

    const fetchReviews = async (resId) => {
      const reviewsCollection = await firestore.collection('restaurants').doc(resId).collection('reviews').get()
      setReviews(reviewsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    }

    const fetchReservations = async () => {
      const reservationsCollection = await firestore.collection('reservations').get()
      setReservations(reservationsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    }

    const currentReservations = (resId) => {
      const currCollection = reservations.filter(reservation => reservation['resturantId'] === resId)
      setr1(currCollection)
    }

    useEffect(() => {
      const fetchData = async () => {
        if(currentUser){
        const data = await firestore.collection("restaurants").where("ownerId", "==", currentUser.uid).get()
        setRestaurants(data.docs.map(doc => ({ ...doc.data(), id: doc.id})))
        setOwnerHasRestaurant(!data.empty)

        if(!data.empty) {
          const restaurant = data.docs[0]
          const restaurantData = restaurant.data()

          setRestaurant(restaurantData)
        }
        }
      }

      if (currentRestaurant) {
        fetchReviews(currentRestaurant.id)
        fetchReservations()
        currentReservations(currentRestaurant.id)
      }

      fetchData()
    }, [currentUser, currentRestaurant, editForm, newRestaurantModal])

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

      const menuStorageRef = storage.ref().child('menus').child(menuFile.name)
      const menuUploadTask = menuStorageRef.put(menuFile);
      await new Promise((resolve, reject) => {
        menuUploadTask.on('state_changed', 
          (snapshot) => {
          }, 
          (error) => {
            reject(error)
          }, 
          () => {
            resolve()
          }
        )
      })

      const menuUrl = await menuUploadTask.snapshot.ref.getDownloadURL()
      
      const photoStorageRef = storage.ref().child('photos').child(photoFile.name)
      const photoUploadTask = photoStorageRef.put(photoFile);
      await new Promise((resolve, reject) => {
        photoUploadTask.on('state_changed', 
          (snapshot) => {
          }, 
          (error) => {
            reject(error)
          }, 
          () => {
            resolve()
          }
        )
      })

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

      setNewRestaurantModal(false)
    }

    const handleEdit = () => {
      setEditForm(true)
    }

    const handleDelete = () => {
      setDeleteForm(true)
    }

    const handleCloseForm = () => {
      setEditForm(false)
      setDeleteForm(false)
      setNewRestaurantModal(false)
      setReportModal(false)
      setProfileModal(false)
      setReportResModal(false)
    }

    function openProfileModal() {
      setProfileModal(true)
    }

    async function handleEditForm(e) {
      e.preventDefault()

      const name = nameRef.current.value
      const phone = phoneRef.current.value
      const location = locationRef.current.value
      const capacity = capacityRef.current.value
      const menuFile = menuRef.current.files[0]
      const photoFile = photoRef.current.files[0]

      setLoading(true)

      const restaurantRef = firestore.collection('restaurants').doc(restaurant.restaurantId)
      const update = {}

      if(name){update.name = name}
      if(phone){update.phone = phone}
      if(location){update.location = location}
      if(capacity){update.capacity = capacity}

      if (menuFile) {
        const menuStorageRef = storage.ref().child('menus').child(menuFile.name)
        const menuUploadTask = menuStorageRef.put(menuFile)
        await new Promise((resolve, reject) => {
          menuUploadTask.on(
            'state_changed',
            (snapshot) => {},
            (error) => {
              reject(error);
            },
            () => {
              resolve()
            }
          )
        })
    
        const menuUrl = await menuUploadTask.snapshot.ref.getDownloadURL();
        update.menuUrl = menuUrl;
      }
    
      if (photoFile) {
        const photoStorageRef = storage.ref().child('photos').child(photoFile.name);
        const photoUploadTask = photoStorageRef.put(photoFile);
    
        await new Promise((resolve, reject) => {
          photoUploadTask.on(
            'state_changed',
            (snapshot) => {},
            (error) => {
              reject(error)
            },
            () => {
              resolve()
            }
          );
        });
    
        const photoUrl = await photoUploadTask.snapshot.ref.getDownloadURL();
        update.photoUrl = photoUrl;
      }
    
      if (Object.keys(update).length > 0) {
        await restaurantRef.update(update);
      }
    
      setLoading(false)
    
      nameRef.current.value = ''
      phoneRef.current.value = ''
      locationRef.current.value = ''
      capacityRef.current.value = ''
      menuRef.current.value = ''
      photoRef.current.value = ''
    
      setEditForm(false)
      setRestaurantModal(false)
    }

    async function handleDeleteForm(e) {
      e.preventDefault(e)

      setLoading(true)

      try {
        await firestore.collection('restaurants').doc(restaurant.restaurantId).delete()
        console.log("resturant deleted")
      } catch (error) {
        console.error("Couldnt delete document: ", error)
      }

      setDeleteForm(false)
      setLoading(false)
      window.location.reload(false)
    }

    function openModal(restaurant) {
      setCurrentRestaurant(restaurant)
      setRestaurantModal(true)
    }

    function closeModal() {
      setRestaurantModal(false)
      setNewRestaurantModal(false)
      setReportModal(false)
      setReportResModal(false)
      setProfileModal(false)
    }

    function addNewModal() {
      setNewRestaurantModal(true)
    }

    function handleReport(reportedReview, reportedUser, reviewId, restaurantId) {
      setReportedReview(reportedReview)
      setReportedUser(reportedUser)
      setReviewId(reviewId)
      setRestaurantId(restaurantId)
      setReportModal(true)
    }

    function reportRes(reportedUser, resId, LastUser) {
      setRestaurantId(resId)
      setReportedRes(reportedRes)
      setReportedUser(reportedUser)
      setLastUser(LastUser)
      setReportResModal(true)
    }

    async function reportReview() {
      const report = {
        text: reviewReport,
        reporter: currentUser.email, 
        review: reportedReview,
        reportedUser: reportedUser,
        reviewId: reviewId,
        restaurantId: restaurantId
      }
    
      let doc = await firestore.collection('reports').add(report)
      let reportId = doc.id

      await doc.update({id: reportId})
      
      setReviewReport("")
      setReportedReview("")
      setReportedUser("")
      setReviewId("")
      setRestaurantId("")
      closeModal()
    }

    async function reportResReview() {
      const report = {
        text: reportedRes,
        reporter: currentUser.email,
        reservationId: reportedUser,
        reportedUser: LastUser
      }

      let doc = await firestore.collection('reports-res').add(report)
      let reportId = doc.id

      await doc.update({id: reportId})

      setReportedRes("")
      closeModal()
    }

    async function deleteAccount() {
      if(window.confirm("Are you sure you want to delete the account? This will delete your restaurant(s)!")){
          await firestore.collection('restaurants').where("restaurantId", "==", restaurant.restaurantId).get().then((allD) => {
              let deleted = firestore.batch()
              allD.forEach(doc => {
                  deleted.delete(doc.ref)
              })

              return deleted.commit()
          })

          await firestore.collection('users').where("email", "==", currentUser.email).get().then((allD) => {
              let deleted = firestore.batch()
              allD.forEach(doc => {
                  deleted.delete(doc.ref)
              })

              return deleted.commit()
          })
          await currentUser.delete()
          navigate('/login')
      }
    }

    return (
        <>
        <header>
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className='buttons'>
            <Link to='/ownerhome' style={{ backgroundColor: 'red', color: 'white' }} className='button'>Your restuarant</Link>
            <Button className='button' onClick={addNewModal}>Add restaurant</Button>
            <img src={userIcon} alt="profile" className='sign-out-btn' onClick={openProfileModal} />
            <img src={signoutimg} alt="Sign Out" className='sign-out-btn' onClick={handleSignOut} />
          </div>
          <Modal isOpen={profileModal} onRequestClose={closeModal} contentLabel='profile' className='profile'>
                <h2>Hello!</h2>
                <p>You are logged in as: {currentUser.email}</p>
                <button onClick={deleteAccount}>Delete account</button>
                <button onClick={closeModal}>Close</button>
            </Modal>
        </header>

        <div>
          { ownerHasRestaurant ? (
            <>
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
              <Modal isOpen={restaurantModal} onRequestClose={closeModal} contentLabel="Restaurant">
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
                        <Nav.Link eventKey="reservations">Reservations</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="settings">Settings</Nav.Link>
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
                                <Button className='btn' onClick={() => handleReport(review.text, review.userId, review.id, currentRestaurant.id)}>Report review</Button>
                              </div>
                            ))}
                        </div>
                        <Modal isOpen={reportModal} onRequestClose={handleCloseForm} contentLabel='Report'>
                          <h2 className="restaurant-name">Report review</h2>
                          <textarea  className='review' onChange={(e) => setReviewReport(e.target.value)} placeholder="Write your report here..." />
                          <button className='btn' onClick={() => reportReview()} style={{margin: "0 auto", display: "block"}}>Report review</button>
                          <Button disabled={loading} className="btn" type="submit" onClick={handleCloseForm} style={{margin: "0 auto", display: "block"}}>Cancel</Button>
                        </Modal>
                      </TabPane>
                      <TabPane eventKey="reservations" active={activeTab === 'reservations'}>
                      <div className='res-rezs'>
                        <div className='res-rez'>
                        <h1>Reservations on your restaurant</h1>
                        <table className='res-rez-table'>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>No. People</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {r1.map(reservation => (
                                    <tr key={reservation.resId}>
                                        <td>{reservation.name}</td>
                                        <td>{reservation.date}</td>
                                        <td>{reservation.time}</td>
                                        <td>{reservation.numberOfPeople}</td>
                                        <Button className='btn' onClick={() => reportRes(reservation.resId, reservation.resturantId, reservation.userEmail)} style={{margin: "0 auto", display: "block"}}>Report</Button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                          <Modal isOpen={reportResModal} onRequestClose={handleCloseForm} contentLabel='Report'>
                            <h2 className="restaurant-name">Report Reservation</h2>
                            <textarea  className='review' onChange={(e) => setReportedRes(e.target.value)} placeholder="Write your report here..." />
                            <button className='btn' onClick={() => reportResReview()} style={{margin: "0 auto", display: "block"}}>Report Reservation</button>
                            <Button disabled={loading} className="btn" type="submit" onClick={handleCloseForm} style={{margin: "0 auto", display: "block"}}>Cancel</Button>
                          </Modal>
                        </div>
                      </TabPane>
                      <TabPane eventKey="settings" active={activeTab === 'settings'}>
                        <div className='btn-cnt'>
                          <Button className='btn' onClick={handleEdit}>Edit Restaurant</Button>
                          <Button className='btn' onClick={handleDelete}>Delete Restaurant</Button>
                        </div>
                        <div>
                          <Modal isOpen={deleteForm} onRequestClose={handleCloseForm} contentLabel="Delete Restaurant">
                              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                    <Card>
                                    <Card.Body>
                                        <h2 className='text-center mb-4'>Are you sure you want to delete the restaurant?</h2>
                                        <Form>
                                            <div className='w-100 text-center mt-2'>
                                                {/*for space purpose*/}
                                            </div>
                                            <Button disabled={loading} className="w-100" type="submit" onClick={handleDeleteForm}>Delete restaurant</Button>
                                            <Button disabled={loading} className="w-100" type="submit" onClick={handleCloseForm}>Cancel</Button>
                                        </Form>
                                    </Card.Body>
                                  </Card>
                                </div>
                            </Modal>
                        </div>
                        <div>
                          <Modal isOpen={editForm} onRequestClose={handleCloseForm} contentLabel="Edit Restaurant">
                            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                  <Card>
                                  <Card.Body>
                                      <h2 className='text-center mb-4'>Edit restaurant</h2>
                                      <Form>
                                          <Form.Group id="name">
                                              <Form.Label>Does it have another name?</Form.Label>
                                              <Form.Control type="name" ref={nameRef}/>
                                          </Form.Group>
                                          <Form.Group id="phoneNumber">
                                              <Form.Label>Is there another phone number?</Form.Label>
                                              <Form.Control type="name" ref={phoneRef}/>
                                          </Form.Group>
                                          <Form.Group id="location">
                                              <Form.Label>Is there a different location?</Form.Label>
                                              <Form.Control type="name" ref={locationRef}/>
                                          </Form.Group>
                                          <Form.Group id="capacity">
                                              <Form.Label>Another capacity?</Form.Label>
                                              <Form.Control type="name" ref={capacityRef}/>
                                          </Form.Group>
                                          <Form.Group id="photo">
                                              <Form.Label>Want to change restaurant photo?</Form.Label>
                                              <Form.Control type="file" ref={photoRef}/>
                                          </Form.Group>
                                          <Form.Group id="menu">
                                              <Form.Label>Want to change the menu? </Form.Label>
                                              <Form.Control type="file" ref={menuRef}/>
                                          </Form.Group>

                                          <div className='w-100 text-center mt-2'>
                                              {/*for space purpose*/}
                                          </div>
                                          <Button disabled={loading} className="w-100" type="submit" onClick={handleEditForm}>Edit restaurant</Button>
                                          <Button disabled={loading} className="w-100" type="submit" onClick={handleCloseForm}>Cancel</Button>
                                      </Form>
                                  </Card.Body>
                                </Card>
                              </div>
                          </Modal>
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
              <Modal isOpen={newRestaurantModal} onRequestClose={closeModal} contentLabel="Delete Restaurant">
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <Card>
                    <Card.Body>
                      <h2 className='text-center mb-4'>Add a new restaurant</h2>
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
                  <Button className="btn" onClick={closeModal} style={{
                          display: 'inline-block',
                          position: 'absolute',
                          bottom: '20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                      }}>Close</Button>
                  </div>
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