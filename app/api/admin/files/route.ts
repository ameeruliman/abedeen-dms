import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hr_system_copy",
};

// GET - Fetch files for a department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    console.log("Files API - Department requested:", department);

    if (!department) {
      return NextResponse.json(
        { success: false, error: "Department is required" },
        { status: 400 }
      );
    }

    console.log("Files API - Connecting to database with config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });

    const connection = await mysql.createConnection(dbConfig);

    console.log("Files API - Database connected, executing query");

    const [rows] = await connection.execute(
      "SELECT * FROM forms WHERE department = ? ORDER BY upload_date DESC",
      [department]
    );

    console.log("Files API - Query result:", rows);

    // Filter out files that don't exist physically
    const fs = require('fs');
    const path = require('path');
    
    const existingFiles = (rows as any[]).filter(file => {
      const filePath = path.join(process.cwd(), "public", "uploads", file.file_name);
      const exists = fs.existsSync(filePath);
      if (!exists) {
        console.log(`File not found: ${file.file_name} at ${filePath}`);
      }
      return exists;
    });

    console.log("Files API - Filtered existing files:", existingFiles.length);

    await connection.end();

    return NextResponse.json({
      success: true,
      files: existingFiles,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const department = formData.get("department") as string;

    if (!file || !title || !department) {
      return NextResponse.json(
        { success: false, error: "File, title, and department are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: "Only PDF, DOC, and DOCX files are allowed" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${department}_${timestamp}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);

    // Create uploads directory if it doesn't exist
    try {
      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error("File write error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save file" },
        { status: 500 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "INSERT INTO forms (title, file_name, file_type, description, department, upload_date) VALUES (?, ?, ?, ?, ?, NOW())",
      [title, fileName, fileExtension.substring(1), description || "", department]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

// DELETE - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const { fileId, department } = await request.json();

    if (!fileId || !department) {
      return NextResponse.json(
        { success: false, error: "File ID and department are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Get file info to delete physical file
    const [fileRows] = await connection.execute(
      "SELECT file_name FROM forms WHERE id = ? AND department = ?",
      [fileId, department]
    );

    if ((fileRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: "File not found or access denied" },
        { status: 404 }
      );
    }

    const fileName = (fileRows as any[])[0].file_name;

    // Delete from database
    await connection.execute(
      "DELETE FROM forms WHERE id = ? AND department = ?",
      [fileId, department]
    );

    await connection.end();

    // Delete physical file
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await unlink(filePath);
    } catch (error) {
      console.error("File deletion error:", error);
      // Continue even if file deletion fails
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}