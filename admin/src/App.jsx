// import React from 'react'
// import Navbar from './components/Navbar'
// import AddCar from './components/AddCar'
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import ManageCar from './components/ManageCar';
// import Booking from './components/Booking';

// const App = () => {
//   return (
//     <>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={<AddCar />} />
//         <Route path="/manage-cars" element={<ManageCar />} />
//         <Route path="/bookings" element={<Booking />} />
//       </Routes>
//     </>
//   )
// }

// export default App

import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddCar from "./components/AddCar";
import ManageCar from "./components/ManageCar";
import Booking from "./components/Booking";
import AdminLogin from "./components/AdminLogin";
import Statistics from './components/Statistics';

const ADMIN_STORAGE_KEY = "admin_authenticated";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem(ADMIN_STORAGE_KEY) === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem(ADMIN_STORAGE_KEY) === "true";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Navbar />}
      {children}
    </>
  );
};

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <AdminLogin />
            </RedirectIfAuthenticated>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AddCar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-cars"
          element={
            <ProtectedRoute>
              <ManageCar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;