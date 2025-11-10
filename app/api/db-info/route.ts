import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, OkPacket } from 'mysql2';

export async function GET() {
  try {
    // First, test the connection and create database if it doesn't exist
    try {
      await db.query("CREATE DATABASE IF NOT EXISTS hr_system");
      await db.query("USE hr_system");
      console.log("Database connection successful and hr_system database ready");
    } catch (connError: any) {
      return NextResponse.json({
        error: "Database connection failed",
        message: connError.message,
        code: connError.code,
        details: "Make sure MySQL is running and credentials are correct"
      }, { status: 500 });
    }
    
    // Get all tables in the database
    const [tables] = await db.query<RowDataPacket[]>("SHOW TABLES");
    
    // If no tables, create the forms table and return structure
    if (!tables || tables.length === 0) {
      // Create forms table for your DMS
      await db.query(`
        CREATE TABLE IF NOT EXISTS forms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          filename VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          file_size BIGINT DEFAULT 0,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_department (department),
          INDEX idx_upload_date (upload_date)
        )
      `);
      
      // Insert some sample data for registration department
      await db.query(`
        INSERT IGNORE INTO forms (title, description, filename, department, file_size, upload_date) VALUES
        ('Student Registration Form 2024', 'Complete registration form for new students enrolling in 2024 academic year', 'student_registration_2024.pdf', 'registration', 245760, '2024-01-15 10:30:00'),
        ('Parent Information Form', 'Essential information form for parents and guardians', 'parent_info_form.pdf', 'registration', 189440, '2024-01-10 14:20:00'),
        ('Medical Information Form', 'Medical history and health information form for students', 'medical_info_form.pdf', 'registration', 156672, '2024-01-08 09:15:00'),
        ('Emergency Contact Form', 'Emergency contact details and authorization form', 'emergency_contact_form.pdf', 'registration', 134144, '2024-01-05 16:45:00')
      `);

      // Get tables again after creation
      const [newTables] = await db.query<RowDataPacket[]>("SHOW TABLES");
      const dbStructure: Record<string, any> = {};
      
      for (const tableObj of newTables) {
        const tableName = Object.values(tableObj)[0] as string;
        const [columns] = await db.query<RowDataPacket[]>(`DESCRIBE ${tableName}`);
        dbStructure[tableName] = columns;
      }

      return NextResponse.json({
        database: "hr_system_copy",
        message: "Database and forms table created successfully with sample data!",
        tables: dbStructure
      });
    }
    
    // Create an object to store table structures
    const dbStructure: Record<string, any> = {};
    
    // For each table, get its structure
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0] as string;
      const [columns] = await db.query<RowDataPacket[]>(`DESCRIBE ${tableName}`);
      dbStructure[tableName] = columns;
    }
    
    return NextResponse.json({ 
      database: "hr_system_copy",
      tables: dbStructure 
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({
      error: "Failed to fetch database structure",
      message: error.message || "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}