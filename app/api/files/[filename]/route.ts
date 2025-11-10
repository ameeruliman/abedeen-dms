import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    console.log("Requested filename:", filename);
    
    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    console.log("File path:", filePath);

    // Check if file exists
    if (!existsSync(filePath)) {
      console.log("File not found at path:", filePath);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    console.log("File found, reading...");
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Get file extension to determine content type
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    
    switch (fileExtension) {
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".doc":
        contentType = "application/msword";
        break;
      case ".docx":
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
    }

    console.log("Serving file with content type:", contentType);
    // Return the file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}