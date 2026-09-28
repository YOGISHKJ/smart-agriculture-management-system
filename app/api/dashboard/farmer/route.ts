import { NextRequest, NextResponse } from 'next/server';
import { memoryDb } from '@/lib/postgres/db';
import { memoryMongo } from '@/lib/mongodb/db';
import { requireAuth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  const userId = auth.user?.userId || 2; // Default to demo farmer Ravi Kumar if unauth demo preview

  const farmerFarms = memoryDb.farms.filter(f => f.owner_id === userId);
  const farmIds = farmerFarms.map(f => f.farm_id);
  const farmerFields = memoryDb.fields.filter(f => farmIds.includes(f.farm_id));
  const fieldIds = farmerFields.map(f => f.field_id);
  const farmerCycles = memoryDb.crop_cycles.filter(c => fieldIds.includes(c.field_id));
  const cycleIds = farmerCycles.map(c => c.cycle_id);

  const activeCycles = farmerCycles.filter(c => c.status === 'ACTIVE');
  const expenses = memoryDb.expenses.filter(e => farmIds.includes(e.farm_id));
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const harvests = memoryDb.harvests.filter(h => cycleIds.includes(h.cycle_id));
  const totalHarvestKg = harvests.reduce((s, h) => s + h.quantity_kg, 0);
  const totalRevenue = harvests.reduce((s, h) => s + h.total_revenue, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Monthly expenses aggregation
  const monthlyExpensesMap: Record<string, number> = {};
  expenses.forEach(e => {
    const month = e.expense_date.substring(0, 7); // YYYY-MM
    monthlyExpensesMap[month] = (monthlyExpensesMap[month] || 0) + e.amount;
  });

  const monthlyExpensesChart = Object.entries(monthlyExpensesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  // Expenses by Category
  const categoryExpensesMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryExpensesMap[e.category] = (categoryExpensesMap[e.category] || 0) + e.amount;
  });

  const categoryExpensesChart = Object.entries(categoryExpensesMap).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Recent activities
  const recentActivities = memoryDb.farming_activities
    .filter(a => cycleIds.includes(a.cycle_id))
    .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    .slice(0, 5)
    .map(a => {
      const cycle = memoryDb.crop_cycles.find(c => c.cycle_id === a.cycle_id);
      const crop = cycle ? memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id) : null;
      return {
        ...a,
        crop_name: crop?.crop_name || 'Crop'
      };
    });

  // Recent MongoDB Observations for this farmer
  const farmerObservations = memoryMongo.crop_observations
    .filter((o: any) => o.farmer_id === userId || farmIds.includes(o.farm_id))
    .slice(0, 4);

  // Irrigation totals
  const totalWaterLiters = memoryDb.irrigation_records
    .filter(ir => cycleIds.includes(ir.cycle_id))
    .reduce((s, ir) => s + ir.water_quantity_liters, 0);

  return NextResponse.json({
    kpis: {
      total_farms: farmerFarms.length,
      total_acres: farmerFarms.reduce((s, f) => s + f.area, 0),
      total_fields: farmerFields.length,
      active_crop_cycles: activeCycles.length,
      total_expenses: totalExpenses,
      total_harvest_kg: totalHarvestKg,
      total_revenue: totalRevenue,
      net_estimated_profit: netProfit,
      total_water_liters: totalWaterLiters
    },
    monthlyExpensesChart,
    categoryExpensesChart,
    recentActivities,
    recentObservations: farmerObservations,
    farms: farmerFarms,
    activeCycles: activeCycles.map(c => {
      const crop = memoryDb.crops.find(cr => cr.crop_id === c.crop_id);
      const field = memoryDb.fields.find(f => f.field_id === c.field_id);
      return {
        ...c,
        crop_name: crop?.crop_name,
        field_name: field?.field_name
      };
    })
  });
}
