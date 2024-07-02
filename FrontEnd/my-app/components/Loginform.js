import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import styles from '@/styles/Loginform.module.css'
import Link from 'next/link';
import { authenticateUser } from '@/lib/authenticate';

export default function Loginform() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [warning, setWarning] = useState('');
    const router = useRouter();

    async function handleSubmit (e) {
        e.preventDefault();
        try {
            await authenticateUser(username, password);
            router.push('/profile');
        } catch (err) {
            setWarning(err.message);
        }
    };

    return (<>
        <Container className={styles.main}>
            <h1 className={styles.header}>Login</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="username">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <div className={styles.btnBox}>
                {warning && (<><br /><Alert className={styles.warning} variant="danger">{warning}</Alert></>)}
                    <Button className={styles.btn} variant="primary" type="submit">
                        Login
                    </Button>
                </div>
            </Form>
        </Container>

        <h6 className={styles.signUpText}>Don't have an account? <Link href="/signup">Signup</Link></h6>
    </>

    );
};