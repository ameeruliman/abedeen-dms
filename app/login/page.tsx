"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";

interface LoginResponse {
  success: boolean;
  error?: string;
  message?: string;
  user?: {
    id: number;
    username: string;
    department: string;
  };
  redirectUrl?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user) {
        // Store user info in localStorage
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        
        // Small delay to ensure localStorage is set
        setTimeout(() => {
          // Redirect based on user department or use provided redirect URL
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
          } else {
            router.push("/admin-panel");
          }
        }, 100);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="content-wrapper">
        <div className="card landscape-login">
          <div className="login-left">
            <div className="logo-container">
              <img src="/logo.png" alt="HR Office Logo" className="logo" />
            </div>
            <h1>Admin Login</h1>
          </div>
          <div className="login-right">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
                
                <Link href="/" className="back-home-btn">
                  Back to Home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}