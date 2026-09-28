/**
 * Database Seeder CLI Script
 * Run with: node scripts/seed-db.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const { sampleAdvisories, sampleObservations, sampleFarmingNotes, sampleWeatherRecords } = require('../database/mongodb/seed.js');

async function seedDatabases() {
  console.log('====================================================');
  console.log('🌱 AgriPulse DBMS Level 3 - Database Seeder');
  console.log('====================================================');

  // 1. Seed PostgreSQL if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    console.log('\n[1/2] Connecting to PostgreSQL Database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
      const schemaSql = fs.readFileSync(path.join(__dirname, '../database/postgresql/schema.sql'), 'utf-8');
      const triggersSql = fs.readFileSync(path.join(__dirname, '../database/postgresql/triggers.sql'), 'utf-8');
      const viewsSql = fs.readFileSync(path.join(__dirname, '../database/postgresql/views.sql'), 'utf-8');
      const seedSql = fs.readFileSync(path.join(__dirname, '../database/postgresql/seed.sql'), 'utf-8');

      console.log(' -> Executing PostgreSQL Schema DDL...');
      await pool.query(schemaSql);

      console.log(' -> Executing Triggers & Stored Procedures...');
      await pool.query(triggersSql);

      console.log(' -> Executing Analytical Views...');
      await pool.query(viewsSql);

      console.log(' -> Executing Seed Dataset (Farms, Crops, Activities, Harvests)...');
      await pool.query(seedSql);

      console.log('✅ PostgreSQL Schema, Triggers, Views & Seed data applied successfully!');
    } catch (err) {
      console.error('❌ PostgreSQL Seeding Error:', err.message);
    } finally {
      await pool.end();
    }
  } else {
    console.log('\n[1/2] DATABASE_URL not set in environment. PostgreSQL seeding skipped.');
  }

  // 2. Seed MongoDB if MONGODB_URI is available
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri_management_nosql';
  const mongoDbName = process.env.MONGODB_DB_NAME || 'agri_management_nosql';
  console.log('\n[2/2] Connecting to MongoDB Document Store...');

  try {
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
    const db = client.db(mongoDbName);

    console.log(' -> Seeding agricultural_advisories...');
    await db.collection('agricultural_advisories').deleteMany({});
    await db.collection('agricultural_advisories').insertMany(sampleAdvisories);

    console.log(' -> Seeding crop_observations...');
    await db.collection('crop_observations').deleteMany({});
    await db.collection('crop_observations').insertMany(sampleObservations);

    console.log(' -> Seeding farming_notes...');
    await db.collection('farming_notes').deleteMany({});
    await db.collection('farming_notes').insertMany(sampleFarmingNotes);

    console.log(' -> Seeding weather_records...');
    await db.collection('weather_records').deleteMany({});
    await db.collection('weather_records').insertMany(sampleWeatherRecords);

    console.log('✅ MongoDB Collections seeded successfully!');
    await client.close();
  } catch (err) {
    console.warn('ℹ️ MongoDB Seeding Notice (Local fallback active):', err.message);
  }

  console.log('\n====================================================');
  console.log('🎉 Seeding Routine Complete! Start the server with: npm run dev');
  console.log('====================================================\n');
}

seedDatabases();
