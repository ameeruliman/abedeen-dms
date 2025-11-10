import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hr_system_copy'
};

async function migrateFileNames() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Get all files from database
    const [rows] = await connection.execute('SELECT id, title, file_name, department FROM forms');
    
    // Get all files from uploads folder
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    const physicalFiles = fs.readdirSync(uploadsPath);
    
    console.log('Database records:', rows.length);
    console.log('Physical files:', physicalFiles.length);
    console.log('\nPhysical files:', physicalFiles);
    
    // Create mapping based on department and title matching
    for (const record of rows) {
      console.log(`\nProcessing: ID ${record.id} - ${record.title} (${record.department})`);
      console.log(`Current file_name: ${record.file_name}`);
      
      // Find matching file based on department
      const matchingFiles = physicalFiles.filter(file => {
        return file.toLowerCase().includes(record.department.toLowerCase()) ||
               file.toLowerCase().includes(record.title.toLowerCase().replace(/\s+/g, ''));
      });
      
      if (matchingFiles.length > 0) {
        const newFileName = matchingFiles[0]; // Take the first match
        console.log(`Found match: ${newFileName}`);
        
        // Update database
        await connection.execute(
          'UPDATE forms SET file_name = ? WHERE id = ?',
          [newFileName, record.id]
        );
        
        console.log(`✅ Updated ID ${record.id}: ${record.file_name} → ${newFileName}`);
      } else {
        console.log(`❌ No match found for: ${record.title}`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

// Run the migration
migrateFileNames();