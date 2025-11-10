import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, department } = body;

    if (!username || !password || !department) {
      return NextResponse.json(
        { 
          success: false,
          error: "Username, password, and department are required" 
        },
        { status: 400 }
      );
    }

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

    // Check if username already exists
    const existingUser: any = await query(
      "SELECT id FROM admin WHERE username = ?",
      [username]
    );

    if (existingUser && Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Username already exists" 
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new admin
    const result: any = await query(
      "INSERT INTO admin (username, password, department) VALUES (?, ?, ?)",
      [username, hashedPassword, department]
    );

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      adminId: result.insertId
    });

  } catch (error: any) {
    console.error("Create admin API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create admin",
        message: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}