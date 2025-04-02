import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaGlobe, 
  FaDownload, 
  FaServer, 
  FaFileArchive, 
  FaCheck, 
  FaRocket, 
  FaLaptopCode, 
  FaTelegramPlane 
} from 'react-icons/fa';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-page">
      <section className="hiw-hero">
        <div className="container">
          <h1 className="fade-in">How SiteToZip Works</h1>
          <p className="hiw-subtitle fade-in">
            Our powerful website cloning technology explained
          </p>
        </div>
      </section>
      
      <section className="process-section">
        <div className="container">
          <div className="process-steps">
            <div className="process-step fade-in">
              <div className="step-number">1</div>
              <div className="step-icon">
                <FaGlobe />
              </div>
              <div className="step-content">
                <h3>Enter Website URL</h3>
                <p>
                  Simply enter the URL of the website you want to clone. Our system accepts any public website that doesn't require authentication.
                </p>
              </div>
            </div>
            
            <div className="process-step fade-in">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FaServer />
              </div>
              <div className="step-content">
                <h3>We Crawl the Website</h3>
                <p>
                  Our intelligent crawler visits the website and automatically discovers linked pages, images, stylesheets, and other resources.
                </p>
              </div>
            </div>
            
            <div className="process-step fade-in">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FaFileArchive />
              </div>
              <div className="step-content">
                <h3>Content is Packaged</h3>
                <p>
                  All discovered content is downloaded, processed, and packaged into a neatly organized ZIP file structure that preserves the original website's organization.
                </p>
              </div>
            </div>
            
            <div className="process-step fade-in">
              <div className="step-number">4</div>
              <div className="step-icon">
                <FaDownload />
              </div>
              <div className="step-content">
                <h3>Download Your ZIP</h3>
                <p>
                  Once processing is complete, you'll receive a download link. The ZIP file includes everything needed to browse the website offline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="tech-section">
        <div className="container">
          <h2 className="section-title text-center">Our Technology</h2>
          
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">
                <FaRocket />
              </div>
              <h3>Fast Processing</h3>
              <p>
                Our serverless architecture enables rapid website processing. Most sites are cloned and ready for download in under a minute.
              </p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">
                <FaCheck />
              </div>
              <h3>Complete Content</h3>
              <p>
                We capture HTML, CSS, JavaScript, images, and other resources, preserving the site's appearance and functionality.
              </p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">
                <FaLaptopCode />
              </div>
              <h3>Modern Stack</h3>
              <p>
                Built with React, serverless functions, and cloud storage to ensure reliability and performance.
              </p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">
                <FaTelegramPlane />
              </div>
              <h3>Telegram Integration</h3>
              <p>
                Access our service via Telegram bot for even more convenience. Clone websites on the go.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="usage-section">
        <div className="container">
          <div className="usage-content">
            <div className="usage-info fade-in">
              <h2>Using Your Downloaded Website</h2>
              <p>
                After downloading the ZIP file, simply extract its contents to a folder on your computer. Open the "index.html" file in any web browser to start browsing the website offline.
              </p>
              
              <h3 className="mt-4">Common Use Cases:</h3>
              <ul className="usage-list">
                <li>
                  <span className="check-icon">✓</span>
                  <span>Offline access to important documentation or reference materials</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Downloading tutorials and guides for later use</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Creating local development environments for web design</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Archiving websites for research or preservation</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Saving content before a website redesign or shutdown</span>
                </li>
              </ul>
              
              <div className="mt-5">
                <Link to="/" className="btn btn-primary btn-large btn-with-icon">
                  <FaDownload />
                  <span>Try It Now</span>
                </Link>
              </div>
            </div>
            
            <div className="usage-image slide-in">
              <div className="folder-browser">
                <div className="folder-header">
                  <div className="folder-actions">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="folder-title">example-com.zip (Extracted)</div>
                </div>
                <div className="folder-content">
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon html-icon" />
                    <span>index.html</span>
                  </div>
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon css-icon" />
                    <span>styles.css</span>
                  </div>
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon js-icon" />
                    <span>script.js</span>
                  </div>
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon folder-icon" />
                    <span>images/</span>
                  </div>
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon folder-icon" />
                    <span>pages/</span>
                  </div>
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon html-icon" />
                    <span>about.html</span>
                  </div>
                  <div className="folder-item">
                    <FaFileArchive className="folder-icon html-icon" />
                    <span>contact.html</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Is SiteToZip completely free?</h3>
              <p>
                Yes, SiteToZip is 100% free to use with no hidden charges or premium tiers.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>How many pages can I download?</h3>
              <p>
                Our service currently supports downloading up to 25 pages per website to ensure fast processing. This is sufficient for most small to medium websites.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>Can I download password-protected sites?</h3>
              <p>
                No, our service can only clone publicly accessible web pages. Pages that require login credentials cannot be accessed by our crawler.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>Will the downloaded website work exactly like the original?</h3>
              <p>
                While we capture most static content and basic functionality, some dynamic features that require server-side processing may not work in the offline version.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>How long are download links active?</h3>
              <p>
                Download links remain active for 24 hours. Make sure to download your ZIP file within this timeframe.
              </p>
            </div>
            
            <div className="faq-item">
              <h3>Can I use the Telegram bot instead of the website?</h3>
              <p>
                Yes! Our Telegram bot provides the same functionality. Simply message our bot with the website URL to get started.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;