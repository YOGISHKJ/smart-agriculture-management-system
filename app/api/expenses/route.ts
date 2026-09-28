import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, ExpenseRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isNonNegativeNumber, isValidDate } from '@/lib/validation/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');
  const category = searchParams.get('category');

  let expenses = memoryDb.expenses;
  if (farmId) expenses = expenses.filter(e => e.farm_id === Number(farmId));
  if (category && category !== 'ALL') expenses = expenses.filter(e => e.category === category);

  const enriched = expenses.map(e => {
    const farm = memoryDb.farms.find(f => f.farm_id === e.farm_id);
    const cycle = e.cycle_id ? memoryDb.crop_cycles.find(c => c.cycle_id === e.cycle_id) : null;
    const crop = cycle ? memoryDb.crops.find(cr => cr.crop_id === cycle.crop_id) : null;
    return {
      ...e,
      farm_name: farm?.farm_name || 'Farm',
      crop_name: crop?.crop_name || 'General Farm Overhead'
    };
  }).sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());

  // Aggregate category metrics
  const totalAmount = enriched.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  enriched.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  return NextResponse.json({
    expenses: enriched,
    analytics: {
      total_expenses: totalAmount,
      total_vouchers: enriched.length,
      by_category: byCategory
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
    const { farm_id, cycle_id, expense_date, category, amount, payment_mode = 'CASH', receipt_number, description } = body;

    if (!farm_id || !expense_date || !category || amount === undefined || !description) {
      return NextResponse.json({ error: 'farm_id, expense_date, category, amount, and description are required' }, { status: 400 });
    }

    if (!isNonNegativeNumber(amount)) {
      return NextResponse.json({ error: 'Expense amount must be >= 0 (CHECK constraint violation).' }, { status: 400 });
    }

    if (!isValidDate(expense_date)) {
      return NextResponse.json({ error: 'Invalid expense date format' }, { status: 400 });
    }

    const nextId = memoryDb.expenses.length > 0 ? Math.max(...memoryDb.expenses.map(e => e.expense_id)) + 1 : 1;
    const newExpense: ExpenseRecord = {
      expense_id: nextId,
      farm_id: Number(farm_id),
      cycle_id: cycle_id ? Number(cycle_id) : null,
      expense_date,
      category: category.toUpperCase(),
      amount: Number(amount),
      payment_mode: payment_mode.toUpperCase(),
      receipt_number: receipt_number || `REC-EXP-${nextId}`,
      description,
      created_at: new Date().toISOString()
    };

    memoryDb.expenses.push(newExpense);

    return NextResponse.json({
      success: true,
      message: 'Expense ledger entry created successfully',
      expense: newExpense
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
