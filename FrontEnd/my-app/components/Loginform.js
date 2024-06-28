import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button } from 'react-bootstrap';
import styles from '@/styles/Loginform.module.css'

export default function Loginform(){
    const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock authentication (replace with actual authentication logic)
    if (username === 'admin' && password === 'password') {
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Container className={styles.main}>
      <h1 className={styles.header}>Login</h1>
      {error && <p className="text-danger">{error}</p>}
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
        <Button className={styles.btn} variant="primary" type="submit">
          Login
        </Button>
        </div>
      </Form>
    </Container>
  );
};