import Link from "next/link";

export default function Header() {
  return (
    <header className="top-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <img src="/logo.png" alt="Abedeen HR Office Logo" />
          </div>
          <div className="office-info">
            <h2>Abedeen HR Office</h2>
            <p>Document Management System</p>
            <p>For Staff and Parents</p>
          </div>
        </div>
        <div className="header-right">
          <div className="contact-info">
            <p>
              <i className="fas fa-phone"></i> 03 - 8687 6999
            </p>
            <p>
              <i className="fas fa-envelope"></i> admin@abedeen.edu.my
            </p>
          </div>
          {/* Compact icons for mobile */}
          <div className="contact-icons">
            <a href="tel:03-8687-6999" aria-label="Call">
              <i className="fas fa-phone"></i>
            </a>
            <a href="mailto:admin@abedeen.edu.my" aria-label="Email">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
          <Link href="/login" className="admin-login-btn">
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}