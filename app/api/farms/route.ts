import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, FarmRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    // If not logged in, return public demo farms
    return NextResponse.json({ farms: memoryDb.farms });
  }

  let farms = memoryDb.farms;
  if (auth.user.roleName === 'FARMER') {
    farms = farms.filter(f => f.owner_id === auth.user!.userId);
  }

  // Enrich with fields and owner name
  const enriched = farms.map(f => {
    const owner = memoryDb.users.find(u => u.user_id === f.owner_id);
    const fields = memoryDb.fields.filter(fld => fld.farm_id === f.farm_id);
    return {
      ...f,
      owner_name: owner?.name || 'Unknown',
      fields_count: fields.length,
      fields
    };
  });

  return NextResponse.json({ farms: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { farm_name, location, area, soil_type, ownership_type = 'OWNED', status = 'ACTIVE' } = body;

    if (!farm_name || !location || !area || !soil_type) {
      return NextResponse.json({ error: 'farm_name, location, area, and soil_type are required' }, { status: 400 });
    }

    if (!isPositiveNumber(area)) {
      return NextResponse.json({ error: 'Farm area must be a positive number (> 0)' }, { status: 400 });
    }

    const nextId = memoryDb.farms.length > 0 ? Math.max(...memoryDb.farms.map(f => f.farm_id)) + 1 : 1;
    const newFarm: FarmRecord = {
      farm_id: nextId,
      owner_id: auth.user.userId,
      farm_name,
      location,
      area: Number(Number(area).toFixed(2)),
      soil_type,
      ownership_type,
      status,
      created_at: new Date().toISOString()
    };

    memoryDb.farms.push(newFarm);

    return NextResponse.json({
      success: true,
      message: 'Farm created successfully',
      farm: newFarm
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create farm' }, { status: 500 });
  }
}
