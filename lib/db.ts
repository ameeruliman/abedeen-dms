import mysql, { RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hr_system_copy',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql: string, values: any[] = []): Promise<RowDataPacket[]> {
  const [results] = await pool.execute(sql, values);
  return results as RowDataPacket[];
}

export default pool;