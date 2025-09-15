import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql, desc } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { questionBanks, questions } from "@shared/schema";
import 'dotenv/config';
import { Pool } from 'pg';

// Database connection config from environment variables
const dbConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5433,
  database: process.env.POSTGRES_DB || 'online_exam'
};

// Construct connection string from config
const connectionString = process.env.DATABASE_URL || 
  `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

// Create database if it doesn't exist
const setupDatabase = async () => {
  try {
    // Connect to postgres database first to create our database if needed
    const tempPool = new Pool({
      ...dbConfig,
      database: 'postgres' // Connect to default postgres database
    });

    try {
      // Check if our database exists
      const result = await tempPool.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [dbConfig.database]
      );

      if (result.rowCount === 0) {
        // Database doesn't exist, create it
        await tempPool.query(`CREATE DATABASE ${dbConfig.database}`);
        console.log(`Database '${dbConfig.database}' created successfully`);
      }
    } finally {
      await tempPool.end();
    }

    // Now connect to our database
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    const pool = new Pool({ connectionString });

    // Test the connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');

    return { client, db, pool };
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

// Export promise of database connection
export const dbPromise = setupDatabase();

// Export individual components
export const db = drizzle(postgres(connectionString, { max: 1 }), { schema });
export const pool = new Pool({ connectionString });