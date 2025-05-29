import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import our API utility
// Add this line to import the api utility
import api from '../utils/api';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use regular axios for login since we're not authenticated yet
      const response = await axios.post('https://equiply-jrej.onrender.com/user/signin', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Check if user is admin
      if (user.type !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Notify parent component about successful login
      onLogin(user);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h4>Admin Login</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Make sure we have a valid token before making the request
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://equiply-jrej.onrender.com/admin/dashboard', {
          headers: {
            'x-access-token': token
          }
        });
        
        setStats(response.data.stats);
      } catch (error) {
        setError('Failed to load dashboard statistics: ' + (error.response?.data?.message || error.message));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return null;

  return (
    <div className="row">
      <div className="col-md-3">
        <div className="card mb-4 text-center">
          <div className="card-body">
            <h5 className="card-title">Users</h5>
            <h2>{stats.userCount}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card mb-4 text-center">
          <div className="card-body">
            <h5 className="card-title">Products</h5>
            <h2>{stats.productCount}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card mb-4 text-center">
          <div className="card-body">
            <h5 className="card-title">Orders</h5>
            <h2>{stats.orderCount}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card mb-4 text-center">
          <div className="card-body">
            <h5 className="card-title">Revenue</h5>
            <h2>${stats.totalRevenue.toFixed(2)}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use our api utility
        const response = await api.get('/admin/users');
        setUsers(response.data.users);
      } catch (error) {
        setError('Failed to load users');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleUserAction = async (userId, action) => {
    try {
      setActionLoading(userId);
      
      console.log(`Attempting to ${action} user ${userId}`);
      
      // Use our api utility
      await api.patch(`/admin/user/${userId}`, { action });
      
      if (action === 'ban') {
        // Update user status in the state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'banned' } : user
        ));
      } else if (action === 'unban') {
        // Update user status in the state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: 'active' } : user
        ));
      } else if (action === 'delete') {
        // Remove user from state
        setUsers(users.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error.response ? error.response.data : error);
      setError(`Failed to ${action} user: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card mb-4">
      <div className="card-header">All Users</div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{user.type || 'customer'}</td>
                  <td>
                    <span className={`badge ${user.status === 'banned' ? 'bg-danger' : 'bg-success'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      {user.status === 'banned' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleUserAction(user._id, 'unban')}
                          disabled={actionLoading === user._id || user.type === 'admin'}
                        >
                          {actionLoading === user._id ? 'Processing...' : 'Unban'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleUserAction(user._id, 'ban')}
                          disabled={actionLoading === user._id || user.type === 'admin'}
                        >
                          {actionLoading === user._id ? 'Processing...' : 'Ban'}
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm ms-1"
                        onClick={() => handleUserAction(user._id, 'delete')}
                        disabled={actionLoading === user._id || user.type === 'admin'}
                      >
                        {actionLoading === user._id ? 'Processing...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateStatus, setUpdateStatus] = useState({ id: null, status: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/admin/orders');
        setOrders(response.data.orders);
      } catch (error) {
        setError('Failed to load orders');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId) => {
    try {
      await api.patch(`/admin/order/${orderId}`, { status: updateStatus.status });
      
      // Update the order in the state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: updateStatus.status } 
          : order
      ));
      
      setUpdateStatus({ id: null, status: '' });
    } catch (error) {
      setError('Failed to update order status');
      console.error(error);
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card mb-4">
      <div className="card-header">All Orders</div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userId}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    {updateStatus.id === order._id ? (
                      <select
                        className="form-select"
                        value={updateStatus.status}
                        onChange={(e) => setUpdateStatus({
                          ...updateStatus,
                          status: e.target.value
                        })}
                      >
                        <option value="">Select Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`badge bg-${
                        order.status === 'paid' ? 'success' :
                        order.status === 'pending' ? 'warning' :
                        order.status === 'delivered' ? 'info' : 'danger'
                      }`}>
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    {updateStatus.id === order._id ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate(order._id)}
                        disabled={!updateStatus.status}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setUpdateStatus({
                          id: order._id,
                          status: order.status
                        })}
                      >
                        Change Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/admin/products');
        setProducts(response.data.products);
        // Extract currently featured products
        const featured = response.data.products
          .filter(product => product.isFeatured)
          .map(product => product._id);
        setFeaturedProducts(featured);
      } catch (error) {
        setError('Failed to load products');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleProductEdit = (product) => {
    setEditingProduct({
      ...product,
      price: String(product.price)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: value
    });
  };

  const handleSaveEdit = async () => {
    try {
      setActionLoading(editingProduct._id);
      const response = await api.patch(
        `/admin/product/${editingProduct._id}`,
        editingProduct
      );
      
      // Update product in state
      setProducts(products.map(product => 
        product._id === editingProduct._id ? response.data.product : product
      ));
      
      setEditingProduct(null);
    } catch (error) {
      setError('Failed to save product changes');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setActionLoading(productId);
      await api.delete(`/admin/product/${productId}`);
      
      // Remove product from state
      setProducts(products.filter(product => product._id !== productId));
    } catch (error) {
      setError('Failed to delete product');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeaturedProduct = (productId) => {
    if (featuredProducts.includes(productId)) {
      setFeaturedProducts(featuredProducts.filter(id => id !== productId));
    } else {
      if (featuredProducts.length >= 4) {
        alert("You can only feature up to 4 products. Please remove one first.");
        return;
      }
      setFeaturedProducts([...featuredProducts, productId]);
    }
  };

  const saveFeaturedProducts = async () => {
    try {
      setActionLoading('featured');
      await api.post(
        '/admin/set-featured',
        { productIds: featuredProducts }
      );
      
      // Update products in state to reflect featured status
      setProducts(products.map(product => ({
        ...product,
        isFeatured: featuredProducts.includes(product._id)
      })));
      
      alert('Featured products updated successfully');
    } catch (error) {
      setError('Failed to update featured products');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>All Products</span>
        <div>
          <button 
            className="btn btn-success btn-sm"
            onClick={saveFeaturedProducts}
            disabled={actionLoading === 'featured'}
          >
            {actionLoading === 'featured' ? 'Saving...' : 'Save Featured Products'}
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Location</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.images || "https://via.placeholder.com/50"} 
                      alt={product.name} 
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </td>
                  <td>
                    {editingProduct && editingProduct._id === product._id ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="name"
                        value={editingProduct.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td>
                    {editingProduct && editingProduct._id === product._id ? (
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        name="price"
                        value={editingProduct.price}
                        onChange={handleInputChange}
                      />
                    ) : (
                      `₹${product.price}`
                    )}
                  </td>
                  <td>
                    {editingProduct && editingProduct._id === product._id ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="category"
                        value={editingProduct.category}
                        onChange={handleInputChange}
                      />
                    ) : (
                      product.category
                    )}
                  </td>
                  <td>
                    {editingProduct && editingProduct._id === product._id ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        name="location"
                        value={editingProduct.location}
                        onChange={handleInputChange}
                      />
                    ) : (
                      product.location
                    )}
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={featuredProducts.includes(product._id)}
                      onChange={() => toggleFeaturedProduct(product._id)}
                      className="form-check-input"
                    />
                  </td>
                  <td>
                    {editingProduct && editingProduct._id === product._id ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveEdit}
                        disabled={actionLoading === product._id}
                      >
                        {actionLoading === product._id ? 'Saving...' : 'Save'}
                      </button>
                    ) : (
                      <div className="btn-group">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleProductEdit(product)}
                          disabled={actionLoading === product._id}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-1"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={actionLoading === product._id}
                        >
                          {actionLoading === product._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </li>
      </ul>
      
      {activeTab === 'dashboard' && <DashboardStats />}
      {activeTab === 'users' && <UsersList />}
      {activeTab === 'orders' && <OrdersList />}
      {activeTab === 'products' && <ProductsList />}
    </div>
  );
};

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.type === 'admin') {
          setIsLoggedIn(true);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Error parsing stored user data', e);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);
  
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
  };
  
  return (
    <div className="admin-page">
      {isLoggedIn ? (
        <>
          <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
            <h3 className="m-0">Equiply Admin</h3>
            <div>
              <span className="me-3">Welcome, {user?.name}</span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>
          <AdminDashboard />
        </>
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AdminPage;
