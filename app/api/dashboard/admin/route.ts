import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { memoryMongo } from '@/lib/mongodb/db';
import { requireAuth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  // Allow preview or admin
  const farmers = memoryDb.users.filter(u => u.role_id === 2);
  const totalFarms = memoryDb.farms.length;
  const totalFields = memoryDb.fields.length;
  const activeCycles = memoryDb.crop_cycles.filter(c => c.status === 'ACTIVE').length;
  const totalExpenses = memoryDb.expenses.reduce((s, e) => s + e.amount, 0);
  const totalHarvestRevenue = memoryDb.harvests.reduce((s, h) => s + h.total_revenue, 0);
  const totalInventoryValuation = memoryDb.resources.reduce((s, r) => s + (r.available_quantity * r.purchase_price), 0);
  const totalAdvisories = memoryMongo.agricultural_advisories.length;
  const totalObservations = memoryMongo.crop_observations.length;

  // Most common crops
  const cropCounts: Record<string, number> = {};
  memoryDb.crop_cycles.forEach(c => {
    const crop = memoryDb.crops.find(cr => cr.crop_id === c.crop_id);
    if (crop) cropCounts[crop.crop_name] = (cropCounts[crop.crop_name] || 0) + 1;
  });

  const popularCropsChart = Object.entries(cropCounts).map(([name, count]) => ({ name, count }));

  // Financial performance per farm
  const farmPerformance = memoryDb.farms.map(f => {
    const owner = memoryDb.users.find(u => u.user_id === f.owner_id);
    const farmExp = memoryDb.expenses.filter(e => e.farm_id === f.farm_id).reduce((s, e) => s + e.amount, 0);
    const fields = memoryDb.fields.filter(fld => fld.farm_id === f.farm_id).map(fld => fld.field_id);
    const cycles = memoryDb.crop_cycles.filter(c => fields.includes(c.field_id)).map(c => c.cycle_id);
    const farmRev = memoryDb.harvests.filter(h => cycles.includes(h.cycle_id)).reduce((s, h) => s + h.total_revenue, 0);
    return {
      farm_id: f.farm_id,
      farm_name: f.farm_name,
      owner_name: owner?.name || 'Unknown',
      location: f.location,
      area: f.area,
      expenses: farmExp,
      revenue: farmRev,
      profit: farmRev - farmExp,
      status: f.status
    };
  });

  return NextResponse.json({
    kpis: {
      total_farmers: farmers.length,
      total_farms: totalFarms,
      total_fields: totalFields,
      active_crop_cycles: activeCycles,
      system_expenses: totalExpenses,
      system_revenue: totalHarvestRevenue,
      system_net_profit: totalHarvestRevenue - totalExpenses,
      inventory_valuation: Number(totalInventoryValuation.toFixed(2)),
      total_advisories_mongodb: totalAdvisories,
      total_observations_mongodb: totalObservations
    },
    popularCropsChart,
    farmPerformance,
    systemUsers: memoryDb.users.map(u => ({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      role: memoryDb.roles.find(r => r.role_id === u.role_id)?.role_name,
      created_at: u.created_at
    }))
  });
}
