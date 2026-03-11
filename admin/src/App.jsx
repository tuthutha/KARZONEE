import React from 'react'
import Navbar from './components/Navbar'
import AddCar from './components/AddCar'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManageCar from './components/ManageCar';
import Booking from './components/Booking';

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<AddCar />} />
        <Route path="/manage-cars" element={<ManageCar />} />
        <Route path="/bookings" element={<Booking />} />
      </Routes>
    </>
  )
}

export default App