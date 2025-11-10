"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id: number;
  department: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface NewsResponse {
  success: boolean;
  news: NewsItem[];
  error?: string;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const departments = ['registration', 'visa', 'finance', 'uniform', 'canteen'];
  const departmentIcons: { [key: string]: string } = {
    'registration': 'fas fa-user-plus',
    'visa': 'fas fa-passport', 
    'finance': 'fas fa-dollar-sign',
    'uniform': 'fas fa-shirt',
    'canteen': 'fas fa-utensils'
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      const data: NewsResponse = await response.json();
      
      if (data.success) {
        setNews(data.news);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupNewsByDepartment = () => {
    const grouped: { [key: string]: NewsItem[] } = {};
    
    departments.forEach(dept => {
      grouped[dept] = news.filter(item => item.department === dept);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="news-section">
        <div className="news-header">
          <h2><i className="fas fa-newspaper"></i> Latest News & Announcements</h2>
        </div>
        <div className="news-loading-state">
          <div className="loading-content">
            <div className="loading-animation">
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
            </div>
            <p>Loading latest announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-section">
        <div className="news-header">
          <h2><i className="fas fa-newspaper"></i> Latest News & Announcements</h2>
        </div>
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      </div>
    );
  }

  const groupedNews = groupNewsByDepartment();
  const hasNews = news.length > 0;

  return (
    <div className="news-section">
      <div className="news-header">
        <h2><i className="fas fa-newspaper"></i> Latest News & Announcements</h2>
      </div>
      <div className="news-container">
        {!hasNews ? (
          <div className="no-news">
            <i className="fas fa-info-circle"></i> No announcements at this time.
          </div>
        ) : (
          departments.map(dept => {
            const deptNews = groupedNews[dept];
            if (!deptNews || deptNews.length === 0) return null;

            const icon = departmentIcons[dept] || 'fas fa-building';
            
            return (
              <div key={dept} className="department-news">
                <h3 className="dept-title">
                  <i className={icon}></i> {dept.charAt(0).toUpperCase() + dept.slice(1)} Department
                </h3>
                
                {deptNews.map(item => (
                  <div key={item.id} className="news-item">
                    <h4>{item.title}</h4>
                    <p>{item.content.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < item.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}</p>
                    <span className="news-date">
                      <i className="fas fa-clock"></i> {formatDate(item.updated_at)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}