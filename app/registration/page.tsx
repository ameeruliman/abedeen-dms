"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";

interface FormFile {
  id: number;
  title: string;
  description: string;
  file_name: string;
  department: string;
  upload_date: string;
  file_size: number;
}

export default function RegistrationPage() {
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
      const response = await fetch('/api/forms?department=registration');
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
      <style jsx global>{`
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

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; }

        /* Removed page-specific Sidebar overrides to use global responsive Sidebar */
        /* .sidebar { ... } */
        /* .sidebar:hover { ... } */
        /* .sidebar-menu { ... } */

        .top-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--white);
          padding: 30px 40px;
          box-shadow: 0 15px 35px rgba(124, 37, 175, 0.4);
          position: relative;
          z-index: 500;
          overflow: hidden;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 60px 32px; transition: padding-left 0.3s ease; }
        .page-header { text-align: center; margin-bottom: 60px; }
        .page-header h1 { color: var(--primary-dark); font-size: 3rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -1px; }
        .page-header p { color: var(--text-light); font-size: 1.2rem; max-width: 600px; margin: 0 auto 32px; }

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
      {/* <Sidebar /> */}
      {/* <header className="top-header"> ... </header> */}

      <Layout>
        {/* Main Content */}
        <div className="container">
          <div className="page-header">
            <h1>Registration Department</h1>
            <p>Official registration forms & documents — latest first.</p>
          </div>

          <div className="search-controls">
            <div className="search-wrap" role="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.75 18a7.25 7.25 0 1 1 0-14.5 7.25 7.25 0 0 1 0 14.5z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                id="search" 
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button 
                id="gridViewBtn" 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-grip"></i> Grid
              </button>
              <button 
                id="listViewBtn" 
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
              <h3>Loading registration forms...</h3>
              <p>Please wait while we fetch the latest forms for you.</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <h3>No registration forms available</h3>
              <p>If you are an admin, you can upload new forms from the admin panel to make them available for download.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'files-grid' : 'files-list'}>
              {filteredFiles.map((file) => (
                <div key={file.id} className="file-card">
                  {viewMode === 'list' && (
                    <>
                      <div className="file-meta">
                        <span className="dept-badge">Registration</span>
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
                            <a href={`/api/files/${file.file_name}`} className="btn btn-primary" target="_blank">
                              <i className="fas fa-download"></i> Download
                            </a>
                            <a href={`/api/files/${file.file_name}`} className="btn btn-secondary" target="_blank">
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
                        <span className="dept-badge">Registration</span>
                        <span className="file-date">{formatDate(file.upload_date)}</span>
                      </div>
                      <h3>{file.title}</h3>
                      <p>{file.description}</p>
                      <div className="file-footer">
                        <div className="file-info">
                          {formatFileSize(file.file_size)}
                        </div>
                        <div className="file-actions">
                          <a href={`/api/files/${file.file_name}`} className="btn btn-primary" target="_blank">
                            <i className="fas fa-download"></i> Download
                          </a>
                          <a href={`/api/files/${file.file_name}`} className="btn btn-secondary" target="_blank">
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