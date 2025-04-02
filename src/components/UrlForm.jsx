import React, { useState } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import '../styles/UrlForm.css';

const UrlForm = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [inputError, setInputError] = useState('');

  const validateUrl = (value) => {
    if (!value.trim()) {
      return 'URL is required';
    }
    
    try {
      const parsedUrl = new URL(value);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return 'URL must start with http:// or https://';
      }
      return '';
    } catch (err) {
      return 'Please enter a valid URL';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errorMessage = validateUrl(url);
    if (errorMessage) {
      setInputError(errorMessage);
      return;
    }
    
    setInputError('');
    onSubmit(url);
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <div className="url-input-wrapper">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (inputError) {
              setInputError('');
            }
          }}
          placeholder="Enter website URL (e.g., https://example.com)"
          className={`url-input ${inputError ? 'has-error' : ''}`}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="btn btn-primary url-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner-icon" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FaDownload />
              <span>Download ZIP</span>
            </>
          )}
        </button>
      </div>
      {inputError && <p className="input-error">{inputError}</p>}
    </form>
  );
};

export default UrlForm;