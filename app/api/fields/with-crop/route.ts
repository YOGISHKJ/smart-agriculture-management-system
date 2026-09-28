import { NextRequest, NextResponse } from 'next/server';
import { memoryDb, FieldRecord, CropRecord, CropCycleRecord } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';
import { isPositiveNumber, isValidDate, areDatesOrdered } from '@/lib/validation/validators';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      // Field details
      farm_id,
      field_name,
      area,
      soil_type,
      irrigation_type,
      
      // Crop details
      crop_id,              // Optional if new_crop_name is provided
      new_crop_name,        // Optional if crop_id is selected
      crop_category,
      scientific_name,
      standard_maturity_days,
      
      // Cycle details
      sowing_date,
      expected_harvest_date,
      target_yield_kg,
      notes
    } = body;

    // 1. Validate Field Details
    if (!farm_id || !field_name || !area || !irrigation_type) {
      return NextResponse.json({ error: 'Field details missing: farm, field name, area, and irrigation type are required.' }, { status: 400 });
    }

    if (!isPositiveNumber(area)) {
      return NextResponse.json({ error: 'Field area must be a positive number (> 0).' }, { status: 400 });
    }

    const farm = memoryDb.farms.find(f => f.farm_id === Number(farm_id));
    if (!farm) {
      return NextResponse.json({ error: 'Parent Farm not found.' }, { status: 404 });
    }

    // 2. Validate Crop Details (if crop cycle is being planted)
    let selectedCropId = crop_id ? Number(crop_id) : null;

    if (!selectedCropId && new_crop_name) {
      // Check if crop already exists with this name
      const existingCrop = memoryDb.crops.find(c => c.crop_name.toLowerCase() === new_crop_name.trim().toLowerCase());
      if (existingCrop) {
        selectedCropId = existingCrop.crop_id;
      } else {
        // Register new crop
        const nextCropId = memoryDb.crops.length > 0 ? Math.max(...memoryDb.crops.map(c => c.crop_id)) + 1 : 1;
        const newCrop: CropRecord = {
          crop_id: nextCropId,
          crop_name: new_crop_name.trim(),
          scientific_name: scientific_name || '',
          category: (crop_category || 'VEGETABLE').toUpperCase(),
          standard_maturity_days: Number(standard_maturity_days || 90),
          water_requirement: 'MEDIUM',
          optimal_soil: soil_type || farm.soil_type || 'Loamy'
        };
        memoryDb.crops.push(newCrop);
        selectedCropId = nextCropId;
      }
    }

    // 3. Create the Field Record in PostgreSQL
    const nextFieldId = memoryDb.fields.length > 0 ? Math.max(...memoryDb.fields.map(f => f.field_id)) + 1 : 1;
    const newField: FieldRecord = {
      field_id: nextFieldId,
      farm_id: Number(farm_id),
      field_name: field_name.trim(),
      area: Number(Number(area).toFixed(2)),
      soil_type: soil_type || farm.soil_type,
      irrigation_type: irrigation_type.toUpperCase(),
      created_at: new Date().toISOString()
    };
    memoryDb.fields.push(newField);

    // 4. If Crop Cycle dates are provided, create Crop Cycle Record in PostgreSQL
    let createdCycle: CropCycleRecord | null = null;
    if (selectedCropId && sowing_date && expected_harvest_date) {
      if (!isValidDate(sowing_date) || !isValidDate(expected_harvest_date)) {
        return NextResponse.json({ error: 'Invalid sowing or expected harvest date format.' }, { status: 400 });
      }

      if (!areDatesOrdered(sowing_date, expected_harvest_date)) {
        return NextResponse.json({ error: 'Expected harvest date must be on or after sowing date (CHECK constraint).' }, { status: 400 });
      }

      const nextCycleId = memoryDb.crop_cycles.length > 0 ? Math.max(...memoryDb.crop_cycles.map(c => c.cycle_id)) + 1 : 1;
      createdCycle = {
        cycle_id: nextCycleId,
        field_id: nextFieldId,
        crop_id: selectedCropId,
        sowing_date,
        expected_harvest_date,
        actual_harvest_date: null,
        status: 'ACTIVE',
        target_yield_kg: target_yield_kg ? Number(target_yield_kg) : 0,
        notes: notes || `Planted during field partition setup`,
        created_at: new Date().toISOString()
      };
      memoryDb.crop_cycles.push(createdCycle);

      // Trigger simulation: insert status history audit
      memoryDb.crop_status_history.push({
        history_id: memoryDb.crop_status_history.length + 1,
        cycle_id: nextCycleId,
        previous_status: null,
        new_status: 'ACTIVE',
        changed_at: new Date().toISOString(),
        remarks: 'Auto-created via Unified Field & Crop Registration'
      });
    }

    const cropObj = selectedCropId ? memoryDb.crops.find(c => c.crop_id === selectedCropId) : null;

    return NextResponse.json({
      success: true,
      message: createdCycle 
        ? `Field "${newField.field_name}" created and Crop "${cropObj?.crop_name}" successfully sown!`
        : `Field "${newField.field_name}" created successfully!`,
      field: newField,
      crop: cropObj,
      cycle: createdCycle
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process registration' }, { status: 500 });
  }
}
