import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Define visa tasks for each phase
const VISA_TASKS = {
  1: [
    "Document verification completed",
    "Initial application review",
    "Student information validation",
    "Fee payment confirmation",
    "Preliminary approval issued"
  ],
  2: [
    "Embassy appointment scheduled",
    "Required documents submitted",
    "Biometric data collection",
    "Interview preparation completed",
    "Application forwarded to embassy"
  ],
  3: [
    "Embassy processing initiated",
    "Background verification in progress",
    "Medical examination completed",
    "Security clearance obtained",
    "Visa decision pending"
  ],
  4: [
    "Visa approval received",
    "Passport collection scheduled",
    "Travel arrangements confirmed",
    "Pre-departure briefing completed",
    "Done, Dah siap mat, datang jumpa adip"
  ]
};

// POST - Update visa status and tasks (only for visa department)
export async function POST(request: NextRequest) {
  try {
    const { schoolId, personType, stage, department, tasks } = await request.json();
    
    console.log("=== ADMIN VISA UPDATE ===");
    console.log("Received data:", { schoolId, personType, stage, department, tasks });

    // Verify department access
    if (department?.toLowerCase() !== "visa") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Visa department admins can update visa status." },
        { status: 403 }
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      );
    }

    if (!personType || !stage) {
      return NextResponse.json(
        { success: false, error: "Person type and stage are required" },
        { status: 400 }
      );
    }

    // Ensure visa_status table exists
    await query(`
      CREATE TABLE IF NOT EXISTS visa_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id VARCHAR(50) NOT NULL,
        person_type ENUM('student', 'staff') NOT NULL DEFAULT 'student',
        stage INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Check if record exists
    const existingRows = await query(
      "SELECT id FROM visa_status WHERE school_id = ?",
      [schoolId]
    );

    const existed = Array.isArray(existingRows) && existingRows.length > 0;

    let result;
    if (existed) {
      // Update existing record
      result = await query(
        "UPDATE visa_status SET person_type = ?, stage = ?, updated_at = NOW() WHERE school_id = ?",
        [personType, stage, schoolId]
      );
    } else {
      // Insert new record with person type and stage
      result = await query(
        "INSERT INTO visa_status (school_id, person_type, stage) VALUES (?, ?, ?)",
        [schoolId, personType, stage]
      );
    }

    // Create visa_tasks table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS visa_tasks (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        school_id VARCHAR(50) NOT NULL,
        stage INT NOT NULL,
        task_index INT NOT NULL,
        task_description TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_task (school_id, stage, task_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Initialize tasks for all stages if they don't exist
    for (let stageNum = 1; stageNum <= 4; stageNum++) {
        const stageTasks = VISA_TASKS[stageNum as keyof typeof VISA_TASKS] || [];
        for (let taskIndex = 0; taskIndex < stageTasks.length; taskIndex++) {
            await query(`
                INSERT IGNORE INTO visa_tasks (school_id, stage, task_index, task_description)
                VALUES (?, ?, ?, ?)
            `, [schoolId, stageNum, taskIndex, stageTasks[taskIndex]]);
        }
    }

    // Update task completion status if tasks are provided
    if (tasks && Array.isArray(tasks)) {
        for (const task of tasks) {
            const { stage: taskStage, taskIndex, isCompleted } = task;
            await query(`
                UPDATE visa_tasks 
                SET is_completed = ?, completed_at = ${isCompleted ? 'NOW()' : 'NULL'}
                WHERE school_id = ? AND stage = ? AND task_index = ?
            `, [isCompleted, schoolId, taskStage, taskIndex]);
        }
    }

    return NextResponse.json({
      success: true,
      created: !existed,
      updated: existed,
      message: !existed ? "School ID added successfully!" : "Visa record updated successfully!"
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    // Verify this is a visa department admin
    if (department?.toLowerCase() !== "visa") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only Visa department admins can view visa status." },
        { status: 403 }
      );
    }

    const rows = await query(
      "SELECT * FROM visa_status ORDER BY updated_at DESC"
    );

    return NextResponse.json({
      success: true,
      visaStatuses: rows,
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}