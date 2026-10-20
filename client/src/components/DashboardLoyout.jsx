import React from 'react'
import DashboardSideBar from "../pages/DashboardSideBar"
import Header from './Header'
import { Outlet } from 'react-router-dom'

export const MenuContext = React.createContext()

function DashboardLayout() {
const [show, setShow] = React.useState(true)

const showMenu = () => {

    setShow(prevMenu => !prevMenu)
}
  return (
    <MenuContext.Provider value={{show, showMenu}}>
        <Header />
        <DashboardSideBar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </MenuContext.Provider>
  )
}

export default DashboardLayout