import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '../config';

async function initDatabase() {
  console.log('🔄 Initializing AgriPulse PostgreSQL Database...');
  
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
    console.error('❌ Could not locate schema.sql or seed.sql in the database folder.');
    process.exit(1);
  }

  // 1. Ensure agripulse_db database exists by connecting to default postgres database
  try {
    const defaultUrl = config.databaseUrl.replace(/\/agripulse_db(\?.*)?$/, '/postgres$1');
    const rootPool = new Pool({ connectionString: defaultUrl });
    const checkDb = await rootPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'agripulse_db'"
    );
    if (checkDb.rowCount === 0) {
      console.log('📦 Database "agripulse_db" does not exist. Creating it now...');
      await rootPool.query('CREATE DATABASE agripulse_db');
      console.log('✅ Database "agripulse_db" created successfully.');
    }
    await rootPool.end();
  } catch (err: any) {
    console.log('ℹ️  Database existence check skipped/passed:', err.message);
  }

  // 2. Connect to agripulse_db to execute schema & seed
  const targetPool = new Pool({ connectionString: config.databaseUrl });
  const client = await targetPool.connect();

  try {
    console.log('📄 Executing database/schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema tables created successfully (users, fields, crops, water_usage, fertilizer_usage).');

    console.log('🌱 Executing database/seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('✅ Demo seed data inserted successfully!');

    // Verify
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const fieldsCount = await client.query('SELECT COUNT(*) FROM fields');
    const cropsCount = await client.query('SELECT COUNT(*) FROM crops');
    const waterCount = await client.query('SELECT COUNT(*) FROM water_usage');
    const fertCount = await client.query('SELECT COUNT(*) FROM fertilizer_usage');

    console.log('==============================================');
    console.log('🎉 Database Initialized & Verified:');
    console.log(`   - Users: ${usersCount.rows[0].count}`);
    console.log(`   - Fields: ${fieldsCount.rows[0].count}`);
    console.log(`   - Crops: ${cropsCount.rows[0].count}`);
    console.log(`   - Water Logs: ${waterCount.rows[0].count}`);
    console.log(`   - Fertilizer Logs: ${fertCount.rows[0].count}`);
    console.log('==============================================');
    console.log('Demo Logins:');
    console.log('   Farmer: farmer@agripulse.com / Farmer@123');
    console.log('   Admin:  admin@agripulse.com  / Admin@123');
    console.log('==============================================');
  } catch (err: any) {
    console.error('❌ Database initialization error:', err.message);
  } finally {
    client.release();
    await targetPool.end();
  }
}

initDatabase();
