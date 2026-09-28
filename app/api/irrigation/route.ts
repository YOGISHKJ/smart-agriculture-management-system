import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, IrrigationRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber, isValidDate } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');

  let records = memoryDb.irrigation_records;
  if (cycleId) {
    records = records.filter(r => r.cycle_id === Number(cycleId));
  }

  const enriched = records.map(r => {
    const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === r.cycle_id);
    const crop = cycle ? memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id) : null;
    const field = memoryDb.fields.find(f => f.field_id === r.field_id);
    const farm = field ? memoryDb.farms.find(fm => fm.farm_id === field.farm_id) : null;
    return {
      ...r,
      crop_name: crop?.crop_name || 'Crop',
      field_name: field?.field_name || 'Field',
      farm_name: farm?.farm_name || 'Farm'
    };
  }).sort((a, b) => new Date(b.irrigation_date).getTime() - new Date(a.irrigation_date).getTime());

  // Compute analytics
  const totalWaterLiters = enriched.reduce((s, r) => s + r.water_quantity_liters, 0);
  const totalMinutes = enriched.reduce((s, r) => s + r.duration_minutes, 0);
  const byMethod: Record<string, number> = {};
  enriched.forEach(r => {
    byMethod[r.irrigation_method] = (byMethod[r.irrigation_method] || 0) + r.water_quantity_liters;
  });

  return NextResponse.json({
    irrigation_records: enriched,
    analytics: {
      total_water_liters: totalWaterLiters,
      total_duration_hours: Number((totalMinutes / 60).toFixed(1)),
      by_method: byMethod
    }
  });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cycle_id, field_id, irrigation_date, water_quantity_liters, duration_minutes, irrigation_method, notes } = body;

    if (!cycle_id || !field_id || !irrigation_date || !water_quantity_liters || !duration_minutes || !irrigation_method) {
      return NextResponse.json({ error: 'cycle_id, field_id, irrigation_date, water_quantity_liters, duration_minutes, and irrigation_method are required' }, { status: 400 });
    }

    if (!isPositiveNumber(water_quantity_liters) || !isPositiveNumber(duration_minutes)) {
      return NextResponse.json({ error: 'Water volume and duration must be positive values > 0 (CHECK constraint violation).' }, { status: 400 });
    }

    if (!isValidDate(irrigation_date)) {
      return NextResponse.json({ error: 'Invalid irrigation date' }, { status: 400 });
    }

    const nextId = memoryDb.irrigation_records.length > 0 ? Math.max(...memoryDb.irrigation_records.map(r => r.irrigation_id)) + 1 : 1;
    const newRecord: IrrigationRecord = {
      irrigation_id: nextId,
      cycle_id: Number(cycle_id),
      field_id: Number(field_id),
      irrigation_date,
      water_quantity_liters: Number(water_quantity_liters),
      duration_minutes: Number(duration_minutes),
      irrigation_method: irrigation_method.toUpperCase(),
      notes: notes || 'Standard Irrigation'
    };

    memoryDb.irrigation_records.push(newRecord);

    return NextResponse.json({
      success: true,
      message: 'Irrigation session logged successfully',
      record: newRecord
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
