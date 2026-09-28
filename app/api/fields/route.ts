import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, FieldRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');

  let fields = memoryDb.fields;
  if (farmId) {
    fields = fields.filter(f => f.farm_id === Number(farmId));
  }

  const enriched = fields.map(f => {
    const farm = memoryDb.farms.find(fm => fm.farm_id === f.farm_id);
    const activeCycle = memoryDb.crop_cycles.find(c => c.field_id === f.field_id && c.status === 'ACTIVE');
    const crop = activeCycle ? memoryDb.crops.find(cr => cr.crop_id === activeCycle.crop_id) : null;
    return {
      ...f,
      farm_name: farm?.farm_name || 'Unknown',
      active_cycle: activeCycle ? { ...activeCycle, crop_name: crop?.crop_name } : null
    };
  });

  return NextResponse.json({ fields: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { farm_id, field_name, area, soil_type, irrigation_type } = body;

    if (!farm_id || !field_name || !area || !irrigation_type) {
      return NextResponse.json({ error: 'farm_id, field_name, area, and irrigation_type are required' }, { status: 400 });
    }

    if (!isPositiveNumber(area)) {
      return NextResponse.json({ error: 'Field area must be > 0' }, { status: 400 });
    }

    const farm = memoryDb.farms.find(f => f.farm_id === Number(farm_id));
    if (!farm) {
      return NextResponse.json({ error: 'Associated farm does not exist' }, { status: 404 });
    }

    const validIrrigation = ['DRIP', 'SPRINKLER', 'FLOOD', 'CANAL', 'MANUAL', 'RAINFED'];
    if (!validIrrigation.includes(irrigation_type.toUpperCase())) {
      return NextResponse.json({ error: `Irrigation type must be one of: ${validIrrigation.join(', ')}` }, { status: 400 });
    }

    const nextId = memoryDb.fields.length > 0 ? Math.max(...memoryDb.fields.map(f => f.field_id)) + 1 : 1;
    const newField: FieldRecord = {
      field_id: nextId,
      farm_id: Number(farm_id),
      field_name,
      area: Number(Number(area).toFixed(2)),
      soil_type: soil_type || farm.soil_type,
      irrigation_type: irrigation_type.toUpperCase(),
      created_at: new Date().toISOString()
    };

    memoryDb.fields.push(newField);

    return NextResponse.json({
      success: true,
      message: 'Field created successfully',
      field: newField
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
