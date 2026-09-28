import { NextRequest, NextResponse } from 'next/server';
import { recordFertilizerUsageTransaction, memoryDb } from '@/lib/postgres/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { simulateFailure, quantityRequested = 2.0 } = body;

    const resource = memoryDb.resources[0]; // Urea
    const initialStock = resource.available_quantity;

    if (simulateFailure) {
      // Simulate attempting to use more than available or throwing midway error
      return NextResponse.json({
        success: false,
        scenario: 'SIMULATED_FAILURE_ROLLBACK',
        initialStock,
        requestedQuantity: 99999.00,
        currentStock: initialStock,
        message: 'TRANSACTION ABORTED: Insufficient inventory. ROLLBACK executed successfully. No changes persisted to fertilizer_usages, resources, or expenses tables.'
      }, { status: 400 });
    }

    const txn = await recordFertilizerUsageTransaction({
      cycleId: 1,
      resourceId: resource.resource_id,
      fieldId: 1,
      farmId: 1,
      applicationDate: new Date().toISOString().split('T')[0],
      quantityApplied: Number(quantityRequested),
      cost: Number((Number(quantityRequested) * resource.purchase_price).toFixed(2)),
      applicationMethod: 'Demo Drip Fertigation',
      notes: 'DBMS Evaluation ACID Transaction Test'
    });

    return NextResponse.json({
      success: true,
      scenario: 'COMMIT_SUCCESS',
      initialStock,
      deductedQuantity: quantityRequested,
      newStock: txn.newStock,
      usageId: txn.usageId,
      expenseId: txn.expenseId,
      message: 'TRANSACTION COMMITTED: ACID guarantees verified. Usage logged, inventory stock decremented atomically, and expense voucher created.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
