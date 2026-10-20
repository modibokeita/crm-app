import React from 'react'
import { Link} from 'react-router-dom'
import { IoMenu } from "react-icons/io5";
import { MenuContext } from './DashboardLoyout';

function Header() {
    const context  = React.useContext(MenuContext)
     const showMenu = context?.showMenu;
  return (
    <header className="header-container">
      {showMenu && (
        <IoMenu
          onClick={showMenu}
          className="menu"
          role="button"
          aria-label="Toggle navigation menu"
        />
      )}

      <h1>Système de gestion des clients</h1>
    </header>

  )
}

export default Header
