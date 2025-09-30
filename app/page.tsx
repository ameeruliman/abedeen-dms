import Link from "next/link";
import Layout from "@/components/Layout";

export default function HomePage() {
  return (
    <Layout>
      {/* Main Content */}
      <div className="container">
        <div className="header">
          <h1>Abedeen HR Office</h1>
          <p>Welcome! Please select a department to view or download files.</p>
        </div>

        <div className="menu-grid">
          <div className="menu-item">
            <Link href="/registration">
              <div className="menu-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h2>Registration</h2>
              <p>Manage employee registration and documentation</p>
            </Link>
          </div>

          <div className="menu-item">
            <Link href="/visa">
              <div className="menu-icon">
                <i className="fas fa-passport"></i>
              </div>
              <h2>Visa</h2>
              <p>Handle visa-related matters and applications</p>
            </Link>
          </div>

          <div className="menu-item">
            <Link href="/finance">
              <div className="menu-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h2>Finance</h2>
              <p>Manage financial operations and records</p>
            </Link>
          </div>

          <div className="menu-item">
            <Link href="/uniform">
              <div className="menu-icon">
                <i className="fas fa-shirt"></i>
              </div>
              <h2>Uniform</h2>
              <p>Manage uniform distribution and orders</p>
            </Link>
          </div>

          <div className="menu-item">
            <Link href="/canteen">
              <div className="menu-icon">
                <i className="fas fa-utensils"></i>
              </div>
              <h2>Canteen</h2>
              <p>Manage canteen services and meal plans</p>
            </Link>
          </div>

          <div className="menu-item">
            <Link href="/qr-portal">
              <div className="menu-icon">
                <i className="fas fa-qrcode"></i>
              </div>
              <h2>QR Portal</h2>
              <p>Access QR code scanning and digital portal services</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}