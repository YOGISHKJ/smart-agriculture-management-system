import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const cycleId = Number(params.id);
  const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === cycleId);
  if (!cycle) return NextResponse.json({ error: 'Crop cycle not found' }, { status: 404 });

  const field = memoryDb.fields.find(f => f.field_id === cycle.field_id);
  const farm = field ? memoryDb.farms.find(fm => fm.farm_id === field.farm_id) : null;
  const crop = memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id);
  const activities = memoryDb.farming_activities.filter(a => a.cycle_id === cycleId).sort((a, b) => new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime());
  const irrigations = memoryDb.irrigation_records.filter(ir => ir.cycle_id === cycleId);
  const fertilizers = memoryDb.fertilizer_usages.filter(fu => fu.cycle_id === cycleId);
  const expenses = memoryDb.expenses.filter(e => e.cycle_id === cycleId);
  const harvest = memoryDb.harvests.find(h => h.cycle_id === cycleId);
  const auditHistory = memoryDb.crop_status_history.filter(h => h.cycle_id === cycleId).sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  return NextResponse.json({
    cycle: {
      ...cycle,
      crop_name: crop?.crop_name,
      scientific_name: crop?.scientific_name,
      crop_category: crop?.category,
      field_name: field?.field_name,
      field_area: field?.area,
      farm_name: farm?.farm_name,
      farm_id: farm?.farm_id,
      activities,
      irrigations,
      fertilizers,
      expenses,
      harvest: harvest || null,
      auditHistory
    }
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cycleId = Number(params.id);
  const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === cycleId);
  if (!cycle) return NextResponse.json({ error: 'Crop cycle not found' }, { status: 404 });

  try {
    const body = await request.json();
    const prevStatus = cycle.status;

    if (body.status && body.status !== prevStatus) {
      const validStatuses = ['PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      cycle.status = body.status;

      // PostgreSQL Trigger Simulation: Insert audit log
      memoryDb.crop_status_history.push({
        history_id: memoryDb.crop_status_history.length + 1,
        cycle_id: cycleId,
        previous_status: prevStatus,
        new_status: body.status,
        changed_at: new Date().toISOString(),
        remarks: body.remarks || `Status transitioned from ${prevStatus} to ${body.status}`
      });
    }

    if (body.target_yield_kg) cycle.target_yield_kg = Number(body.target_yield_kg);
    if (body.actual_harvest_date) cycle.actual_harvest_date = body.actual_harvest_date;
    if (body.notes) cycle.notes = body.notes;

    return NextResponse.json({ success: true, cycle });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
