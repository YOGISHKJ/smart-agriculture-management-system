import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, FarmingActivityRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isNonNegativeNumber, isValidDate } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');

  let activities = memoryDb.farming_activities;
  if (cycleId) {
    activities = activities.filter(a => a.cycle_id === Number(cycleId));
  }

  const enriched = activities.map(a => {
    const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === a.cycle_id);
    const crop = cycle ? memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id) : null;
    const field = memoryDb.fields.find(f => f.field_id === a.field_id);
    const farm = field ? memoryDb.farms.find(fm => fm.farm_id === field.farm_id) : null;
    return {
      ...a,
      crop_name: crop?.crop_name || 'General',
      field_name: field?.field_name || 'General Field',
      farm_name: farm?.farm_name || 'Farm'
    };
  }).sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());

  return NextResponse.json({ activities: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cycle_id, field_id, activity_date, activity_type, description, labour_hours = 0, cost = 0 } = body;

    if (!cycle_id || !field_id || !activity_date || !activity_type || !description) {
      return NextResponse.json({ error: 'cycle_id, field_id, activity_date, activity_type, and description are required' }, { status: 400 });
    }

    if (!isValidDate(activity_date)) {
      return NextResponse.json({ error: 'Invalid activity date' }, { status: 400 });
    }

    if (!isNonNegativeNumber(cost) || !isNonNegativeNumber(labour_hours)) {
      return NextResponse.json({ error: 'Cost and labour hours must be non-negative (CHECK constraint violation).' }, { status: 400 });
    }

    const nextId = memoryDb.farming_activities.length > 0 ? Math.max(...memoryDb.farming_activities.map(a => a.activity_id)) + 1 : 1;
    const newActivity: FarmingActivityRecord = {
      activity_id: nextId,
      cycle_id: Number(cycle_id),
      field_id: Number(field_id),
      activity_date,
      activity_type,
      description,
      labour_hours: Number(labour_hours),
      cost: Number(cost),
      created_at: new Date().toISOString()
    };

    memoryDb.farming_activities.push(newActivity);

    // If cost > 0, also create an expense line item if requested
    if (Number(cost) > 0) {
      const field = memoryDb.fields.find(f => f.field_id === Number(field_id));
      if (field) {
        const nextExpId = memoryDb.expenses.length > 0 ? Math.max(...memoryDb.expenses.map(e => e.expense_id)) + 1 : 1;
        memoryDb.expenses.push({
          expense_id: nextExpId,
          farm_id: field.farm_id,
          cycle_id: Number(cycle_id),
          expense_date: activity_date,
          category: 'LABOUR',
          amount: Number(cost),
          payment_mode: 'CASH',
          receipt_number: `ACT-EXP-${nextExpId}`,
          description: `Activity: ${activity_type} - ${description.substring(0, 50)}`,
          created_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Farming activity logged successfully',
      activity: newActivity
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
