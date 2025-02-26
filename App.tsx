import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Dashboard } from './src/screens/Dashboard';

import { Home } from './src/screens/Home';



export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>

    </BrowserRouter>

  );

} 
