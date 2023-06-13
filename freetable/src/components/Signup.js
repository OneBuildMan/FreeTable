import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Link , useNavigate } from "react-router-dom"

export default function Signup() {
    const nameRef = useRef()
    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmRef = useRef()
    const roleRef = useRef()
    const { signup } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        if(passwordRef.current.value !== passwordConfirmRef.current.value){
            return setError('Passwords do not match')
        }

        if(passwordRef.current.value.length < 6){
            return setError('Password must be at least 6 characters')
        }

        try {
            setError('')
            setLoading(true)
            await signup(nameRef.current.value, emailRef.current.value, passwordRef.current.value, roleRef.current.value)
            navigate('/login')
        } catch (error) {
            console.error(error)
            setError('Failed to create an accout')
        }
        
        setLoading(false)
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Sign up</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="name" ref={nameRef} required />
                        </Form.Group>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                            <Form.Text className="text-muted">Email has to be valid</Form.Text>
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required />
                            <Form.Text className="text-muted">Password must be at least 6 characters</Form.Text>
                        </Form.Group>
                        <Form.Group id="password-confirm">
                            <Form.Label>Password confirmation</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef} required />
                        </Form.Group>
                        <Form.Group id="role">
                            <Form.Label>What are you?</Form.Label>
                            <Form.Control as="select" ref={roleRef} required>
                                <option value="user">User</option>
                                <option value="owner">Restaurant owner</option>
                             </Form.Control>
                        </Form.Group>
                        <div className='w-100 text-center mt-2'>
                             {/*for space purpose*/}
                        </div>
                        <Button disabled={loading} className="btn" type="submit" style={{margin: "0 auto", display: "block"}}>Sign Up</Button>
                    </Form>
                </Card.Body>
            </Card>
        <div className='w-100 text-center mt-2'>
            Already have an account? <Link to="/login">Login</Link>
        </div>
        <div className='w-100 text-center mt-2'>
            Continue without account...<Link to="/">Go home</Link>
        </div>
    </>
    )
}