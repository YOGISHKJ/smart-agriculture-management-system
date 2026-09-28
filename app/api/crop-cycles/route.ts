import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, CropCycleRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { areDatesOrdered, isValidDate } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const fieldId = searchParams.get('fieldId');

  let cycles = memoryDb.crop_cycles;
  if (status) cycles = cycles.filter(c => c.status === status);
  if (fieldId) cycles = cycles.filter(c => c.field_id === Number(fieldId));

  const enriched = cycles.map(c => {
    const field = memoryDb.fields.find(f => f.field_id === c.field_id);
    const farm = field ? memoryDb.farms.find(fm => fm.farm_id === field.farm_id) : null;
    const crop = memoryDb.crops.find(cr => cr.crop_id === c.crop_id);
    const activities = memoryDb.farming_activities.filter(a => a.cycle_id === c.cycle_id);
    const irrigations = memoryDb.irrigation_records.filter(ir => ir.cycle_id === c.cycle_id);
    const fertilizers = memoryDb.fertilizer_usages.filter(fu => fu.cycle_id === c.cycle_id);
    const harvest = memoryDb.harvests.find(h => h.cycle_id === c.cycle_id);
    const cycleExpenses = memoryDb.expenses.filter(e => e.cycle_id === c.cycle_id);
    const totalExpenses = cycleExpenses.reduce((s, e) => s + e.amount, 0);

    return {
      ...c,
      crop_name: crop?.crop_name || 'Unknown',
      crop_category: crop?.category || 'General',
      field_name: field?.field_name || 'Unknown',
      farm_id: farm?.farm_id,
      farm_name: farm?.farm_name || 'Unknown',
      activities_count: activities.length,
      water_consumed_liters: irrigations.reduce((s, i) => s + i.water_quantity_liters, 0),
      fertilizer_applied_units: fertilizers.reduce((s, f) => s + f.quantity_applied, 0),
      total_cycle_expenses: totalExpenses,
      harvest: harvest || null
    };
  });

  return NextResponse.json({ cycles: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { field_id, crop_id, sowing_date, expected_harvest_date, target_yield_kg, notes, status = 'ACTIVE' } = body;

    if (!field_id || !crop_id || !sowing_date || !expected_harvest_date) {
      return NextResponse.json({ error: 'field_id, crop_id, sowing_date, and expected_harvest_date are required' }, { status: 400 });
    }

    if (!isValidDate(sowing_date) || !isValidDate(expected_harvest_date)) {
      return NextResponse.json({ error: 'Invalid calendar date format' }, { status: 400 });
    }

    if (!areDatesOrdered(sowing_date, expected_harvest_date)) {
      return NextResponse.json({ error: 'Expected harvest date must be after or on sowing date (CHECK constraint violation).' }, { status: 400 });
    }

    const field = memoryDb.fields.find(f => f.field_id === Number(field_id));
    if (!field) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

    const crop = memoryDb.crops.find(c => c.crop_id === Number(crop_id));
    if (!crop) return NextResponse.json({ error: 'Crop variety not found' }, { status: 404 });

    const nextId = memoryDb.crop_cycles.length > 0 ? Math.max(...memoryDb.crop_cycles.map(c => c.cycle_id)) + 1 : 1;
    const newCycle: CropCycleRecord = {
      cycle_id: nextId,
      field_id: Number(field_id),
      crop_id: Number(crop_id),
      sowing_date,
      expected_harvest_date,
      actual_harvest_date: null,
      status,
      target_yield_kg: target_yield_kg ? Number(target_yield_kg) : 0,
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    memoryDb.crop_cycles.push(newCycle);

    // Automatic trigger simulation: Log status history
    memoryDb.crop_status_history.push({
      history_id: memoryDb.crop_status_history.length + 1,
      cycle_id: nextId,
      previous_status: null,
      new_status: status,
      changed_at: new Date().toISOString(),
      remarks: 'Initial cycle creation'
    });

    return NextResponse.json({
      success: true,
      message: 'Crop cycle scheduled successfully',
      cycle: newCycle
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
