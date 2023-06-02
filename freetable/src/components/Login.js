import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Link , useNavigate } from "react-router-dom"

export default function Login() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setError('')
            setLoading(true)
            if(emailRef.current.value === 'admin@admin.com' && passwordRef.current.value === 'admin12'){
                await login(emailRef.current.value, passwordRef.current.value)
                navigate('/admin')
            }
            else{
                const user = await login(emailRef.current.value, passwordRef.current.value)
                if(user.banned === 'yes'){
                    setError('This account has been banned!')
                }
                else {
                    if(user.role === 'owner'){
                        navigate('/ownerhome')
                    } else if(user.role === 'user'){
                        navigate('/home')
                    }
                }
            }
        } catch(error) {
            console.error(error);
            setError('Failed to sign in')
        }
        
        setLoading(false)
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Login</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required />
                        </Form.Group>
                        <div className='w-100 text-center mt-2'>
                             {/*for space purpose*/}
                        </div>
                        <Button disabled={loading} className="w-100" type="submit">Login</Button>
                    </Form>
                </Card.Body>
            </Card>
        <div className='w-100 text-center mt-2'>
            Need an account? <Link to="/signup">Sign Up</Link>
        </div>
        <div className='w-100 text-center mt-2'>
            Continue without account...<Link to="/">Go home</Link>
        </div>
    </>
    )
}