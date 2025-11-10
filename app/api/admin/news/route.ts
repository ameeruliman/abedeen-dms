import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hr_system_copy",
};

// GET - Fetch news for a department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    if (!department) {
      return NextResponse.json(
        { success: false, error: "Department is required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT * FROM news WHERE department = ? ORDER BY created_at DESC",
      [department]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      news: rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

// POST - Add news
export async function POST(request: NextRequest) {
  try {
    const { title, content, department } = await request.json();

    if (!title || !content || !department) {
      return NextResponse.json(
        { success: false, error: "Title, content, and department are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "INSERT INTO news (title, content, department, created_at) VALUES (?, ?, ?, NOW())",
      [title, content, department]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "News added successfully",
      newsId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

// DELETE - Delete news
export async function DELETE(request: NextRequest) {
  try {
    const { newsId, department } = await request.json();

    if (!newsId || !department) {
      return NextResponse.json(
        { success: false, error: "News ID and department are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Verify the news belongs to the department
    const [checkRows] = await connection.execute(
      "SELECT id FROM news WHERE id = ? AND department = ?",
      [newsId, department]
    );

    if ((checkRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: "News not found or access denied" },
        { status: 404 }
      );
    }

    const [result] = await connection.execute(
      "DELETE FROM news WHERE id = ? AND department = ?",
      [newsId, department]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}