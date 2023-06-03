import React, { useState, useRef } from 'react'
import logo from '../img/logo.png'
import signoutimg from '../img/signout.png'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate , Link } from "react-router-dom"
import { firestore , storage } from '../firebase'
import { Form, Button, Card, } from 'react-bootstrap'
import './css/map.css'


export default function Dashboard() {
    const navigate = useNavigate()
    const { currentUser, signout } = useAuth()
    const [loading, setLoading] = useState(false)
    const nameRef = useRef()
    const phoneRef = useRef()
    const locationRef = useRef()
    const capacityRef = useRef()
    const menuRef = useRef()
    const photoRef = useRef()


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
            // You can use this part to track the upload progress...
          }, 
          (error) => {
            // Handle unsuccessful uploads...
            reject(error);
          }, 
          () => {
            // Resolve the promise when the upload is complete
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
            // You can use this part to track the upload progress...
          }, 
          (error) => {
            // Handle unsuccessful uploads...
            reject(error);
          }, 
          () => {
            // Resolve the promise when the upload is complete
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
        </>
    )
}