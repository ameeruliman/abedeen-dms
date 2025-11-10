import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Create news table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        department VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Fetch active news grouped by department
    const results: any = await query(
      "SELECT * FROM news WHERE is_active = 1 ORDER BY department, updated_at DESC"
    );

    if (results && Array.isArray(results)) {
      return NextResponse.json({
        success: true,
        news: results
      });
    }

    return NextResponse.json({
      success: true,
      news: []
    });

  } catch (error: any) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { department, title, content } = await request.json();

    if (!department || !title || !content) {
      return NextResponse.json(
        { error: "Department, title, and content are required" },
        { status: 400 }
      );
    }

    const result: any = await query(
      "INSERT INTO news (department, title, content) VALUES (?, ?, ?)",
      [department, title, content]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: "News created successfully"
    });

  } catch (error: any) {
    console.error("Create news error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create news: " + (error?.message || "Unknown error") 
      },
      { status: 500 }
    );
  }
}