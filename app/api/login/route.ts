import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { query } from "@/lib/db";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hr_system_copy",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Check if user exists
    const [rows] = await connection.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    await connection.end();

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const user = (rows as any[])[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Determine redirect URL based on department
    let redirectUrl = '/admin-panel';

    // Return success with user info (excluding password)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        department: user.department,
      },
      redirectUrl
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

// GET method to check if admin table has any users (for initial setup)
export async function GET() {
  try {
    // Create admin table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const results: any = await query("SELECT COUNT(*) as count FROM admin");
    const hasAdmins = results && results[0] && results[0].count > 0;

    return NextResponse.json({
      success: true,
      hasAdmins
    });

  } catch (error: any) {
    console.error("Check admin API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to check admin status"
      },
      { status: 500 }
    );
  }
}