'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isExpanded && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}
      
      {/* Mobile hamburger button rendered OUTSIDE the transformed sidebar */}
      {isMobile && (
        <div 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Open menu"
          role="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
      
      <div 
        className={`sidebar ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        {/* Desktop hamburger inside the sidebar to keep hover animation */}
        {!isMobile && (
          <div 
            className="sidebar-toggle"
            onClick={toggleSidebar}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <nav className="sidebar-menu">
          <ul>
            <li>
              <Link href="/" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-house"></i>
                </span>
                <span className="text">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/registration" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-user-plus"></i>
                </span>
                <span className="text">Registration</span>
              </Link>
            </li>
            <li>
              <Link href="/visa" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-passport"></i>
                </span>
                <span className="text">Visa</span>
              </Link>
            </li>
            <li>
              <Link href="/finance" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-dollar-sign"></i>
                </span>
                <span className="text">Finance</span>
              </Link>
            </li>
            <li>
              <Link href="/uniform" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-shirt"></i>
                </span>
                <span className="text">Uniform</span>
              </Link>
            </li>
            <li>
              <Link href="/canteen" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-utensils"></i>
                </span>
                <span className="text">Canteen</span>
              </Link>
            </li>
            <li>
              <Link href="/qr-portal" className="flex items-center" onClick={closeSidebar}>
                <span className="icon">
                  <i className="fas fa-qrcode"></i>
                </span>
                <span className="text">QR Portal</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}