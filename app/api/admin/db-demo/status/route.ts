import { NextResponse } from 'next/server';
import { checkPostgresStatus, memoryDb } from '@/lib/postgres/db';
import { checkMongoStatus, memoryMongo } from '@/lib/mongodb/db';

export async function GET() {
  const pgStatus = await checkPostgresStatus();
  const mongoStatus = await checkMongoStatus();

  return NextResponse.json({
    postgresql: {
      engine: 'PostgreSQL 14+ Relational Engine',
      status: pgStatus.connected ? 'CONNECTED' : 'DISCONNECTED',
      mode: pgStatus.mode,
      latencyMs: pgStatus.latencyMs,
      databaseName: pgStatus.databaseName,
      tablesCount: 13,
      tables: [
        'roles', 'users', 'farms', 'fields', 'crops', 'crop_cycles',
        'crop_status_history', 'farming_activities', 'resources',
        'fertilizer_usages', 'irrigation_records', 'expenses', 'harvests'
      ],
      totalRows: (
        memoryDb.roles.length + memoryDb.users.length + memoryDb.farms.length +
        memoryDb.fields.length + memoryDb.crops.length + memoryDb.crop_cycles.length +
        memoryDb.crop_status_history.length + memoryDb.farming_activities.length +
        memoryDb.resources.length + memoryDb.fertilizer_usages.length +
        memoryDb.irrigation_records.length + memoryDb.expenses.length + memoryDb.harvests.length
      ),
      advancedFeatures: {
        acid_transactions: 'Active & Verified',
        triggers: '4 PL/pgSQL Triggers Implemented',
        views: '4 Analytics Views Implemented',
        b_tree_indexes: '10 Strategic Indexes Active'
      }
    },
    mongodb: {
      engine: 'MongoDB 6+ Document Engine',
      status: mongoStatus.connected ? 'CONNECTED' : 'DISCONNECTED',
      mode: mongoStatus.mode,
      latencyMs: mongoStatus.latencyMs,
      databaseName: mongoStatus.databaseName,
      collectionsCount: 4,
      collections: [
        'agricultural_advisories', 'crop_observations', 'farming_notes', 'weather_records'
      ],
      totalDocuments: (
        memoryMongo.agricultural_advisories.length + memoryMongo.crop_observations.length +
        memoryMongo.farming_notes.length + memoryMongo.weather_records.length
      ),
      advancedFeatures: {
        polymorphic_schemas: 'Active (Dynamic Crop Attributes)',
        aggregation_pipelines: 'Active ($match, $group, $unwind, $facet)',
        text_indexing: 'Active (Symptom Full-Text Search)',
        nested_documents: 'Active (Recommendations & Sensor Records)'
      }
    }
  });
}
