import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/GoogleLoginButton'

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const response = await fetch('https://equiply-jrej.onrender.com/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      
        if (data.user) {
          console.log("userid",JSON.stringify(data.user))
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      
    
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 100);
      
    } catch (error) {
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div>
            <h3 className="text-center text-4xl mb-1">Log in</h3>
            <p className="text-center text-lg mb-8">Don't have an account? <Link to="/Signup" className="text-blue-600 hover:underline">Signup</Link></p>
        </div>
        <div className="flex items-center justify-center px-4">   
            <form className="w-full max-w-2xl p-6 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Email address
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    required 
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  Password
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password" 
                      required 
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
                <label className='flex mt-2'>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <p className='p-2'>Remember me</p>
                </label>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">By creating an account, you agree to the{" "}<a href="#" className="text-blue-600 underline">Terms of use</a>{" "}and{" "}<a href="#" className="text-blue-600 underline">Privacy Policy</a>.</p>
                {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
                <button 
                  type="submit" 
                  disabled={!email || !password || isLoading}
                  className={`mt-4 w-full py-3 font-medium text-sm rounded-full ${
                    email && password && !isLoading 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </button>
              </div>
              
              <div className='text-center'>
                <p className="text-neutral-900 text-base font-medium underline">Forgot Password?</p>
              </div>
              
              <div className="text-center text-sm text-gray-500">OR Continue with</div>
              
              <GoogleLoginButton />
            </form>
        </div>
    </div>
  )
}

export default Login