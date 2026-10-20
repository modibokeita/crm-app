
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MenuContext } from '../components/DashboardLoyout';
import {
  MdDashboard,
  MdPeople,
  MdPersonAdd,
  MdEventNote,
  MdEventAvailable,
  MdLogout
} from 'react-icons/md';

export default function DashboardSideBar() {

    const {show} = React.useContext(MenuContext)

    let showMenue = show ? "show" : ''
  return (
    <>
      <div className={`admin-side-bar ${showMenue}`}>
        <NavLink to="." end className="dashboard-icons">
          <MdDashboard />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="clients" className="dashboard-icons">
          <MdPeople />
          <span>Clients List</span>
        </NavLink>

        <NavLink to="newClient" className="dashboard-icons">
          <MdPersonAdd />
          <span>New Client</span>
        </NavLink>

        <NavLink to="rdv" className="dashboard-icons">
          <MdEventNote />
          <span>RDV List</span>
        </NavLink>

        <NavLink to="newRdv" className="dashboard-icons">
          <MdEventAvailable />
          <span>New RDV</span>
        </NavLink>

        <NavLink to="/" className="dashboard-icons">
          <MdLogout />
          <span>Logout</span>
        </NavLink>
      </div>

    </>
  );
}
