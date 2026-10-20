import React from 'react'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'
function NotFound() {
  return (
    <div className='not-found'> 
    <Header />
      <h1>Pages not found</h1>
      <Outlet />
    </div>
  )
}

export default NotFound
