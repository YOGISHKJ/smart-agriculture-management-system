import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, CropRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';

export async function GET() {
  const enriched = memoryDb.crops.map(c => {
    const activeCycles = memoryDb.crop_cycles.filter(cc => cc.crop_id === c.crop_id && cc.status === 'ACTIVE').length;
    const totalHarvestedKg = memoryDb.harvests
      .filter(h => {
        const cycle = memoryDb.crop_cycles.find(cc => cc.cycle_id === h.cycle_id);
        return cycle?.crop_id === c.crop_id;
      })
      .reduce((sum, h) => sum + h.quantity_kg, 0);

    return {
      ...c,
      active_cycles_count: activeCycles,
      total_harvested_kg: totalHarvestedKg
    };
  });

  return NextResponse.json({ crops: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { crop_name, scientific_name, category, standard_maturity_days, water_requirement, optimal_soil } = body;

    if (!crop_name || !category || !standard_maturity_days) {
      return NextResponse.json({ error: 'crop_name, category, and standard_maturity_days are required' }, { status: 400 });
    }

    const categories = ['CEREAL', 'PULSE', 'VEGETABLE', 'FRUIT', 'CASH_CROP', 'OILSEED', 'HORTICULTURE'];
    if (!categories.includes(category.toUpperCase())) {
      return NextResponse.json({ error: `Category must be one of: ${categories.join(', ')}` }, { status: 400 });
    }

    // Check unique
    const existing = memoryDb.crops.find(c => c.crop_name.toLowerCase() === crop_name.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'Crop variety already registered' }, { status: 409 });
    }

    const nextId = memoryDb.crops.length > 0 ? Math.max(...memoryDb.crops.map(c => c.crop_id)) + 1 : 1;
    const newCrop: CropRecord = {
      crop_id: nextId,
      crop_name,
      scientific_name: scientific_name || '',
      category: category.toUpperCase(),
      standard_maturity_days: Number(standard_maturity_days),
      water_requirement: water_requirement || 'MEDIUM',
      optimal_soil: optimal_soil || 'Loamy'
    };

    memoryDb.crops.push(newCrop);

    return NextResponse.json({ success: true, crop: newCrop }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
