import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, ResourceRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isNonNegativeNumber } from '@/lib/validation/validators';

export async function GET() {
  const enriched = memoryDb.resources.map(r => {
    const usages = memoryDb.fertilizer_usages.filter(u => u.resource_id === r.resource_id);
    const totalApplied = usages.reduce((s, u) => s + u.quantity_applied, 0);
    const totalValuation = Number((r.available_quantity * r.purchase_price).toFixed(2));
    
    let status = 'ADEQUATE';
    if (r.available_quantity <= r.minimum_stock * 0.5) status = 'CRITICAL_LOW';
    else if (r.available_quantity <= r.minimum_stock) status = 'REORDER_REQUIRED';
    else if (r.available_quantity > r.minimum_stock * 3) status = 'OVERSTOCKED';

    return {
      ...r,
      total_applied: totalApplied,
      total_stock_valuation: totalValuation,
      inventory_health_status: status
    };
  });

  return NextResponse.json({ resources: enriched });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { resource_name, category, unit, purchase_price, available_quantity = 0, minimum_stock = 0, supplier, purchase_date } = body;

    if (!resource_name || !category || !unit || purchase_price === undefined) {
      return NextResponse.json({ error: 'resource_name, category, unit, and purchase_price are required' }, { status: 400 });
    }

    if (!isNonNegativeNumber(purchase_price) || !isNonNegativeNumber(available_quantity) || !isNonNegativeNumber(minimum_stock)) {
      return NextResponse.json({ error: 'Price, available quantity, and minimum stock must be >= 0 (CHECK constraint violation).' }, { status: 400 });
    }

    const nextId = memoryDb.resources.length > 0 ? Math.max(...memoryDb.resources.map(r => r.resource_id)) + 1 : 1;
    const newResource: ResourceRecord = {
      resource_id: nextId,
      resource_name,
      category,
      unit,
      purchase_price: Number(purchase_price),
      available_quantity: Number(available_quantity),
      minimum_stock: Number(minimum_stock),
      supplier: supplier || 'Local Agricultural Cooperative',
      purchase_date: purchase_date || new Date().toISOString().split('T')[0]
    };

    memoryDb.resources.push(newResource);

    return NextResponse.json({
      success: true,
      message: 'Resource registered in inventory',
      resource: newResource
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
