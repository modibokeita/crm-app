import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
      <>
      <div className='layout-container'>
        <Header />
        <Outlet />
      </div>
    </>
  )
}

export default Layout
