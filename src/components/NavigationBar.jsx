import React from 'react';
import '../styles/navigationbar.css';
import { Link } from 'react-router-dom';

const NavigationBar = () => {

  return (
    <header className="navbar">
      <nav className="nav-container">
        {/* Left Side */}
        <div className="nav-left">
          <Link to="/" className="logo">
            <span>TalentFlow</span>
          </Link>
          <div className="desktop-nav">
            <Link to="/">Jobs</Link>
            <Link to="/mycandidate">Candidates</Link>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="nav-right">
          <div className="user-avatar">
            <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=User" alt="User Avatar" />
          </div>
        </div>
      </nav>
    </header>
  );
};


export default NavigationBar