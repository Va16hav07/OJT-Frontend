import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const BannedUserMessage = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <Container className="py-5">
            <Alert variant="danger">
                <Alert.Heading>Account Suspended</Alert.Heading>
                <p>
                    Your account has been banned by the administrator. This may be due to a violation of our terms of service.
                </p>
                <p>
                    If you believe this is an error, please contact our customer support for assistance.
                </p>
                <hr />
                <div className="d-flex justify-content-between">
                    <Button variant="outline-danger" onClick={handleLogout}>
                        Logout
                    </Button>
                    <Link to="/" className="btn btn-primary">
                        Return Home
                    </Link>
                </div>
            </Alert>
        </Container>
    );
};

export default BannedUserMessage;
