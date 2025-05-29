import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import AdminPage from './index';

// Admin Auth Guard component
const AdminRoute = ({ children }) => {
  const isAuthenticated = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      return user && token && user.type === 'admin';
    } catch (error) {
      return false;
    }
  };

  return isAuthenticated() ? children : <Navigate to="/admin" replace />;
};

const AdminRoutes = () => {
  return (
    <Route path="/admin" element={<AdminPage />} />
  );
};

export default AdminRoutes;
