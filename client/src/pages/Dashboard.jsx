import React from 'react'
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
export default function Dashboard() {

const [user, setUser] = useState(null)
const [clients, setClients] = useState([])
const [rdv, setRdv] = useState([])
const [error, setError] = useState("")
const [looading, setLoading] = useState(true)
useEffect(() => {
     const storedUser = localStorage.getItem("user")

     if (setUser){
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("user")
      }
     }
     const getClientCount = async () => {
      try {
        
          const res = await fetch("http://localhost:3000/api/clients/count")
          if (!res.ok){
            throw Error("failed to fetch clients")
          }

          const data = await res.json()
          setClients(data)

      } catch (error) {
        setError(error.message)
      }finally{
        setLoading(false)
      }

     }
      getClientCount()

         const getRdvCount = async () => {
      try {
        
          const res = await fetch("http://localhost:3000/api/rdv/count")
          if (!res.ok){
            throw Error("failed to fetch rdv")
          }

          const data = await res.json()
          setRdv(data)

      } catch (error) {
        setError(error.message)
      }finally{
        setLoading(false)
      }

     }
      getRdvCount()
}, [])




if(!user){
  return <p>Please Log in to continue</p>
}
if(error){
  return <p>{error.message}</p>
}
if (looading){
  return <p>Loading...</p>
}
    return (
    <div className="dashboard-container">
      <h1>Bienvenue {user.name}</h1>
      <div className="inner-container">
        <div className="client">
          <NavLink to="/dashboard/clients" className="dashboard-links">
            <h2>Total clients</h2>
            {clients.totalClients}

          </NavLink>
        </div>
        <div className="dashboard-rdv">
          <NavLink to="/dashboard/rdv" className="dashboard-links">
             <h2>Total RDV</h2>
            {rdv.totalRdv}

          </NavLink>
        </div>
    
      </div>
    </div>
  );
}
