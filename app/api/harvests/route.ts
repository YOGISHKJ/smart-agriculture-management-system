import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, HarvestRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isNonNegativeNumber, isPositiveNumber, isValidDate } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');

  let harvests = memoryDb.harvests;
  if (cycleId) harvests = harvests.filter(h => h.cycle_id === Number(cycleId));

  const enriched = harvests.map(h => {
    const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === h.cycle_id);
    const crop = cycle ? memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id) : null;
    const field = cycle ? memoryDb.fields.find(f => f.field_id === cycle.field_id) : null;
    const farm = field ? memoryDb.farms.find(fm => fm.farm_id === field.farm_id) : null;
    return {
      ...h,
      crop_name: crop?.crop_name || 'Crop',
      field_name: field?.field_name || 'Field',
      farm_name: farm?.farm_name || 'Farm'
    };
  }).sort((a, b) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime());

  const totalYieldKg = enriched.reduce((s, h) => s + h.quantity_kg, 0);
  const totalRevenue = enriched.reduce((s, h) => s + h.total_revenue, 0);

  return NextResponse.json({
    harvests: enriched,
    analytics: {
      total_yield_kg: totalYieldKg,
      total_revenue: totalRevenue,
      average_price_per_kg: totalYieldKg > 0 ? Number((totalRevenue / totalYieldKg).toFixed(2)) : 0
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
    const { cycle_id, harvest_date, quantity_kg, unit = 'KG', quality_grade, selling_price_per_unit, buyer_name, notes } = body;

    if (!cycle_id || !harvest_date || !quantity_kg || selling_price_per_unit === undefined || !quality_grade) {
      return NextResponse.json({ error: 'cycle_id, harvest_date, quantity_kg, quality_grade, and selling_price_per_unit are required' }, { status: 400 });
    }

    if (!isPositiveNumber(quantity_kg) || !isNonNegativeNumber(selling_price_per_unit)) {
      return NextResponse.json({ error: 'Harvest quantity must be > 0 and price >= 0 (CHECK constraint violation).' }, { status: 400 });
    }

    if (!isValidDate(harvest_date)) {
      return NextResponse.json({ error: 'Invalid harvest date format' }, { status: 400 });
    }

    const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === Number(cycle_id));
    if (!cycle) return NextResponse.json({ error: 'Crop cycle not found' }, { status: 404 });

    // Automatic calculation (simulating PostgreSQL trigger fn_compute_harvest_revenue)
    const calculatedRevenue = Number((Number(quantity_kg) * Number(selling_price_per_unit)).toFixed(2));

    const nextId = memoryDb.harvests.length > 0 ? Math.max(...memoryDb.harvests.map(h => h.harvest_id)) + 1 : 1;
    const newHarvest: HarvestRecord = {
      harvest_id: nextId,
      cycle_id: Number(cycle_id),
      harvest_date,
      quantity_kg: Number(quantity_kg),
      unit,
      quality_grade,
      selling_price_per_unit: Number(selling_price_per_unit),
      total_revenue: calculatedRevenue,
      buyer_name: buyer_name || 'Market APMC Yard',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    memoryDb.harvests.push(newHarvest);

    // PostgreSQL Trigger Simulation: Update crop cycle state to 'HARVESTED' & record actual harvest date
    const prevStatus = cycle.status;
    cycle.status = 'HARVESTED';
    cycle.actual_harvest_date = harvest_date;

    memoryDb.crop_status_history.push({
      history_id: memoryDb.crop_status_history.length + 1,
      cycle_id: cycle.cycle_id,
      previous_status: prevStatus,
      new_status: 'HARVESTED',
      changed_at: new Date().toISOString(),
      remarks: `Trigger: Automatic transition to HARVESTED upon harvest log #${nextId}`
    });

    return NextResponse.json({
      success: true,
      message: 'Harvest recorded and revenue calculated automatically by trigger',
      harvest: newHarvest
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
