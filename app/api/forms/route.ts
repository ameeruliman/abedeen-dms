import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

interface FormFile extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  file_name: string;
  department: string;
  upload_date: string;
  file_size: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    let sql = "SELECT * FROM forms";
    let params: string[] = [];

    if (department) {
      sql += " WHERE department = ?";
      params.push(department);
    }

    sql += " ORDER BY upload_date DESC";

    const results = await query(sql, params) as FormFile[];
    
    // Filter out files that don't exist physically
    const existingFiles = results.filter(file => {
      const filePath = path.join(process.cwd(), "public", "uploads", file.file_name);
      const exists = fs.existsSync(filePath);
      if (!exists) {
        console.log(`File not found: ${file.file_name} at ${filePath}`);
      }
      return exists;
    });

    console.log(`Forms API - Total files: ${results.length}, Existing files: ${existingFiles.length}`);
    
    return NextResponse.json(existingFiles);
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const department = formData.get('department') as string;
    const file = formData.get('file') as File;

    if (!title || !description || !department || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Here you would handle file upload to your uploads directory
    // For now, we'll just insert the form data
    const filename = file.name;
    const fileSize = file.size;

    const result = await query(
      "INSERT INTO forms (title, description, department, filename, file_size, upload_date) VALUES (?, ?, ?, ?, ?, NOW())",
      [title, description, department, filename, fileSize]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Form uploaded successfully",
      id: (result as any).insertId 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload form", message: error.message },
      { status: 500 }
    );
  }
}