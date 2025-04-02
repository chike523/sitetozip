import React, { useState } from 'react';
import { FaDownload, FaGlobe, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import UrlForm from '../components/UrlForm';
import DownloadSection from '../components/DownloadSection';
import '../styles/Home.css';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the serverless function to clone the website
      const response = await fetch('/.netlify/functions/clone-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clone website: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDownloadUrl(data.downloadUrl);
    } catch (err) {
      console.error('Error cloning website:', err);
      setError(err.message || 'Failed to clone the website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="fade-in">
              Download Any Website <span className="gradient-text">as a ZIP</span>
            </h1>
            <p className="hero-subtitle fade-in">
              Easily capture entire websites for offline access, backups, or development.
              Just enter a URL and we'll do the rest.
            </p>
            
            <div className="url-form-container fade-in">
              <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            
            {error && (
              <div className="error-message fade-in">
                <p>{error}</p>
              </div>
            )}
            
            {downloadUrl && !isLoading && (
              <DownloadSection downloadUrl={downloadUrl} />
            )}
            
            {isLoading && (
              <div className="loading-container fade-in">
                <FaSpinner className="spinner-icon" />
                <p>Cloning website... This may take a few moments</p>
              </div>
            )}
          </div>
          
          <div className="hero-image slide-in">
            <div className="browser-mockup">
              <div className="browser-header">
                <div className="browser-actions">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="browser-address-bar">
                  <FaGlobe className="globe-icon" />
                  <span>https://example.com</span>
                </div>
              </div>
              <div className="browser-content">
                <div className="mockup-element mockup-header"></div>
                <div className="mockup-element mockup-nav"></div>
                <div className="mockup-container">
                  <div className="mockup-element mockup-main"></div>
                  <div className="mockup-element mockup-side"></div>
                </div>
                <div className="mockup-element mockup-footer"></div>
                
                <div className="zip-file pulse">
                  <FaDownload className="zip-icon" />
                  <span>.ZIP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features">
        <div className="container">
          <h2 className="section-title text-center">Why use SiteToZip?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaDownload />
              </div>
              <h3>Easy Downloads</h3>
              <p>Download entire websites with just one click. No technical knowledge required.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaGlobe />
              </div>
              <h3>Complete Archives</h3>
              <p>Captures HTML, CSS, JavaScript, images, and more for a complete offline experience.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaCheckCircle />
              </div>
              <h3>100% Free</h3>
              <p>Our service is completely free with no hidden costs or limits on downloads.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;