import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Hamburger Menu Icon */}
      <div className="sidebar-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className="sidebar-menu">
        <ul>
          <li>
            <Link href="/" className="flex items-center">
              <span className="icon">
                <i className="fas fa-house"></i>
              </span>
              <span className="text">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/registration" className="flex items-center">
              <span className="icon">
                <i className="fas fa-user-plus"></i>
              </span>
              <span className="text">Registration</span>
            </Link>
          </li>
          <li>
            <Link href="/visa" className="flex items-center">
              <span className="icon">
                <i className="fas fa-passport"></i>
              </span>
              <span className="text">Visa</span>
            </Link>
          </li>
          <li>
            <Link href="/finance" className="flex items-center">
              <span className="icon">
                <i className="fas fa-dollar-sign"></i>
              </span>
              <span className="text">Finance</span>
            </Link>
          </li>
          <li>
            <Link href="/uniform" className="flex items-center">
              <span className="icon">
                <i className="fas fa-shirt"></i>
              </span>
              <span className="text">Uniform</span>
            </Link>
          </li>
          <li>
            <Link href="/canteen" className="flex items-center">
              <span className="icon">
                <i className="fas fa-utensils"></i>
              </span>
              <span className="text">Canteen</span>
            </Link>
          </li>
          <li>
            <Link href="/qr-portal" className="flex items-center">
              <span className="icon">
                <i className="fas fa-qrcode"></i>
              </span>
              <span className="text">QR Portal</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}