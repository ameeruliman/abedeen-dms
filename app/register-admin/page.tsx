"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  department: string;
}

export default function RegisterAdminPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is superadmin
    const storedUser = localStorage.getItem("admin_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user: AdminUser = JSON.parse(storedUser);
    if (user.department.toLowerCase() !== "superadmin") {
      router.push("/admin-panel");
      return;
    }

    setAdminUser(user);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !department) {
      setError("All fields are required");
      return;
    }

    const allowedDepartments = ['registration', 'visa', 'finance', 'uniform', 'canteen'];
    if (!allowedDepartments.includes(department)) {
      setError("Invalid department selected");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, department }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Admin registered successfully!");
        setUsername("");
        setPassword("");
        setDepartment("");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="content-wrapper">
        <div className="card landscape-login">
          <div className="login-left">
            <div className="logo-container">
              <img src="/logo.png" alt="HR Office Logo" className="logo" />
            </div>
            <h1>Register New Admin</h1>
            <div className="admin-info">
              <p>Logged in as: <strong>{adminUser.username}</strong></p>
              <p>Department: <strong>{adminUser.department}</strong></p>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
          
          <div className="login-right">
            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Admin Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Admin Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Admin Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <img src="/eye-off.svg" alt="Hide password" />
                    ) : (
                      <img src="/eye.svg" alt="Show password" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department (Role)</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">-- Select Department --</option>
                  <option value="registration">Registration</option>
                  <option value="visa">Visa</option>
                  <option value="finance">Finance</option>
                  <option value="uniform">Uniform</option>
                  <option value="canteen">Canteen</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Registering...
                    </>
                  ) : (
                    "Register Admin"
                  )}
                </button>
                
                <Link href="/admin-panel" className="back-home-btn">
                  Back to Admin Panel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}