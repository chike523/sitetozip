import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaDownload, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="logo-container">
          <FaDownload className="logo-icon" />
          <span className="logo-text">SiteToZip</span>
        </Link>

        <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/how-it-works" 
                className={location.pathname === '/how-it-works' ? 'active' : ''}
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={location.pathname === '/about' ? 'active' : ''}
              >
                About
              </Link>
            </li>
          </ul>
          <button className="btn btn-primary btn-with-icon desktop-only">
            <FaDownload />
            <span>Try It Now</span>
          </button>
        </nav>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
};

export default Header;