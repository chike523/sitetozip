import React from 'react';
import { FaDownload, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/DownloadSection.css';

const DownloadSection = ({ downloadUrl }) => {
  return (
    <div className="download-section fade-in">
      <div className="success-icon">
        <FaCheckCircle />
      </div>
      <h3>Website Successfully Cloned!</h3>
      <p>Your website has been successfully cloned and is ready for download.</p>
      
      <a 
        href={downloadUrl} 
        className="btn btn-primary btn-large btn-with-icon download-btn pulse"
        download
      >
        <FaDownload />
        <span>Download ZIP Now</span>
      </a>
      
      <div className="download-notes">
        <div className="note-item">
          <FaExclamationTriangle className="note-icon" />
          <p>Your download link will expire in 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;