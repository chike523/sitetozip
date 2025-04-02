import React from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaGithub, FaUsers, FaFileCode } from 'react-icons/fa';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <h1 className="fade-in">About SiteToZip</h1>
          <p className="about-subtitle fade-in">
            Download and archive websites with ease.
          </p>
        </div>
      </section>
      
      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-info fade-in">
              <h2>Our Mission</h2>
              <p>
                SiteToZip was created to make website archiving accessible to everyone. 
                Whether you're a developer who needs to work offline, a researcher saving 
                important content, or just someone who wants to keep a local copy of a 
                favorite site, our tool makes it simple.
              </p>
              <p>
                We built SiteToZip to be fast, reliable, and completely free. Our service 
                respects the original website structure while creating clean, organized 
                ZIP archives that you can easily browse offline.
              </p>
              
              <h2 className="mt-5">How It Works</h2>
              <p>
                Our service uses advanced web crawling technology to scan websites and 
                download their content. We process HTML, CSS, JavaScript, images, and 
                other resources, then package everything into a neat ZIP file for download.
              </p>
              <p>
                SiteToZip is built with modern technologies including React for the 
                frontend and serverless functions for the backend processing. All 
                files are stored temporarily on Cloudinary's secure platform.
              </p>
              
              <div className="cta-container mt-4">
                <Link to="/" className="btn btn-primary btn-with-icon">
                  <FaDownload />
                  <span>Try SiteToZip Now</span>
                </Link>
              </div>
            </div>
            
            <div className="about-stats slide-in">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaDownload />
                </div>
                <div className="stat-number">10k+</div>
                <div className="stat-label">Downloads</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-number">5k+</div>
                <div className="stat-label">Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FaFileCode />
                </div>
                <div className="stat-number">50M+</div>
                <div className="stat-label">Files Processed</div>
              </div>
              
              <div className="about-image">
                <img src="/images/about-illustration.svg" alt="Website archiving illustration" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="team-section">
        <div className="container">
          <h2 className="section-title text-center">Our Team</h2>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <div className="avatar-placeholder">JD</div>
              </div>
              <h3>John Doe</h3>
              <p className="member-role">Founder & Developer</p>
              <p className="member-bio">
                Full-stack developer with a passion for web technologies and open-source projects.
              </p>
              <div className="member-social">
                <a href="#github" aria-label="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-avatar">
                <div className="avatar-placeholder">JS</div>
              </div>
              <h3>Jane Smith</h3>
              <p className="member-role">UX Designer</p>
              <p className="member-bio">
                Designer focused on creating beautiful, intuitive user experiences.
              </p>
              <div className="member-social">
                <a href="#github" aria-label="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-avatar">
                <div className="avatar-placeholder">MW</div>
              </div>
              <h3>Mike Wilson</h3>
              <p className="member-role">Backend Developer</p>
              <p className="member-bio">
                Serverless architecture specialist and performance optimization expert.
              </p>
              <div className="member-social">
                <a href="#github" aria-label="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>