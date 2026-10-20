
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Layout from './components/Layout';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLoyout';
import Dashboard from './pages/Dashboard';
import ListClient from './pages/clients/ListClient';
import NotFound from './pages/NotFound';
import NewClient from './pages/clients/NewClient';
import DetailsClient from './pages/clients/DetailsClient';
import NewRdv from './pages/NewRdv';
import RdvList from './pages/RdvList';
import DetailsRdv from './pages/detailsRdv'
function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
        <Route path='/dashboard' element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path='clients' element={<ListClient />} />
            <Route path='clients/:id' element={<DetailsClient />} />
            <Route path='newClient' element={<NewClient />} />
            <Route path='newRdv' element={<NewRdv />} />
            <Route path='rdv' element={<RdvList />} />
            <Route path='rdv/:id' element={<DetailsRdv />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
 

export default App
