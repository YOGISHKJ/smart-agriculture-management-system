import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber } from '@/lib/validation/validators';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const farmId = Number(params.id);
  const farm = memoryDb.farms.find(f => f.farm_id === farmId);

  if (!farm) {
    return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
  }

  const owner = memoryDb.users.find(u => u.user_id === farm.owner_id);
  const fields = memoryDb.fields.filter(fld => fld.farm_id === farm.farm_id);
  const cycles = memoryDb.crop_cycles.filter(c => fields.some(fld => fld.field_id === c.field_id));
  const expenses = memoryDb.expenses.filter(e => e.farm_id === farm.farm_id);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return NextResponse.json({
    farm: {
      ...farm,
      owner_name: owner?.name || 'Unknown',
      fields,
      cycles,
      expenses,
      totalExpenses
    }
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const farmId = Number(params.id);
  const farm = memoryDb.farms.find(f => f.farm_id === farmId);

  if (!farm) {
    return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
  }

  if (auth.user.roleName !== 'ADMIN' && farm.owner_id !== auth.user.userId) {
    return NextResponse.json({ error: 'Forbidden: You do not own this farm' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (body.farm_name) farm.farm_name = body.farm_name;
    if (body.location) farm.location = body.location;
    if (body.area) {
      if (!isPositiveNumber(body.area)) return NextResponse.json({ error: 'Area must be > 0' }, { status: 400 });
      farm.area = Number(body.area);
    }
    if (body.soil_type) farm.soil_type = body.soil_type;
    if (body.ownership_type) farm.ownership_type = body.ownership_type;
    if (body.status) farm.status = body.status;

    return NextResponse.json({ success: true, farm });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const farmId = Number(params.id);
  const index = memoryDb.farms.findIndex(f => f.farm_id === farmId);

  if (index === -1) {
    return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
  }

  if (auth.user.roleName !== 'ADMIN' && memoryDb.farms[index].owner_id !== auth.user.userId) {
    return NextResponse.json({ error: 'Forbidden: You do not own this farm' }, { status: 403 });
  }

  // Cascading removal simulation: remove fields, cycles, activities, expenses
  const deleted = memoryDb.farms.splice(index, 1)[0];
  const fieldIds = memoryDb.fields.filter(f => f.farm_id === farmId).map(f => f.field_id);
  memoryDb.fields = memoryDb.fields.filter(f => f.farm_id !== farmId);
  memoryDb.crop_cycles = memoryDb.crop_cycles.filter(c => !fieldIds.includes(c.field_id));
  memoryDb.expenses = memoryDb.expenses.filter(e => e.farm_id !== farmId);

  return NextResponse.json({ success: true, message: `Farm ${deleted.farm_name} deleted with cascading cleanup.` });
}
