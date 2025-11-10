import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("school_id");

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    console.log("Searching for school ID:", schoolId);

    // Query the visa_status table with the correct column name
    try {
      const results: any = await query(
        "SELECT * FROM visa_status WHERE school_id = ? LIMIT 1",
        [schoolId]
      );

      console.log("Query results:", results);

      if (results && Array.isArray(results) && results.length > 0) {
        const record = results[0];
        console.log("Found record:", record);
        
        // Get tasks for this school ID
        const tasksResults: any = await query(`
          SELECT stage, task_index, task_description, is_completed, completed_at
          FROM visa_tasks 
          WHERE school_id = ? 
          ORDER BY stage, task_index
        `, [schoolId]);

        const tasksByStage: { [key: number]: any[] } = {};
        if (tasksResults && Array.isArray(tasksResults)) {
          tasksResults.forEach((task: any) => {
            if (!tasksByStage[task.stage]) {
              tasksByStage[task.stage] = [];
            }
            tasksByStage[task.stage].push({
              taskIndex: task.task_index,
              description: task.task_description,
              isCompleted: Boolean(task.is_completed),
              completedAt: task.completed_at
            });
          });
        }

        return NextResponse.json({
          school_id: record.school_id,
          person_type: record.person_type,
          stage: record.stage,
          updated_at: record.updated_at,
          tasks: tasksByStage
        });
      }
    } catch (dbError: any) {
      console.error("Database query failed:", dbError);
      return NextResponse.json(
        { error: "Database error: " + (dbError?.message || "Unknown error") },
        { status: 500 }
      );
    }

    // Return not found if no record
    return NextResponse.json(
      { error: "No record found for this School ID" },
      { status: 404 }
    );

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}