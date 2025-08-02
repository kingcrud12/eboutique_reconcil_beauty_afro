import React from 'react'
import Appbar from '../components/Appbar';
import { Outlet } from "react-router-dom"; 
import Footer from '../components/Footer';

function Layout() {
  return (
    <div className="w-full overflow-x-hidden">
        <Appbar/>
        <main>
            <Outlet/>
        </main>
        <Footer/>
    </div>
  )
}

export default Layout