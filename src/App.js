import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import MiniHomePage from './pages/MiniHomePage';
import './styles/theme.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/mini-home" element={<MiniHomePage />} />
        <Route path="/mini-home/:userId" element={<MiniHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;