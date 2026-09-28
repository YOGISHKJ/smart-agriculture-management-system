import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, recordFertilizerUsageTransaction } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber, isValidDate } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');

  let usages = memoryDb.fertilizer_usages;
  if (cycleId) {
    usages = usages.filter(u => u.cycle_id === Number(cycleId));
  }

  const enriched = usages.map(u => {
    const res = memoryDb.resources.find(r => r.resource_id === u.resource_id);
    const field = memoryDb.fields.find(f => f.field_id === u.field_id);
    const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === u.cycle_id);
    const crop = cycle ? memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id) : null;
    return {
      ...u,
      resource_name: res?.resource_name || 'Fertilizer',
      unit: res?.unit || 'Units',
      field_name: field?.field_name || 'Field',
      crop_name: crop?.crop_name || 'Crop'
    };
  }).sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime());

  return NextResponse.json({ usages: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cycle_id, resource_id, field_id, application_date, quantity_applied, cost, application_method, notes } = body;

    if (!cycle_id || !resource_id || !field_id || !application_date || !quantity_applied || cost === undefined) {
      return NextResponse.json({ error: 'cycle_id, resource_id, field_id, application_date, quantity_applied, and cost are required' }, { status: 400 });
    }

    if (!isPositiveNumber(quantity_applied)) {
      return NextResponse.json({ error: 'Quantity applied must be > 0' }, { status: 400 });
    }

    if (!isValidDate(application_date)) {
      return NextResponse.json({ error: 'Invalid application date' }, { status: 400 });
    }

    const field = memoryDb.fields.find(f => f.field_id === Number(field_id));
    if (!field) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

    // Execute atomic ACID transaction: Insert Usage + Deduct Inventory + Create Expense
    const txnResult = await recordFertilizerUsageTransaction({
      cycleId: Number(cycle_id),
      resourceId: Number(resource_id),
      fieldId: Number(field_id),
      farmId: field.farm_id,
      applicationDate: application_date,
      quantityApplied: Number(quantity_applied),
      cost: Number(cost),
      applicationMethod: application_method || 'Drip Fertigation',
      notes: notes || 'Standard Dosing'
    });

    return NextResponse.json({
      success: true,
      message: txnResult.message,
      transaction: txnResult
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Transaction Rollback: Operation failed' }, { status: 400 });
  }
}
