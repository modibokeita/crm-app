import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function Signup() {
  const [userValue, setUserValue] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate()
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setUserValue(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userValue)
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/login')
        setUserValue({ name: '', email: '', password: '' }); // Clear form
      }else if(res.status == 400){
        setMessage(data.message)

      } else {
        setMessage(data.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1>Sign Up</h1>

        {message && <p className="form-message">{message}</p>}

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text"
            id="name"
            name="name"
            value={userValue.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group email">
          <label htmlFor="email">Email</label>
          <input 
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={userValue.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password"
            id="password"
            name="password"
            value={userValue.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign up'}
        </button>

        <p className="message">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
