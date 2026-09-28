import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber } from '@/lib/validation/validators';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fieldId = Number(params.id);
  const field = memoryDb.fields.find(f => f.field_id === fieldId);
  if (!field) {
    return NextResponse.json({ error: 'Field not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    if (body.field_name) field.field_name = body.field_name;
    if (body.area) {
      if (!isPositiveNumber(body.area)) return NextResponse.json({ error: 'Area must be > 0' }, { status: 400 });
      field.area = Number(body.area);
    }
    if (body.soil_type) field.soil_type = body.soil_type;
    if (body.irrigation_type) field.irrigation_type = body.irrigation_type.toUpperCase();

    return NextResponse.json({ success: true, field });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fieldId = Number(params.id);
  const index = memoryDb.fields.findIndex(f => f.field_id === fieldId);
  if (index === -1) {
    return NextResponse.json({ error: 'Field not found' }, { status: 404 });
  }

  // Check if active cycle exists (Demonstrating ON DELETE RESTRICT)
  const activeCycle = memoryDb.crop_cycles.find(c => c.field_id === fieldId && c.status === 'ACTIVE');
  if (activeCycle) {
    return NextResponse.json({
      error: 'Cannot delete field: Active crop cycle is ongoing on this parcel (RESTRICT constraint violation).'
    }, { status: 400 });
  }

  const deleted = memoryDb.fields.splice(index, 1)[0];
  return NextResponse.json({ success: true, message: `Field ${deleted.field_name} deleted.` });
}
