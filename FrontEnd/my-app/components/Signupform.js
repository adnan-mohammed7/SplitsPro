import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import styles from '@/styles/Loginform.module.css'
import Link from 'next/link';

export default function Signupform() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    const registerUser = async (first, last, mail, passwordOne, passwordTwo) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
            method: 'POST',
            body: JSON.stringify({ firstName: first, lastName: last, email: mail, password: passwordOne, confirmPassword: passwordTwo }),
            headers: {
                'content-type': 'application/json',
            },
        });

        const data = await res.json();

        if (res.status === 201) {
            setResult(`User Registered Successfully!`)
        } else {
            setError(data.message)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        registerUser(firstName, lastName, email, password, passwordCheck)
    };

    const reset = () => {
        setError('')
        setResult('')
    }

    return (<>
        <Container className={styles.main}>
            <h1 className={styles.header}>Signup</h1>
            <Form onSubmit={handleSubmit} onClick={() => reset()}>
            <Form.Group controlId="firstName">
                    <Form.Label>First Name:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="lastName">
                    <Form.Label>Last Name:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="username">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter new username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="passwordCheck">
                    <Form.Label>Confirm Password:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Re-enter new password"
                        value={passwordCheck}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                        required
                    />
                </Form.Group>

                <div className={styles.btnBox}>
                    {error && <p className={`text-danger ${styles.warning}`}>{error}</p>}
                    {result && <p className={`text-success ${styles.warning}`}>{result}</p>}
                    <Button className={styles.btn} variant="primary" type="submit">
                        Signup
                    </Button>
                </div>
            </Form>
        </Container>
        <h6 className={styles.signUpText}>Already have an Account? <Link href="/login">Login</Link></h6>
    </>
    );
};