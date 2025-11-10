"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";

interface FormFile {
  id: number;
  title: string;
  description: string;
  file_name: string;
  department: string;
  upload_date: string;
  file_size: number;
}

export default function FinancePage() {
  const [files, setFiles] = useState<FormFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredFiles, setFilteredFiles] = useState<FormFile[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const filtered = files.filter(file =>
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/forms?department=finance');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <style jsx>{`
        :root {
          --primary: #7c25af;
          --primary-light: #9c47d3;
          --primary-dark: #5c1b84;
          --accent: #f7b731;
          --bg: #f8f9fc;
          --white: #fff;
          --text: #2d3748;
          --text-light: #64748b;
          --shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          --shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
          min-height: 100vh;
        }

        .top-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--white);
          padding: 30px 40px;
          box-shadow: 0 15px 35px rgba(124, 37, 175, 0.4);
          position: relative;
          z-index: 500;
          overflow: hidden;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .logo {
          height: 85px;
          width: 85px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .office-info h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          background: linear-gradient(45deg, #fff, #f0f8ff);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .office-info p {
          font-size: 1rem;
          opacity: 0.95;
          margin: 3px 0;
          color: #e8f4fd;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 35px;
        }

        .contact-info {
          text-align: right;
          font-size: 1rem;
        }

        .contact-info p {
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-end;
          color: #e8f4fd;
          font-weight: 500;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .contact-info i {
          background: var(--white);
          color: var(--primary);
          padding: 8px;
          border-radius: 10px;
          font-size: 14px;
          box-shadow: 0 3px 10px rgba(255, 255, 255, 0.3);
        }

        .back-home-btn {
          padding: 15px 30px;
          background: var(--white);
          color: var(--primary);
          font-weight: 600;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.4s ease;
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .back-home-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 30px rgba(255, 255, 255, 0.4);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 32px;
          transition: padding-left 0.3s ease;
        }

        .page-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .page-header h1 {
          color: var(--primary-dark);
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .page-header p {
          color: var(--text-light);
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto 32px;
        }

        .search-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-wrap {
          display: flex;
          align-items: center;
          background: var(--white);
          padding: 12px 20px;
          border-radius: 50px;
          box-shadow: var(--shadow);
          max-width: 400px;
          flex: 1;
          min-width: 280px;
        }

        .search-wrap input {
          border: 0;
          outline: none;
          padding: 8px 12px;
          width: 100%;
          font-size: 1rem;
          color: var(--text);
          background: transparent;
        }

        .search-wrap svg {
          margin-right: 8px;
          opacity: 0.6;
        }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: var(--white);
          padding: 8px;
          border-radius: 12px;
          box-shadow: var(--shadow);
        }

        .view-btn {
          background: transparent;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-light);
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .view-btn.active {
          background: var(--primary);
          color: var(--white);
          box-shadow: 0 4px 12px rgba(124, 37, 175, 0.3);
        }

        .view-btn:hover:not(.active) {
          background: rgba(124, 37, 175, 0.1);
          color: var(--primary);
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-bottom: 40px;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        .file-card {
          background: var(--white);
          border-radius: 20px;
          box-shadow: var(--shadow);
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(124, 37, 175, 0.1);
        }

        .file-card::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent, rgba(124, 37, 175, 0.05), transparent);
          transform: rotate(45deg);
          transition: all 0.3s ease;
          opacity: 0;
        }

        .file-card:hover::before {
          opacity: 1;
          animation: shimmer 0.6s ease-in-out;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .file-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-hover);
          border-color: rgba(124, 37, 175, 0.2);
        }

        .file-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
        }

        .dept-badge {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 600;
          background: rgba(124, 37, 175, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
        }

        .file-date {
          color: var(--text-light);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .file-card h3 {
          font-size: 1.3rem;
          color: var(--text);
          margin-bottom: 12px;
          font-weight: 600;
          line-height: 1.4;
        }

        .file-card p {
          color: var(--text-light);
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .file-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .file-info {
          font-size: 0.85rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .file-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: var(--primary);
          color: var(--white);
          box-shadow: 0 4px 12px rgba(124, 37, 175, 0.3);
        }

        .btn-primary:hover {
          background: var(--primary-light);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 37, 175, 0.4);
        }

        .btn-secondary {
          background: rgba(124, 37, 175, 0.1);
          color: var(--primary);
        }

        .btn-secondary:hover {
          background: rgba(124, 37, 175, 0.2);
          transform: translateY(-2px);
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          background: var(--white);
          border-radius: 20px;
          box-shadow: var(--shadow);
          color: var(--text-light);
        }

        .empty-state i {
          font-size: 4rem;
          color: var(--primary);
          margin-bottom: 24px;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: var(--text);
          margin-bottom: 12px;
          font-weight: 600;
        }

        .empty-state p {
          font-size: 1rem;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .files-list .file-card {
          padding: 28px 32px;
          display: flex;
          align-items: flex-start;
          gap: 32px;
          margin-bottom: 4px;
        }

        .files-list .file-meta {
          margin-bottom: 0;
          min-width: 200px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .files-list .file-content {
          flex: 1;
          min-width: 0;
        }

        .files-list .file-content h3 {
          margin-bottom: 12px;
          font-size: 1.2rem;
        }

        .files-list .file-content p {
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .files-list .file-footer {
          margin-top: 16px;
          padding-top: 16px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .files-list .file-actions {
          gap: 12px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .search-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-wrap {
            max-width: none;
            min-width: auto;
          }
          
          .view-toggle {
            align-self: center;
          }
          
          .files-list .file-card {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
          
          .file-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .btn {
            justify-content: center;
          }

          .top-header {
            padding: 25px 20px;
          }
          
          .header-container {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .header-left {
            gap: 15px;
          }
          
          .office-info h2 {
            font-size: 1.5rem;
          }
          
          .header-right {
            flex-direction: column;
            gap: 20px;
          }
          
          .contact-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 40px 16px;
          }
          
          .file-card {
            padding: 24px;
          }
          
          .page-header h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      {/* Sidebar */}
      {/* Removed Google Fonts + Font Awesome links */}
      {/* Removed standalone <Sidebar /> */}
      {/* Removed old page-specific <header className="top-header">...</header> */}

      <Layout>
        <div className="container">
          <div className="page-header">
            <h1>Finance Department</h1>
            <p>Official finance forms & documents — latest first.</p>
          </div>

          {/* Existing search, view toggle, loading/empty/list/grid content */}
          <div className="search-controls">
            <div className="search-wrap" role="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.75 18a7.25 7.25 0 1 1 0-14.5 7.25 7.25 0 0 1 0 14.5z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description"
              />
            </div>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-grip"></i> Grid
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i> List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Loading...</h3>
              <p>Please wait while we fetch the finance forms.</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-dollar-sign"></i>
              <h3>No Finance forms available</h3>
              <p>If you are an admin, you can upload new forms from the admin panel to make them available for download.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'files-grid' : 'files-list'}>
              {filteredFiles.map((file) => (
                <div key={file.id} className="file-card">
                  {viewMode === 'list' && (
                    <>
                      <div className="file-meta">
                        <span className="dept-badge">Finance</span>
                        <span className="file-date">{formatDate(file.upload_date)}</span>
                      </div>
                      <div className="file-content">
                        <h3>{file.title}</h3>
                        <p>{file.description}</p>
                        <div className="file-footer">
                          <div className="file-info">
                            {formatFileSize(file.file_size)}
                          </div>
                          <div className="file-actions">
                            <a href={`/uploads/${file.file_name}`} className="btn btn-primary" target="_blank">
                              <i className="fas fa-download"></i> Download
                            </a>
                            <a href={`/uploads/${file.file_name}`} className="btn btn-secondary" target="_blank">
                              <i className="fas fa-eye"></i> View
                            </a>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {viewMode === 'grid' && (
                    <>
                      <div className="file-meta">
                        <span className="dept-badge">Finance</span>
                        <span className="file-date">{formatDate(file.upload_date)}</span>
                      </div>
                      <h3>{file.title}</h3>
                      <p>{file.description}</p>
                      <div className="file-footer">
                        <div className="file-info">
                          {formatFileSize(file.file_size)}
                        </div>
                        <div className="file-actions">
                          <a href={`/uploads/${file.file_name}`} className="btn btn-primary" target="_blank">
                            <i className="fas fa-download"></i> Download
                          </a>
                          <a href={`/uploads/${file.file_name}`} className="btn btn-secondary" target="_blank">
                            <i className="fas fa-eye"></i> View
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}