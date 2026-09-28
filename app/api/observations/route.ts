import { NextRequest, NextResponse } from 'next/server';
import { getCropObservations, createCropObservation } from '@/lib/mongodb/db';
import { memoryDb } from '@/lib/postgres/db';
import { requireAuth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || undefined;
  const farmerId = searchParams.get('farmerId') ? Number(searchParams.get('farmerId')) : undefined;
  const farmId = searchParams.get('farmId') ? Number(searchParams.get('farmId')) : undefined;

  try {
    const observations = await getCropObservations({ crop, farmerId, farmId });
    return NextResponse.json({
      observations,
      count: observations.length,
      database: 'MongoDB (Dynamic Schema Document Collection)'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { farm_id, field_id, crop, crop_stage, symptoms_observed, dynamic_attributes, notes, images, weather_context } = body;

    if (!farm_id || !field_id || !crop || !crop_stage) {
      return NextResponse.json({ error: 'farm_id, field_id, crop, and crop_stage are required' }, { status: 400 });
    }

    const farm = memoryDb.farms.find(f => f.farm_id === Number(farm_id));

    // Store in MongoDB with flexible dynamic schema
    const newObservation = await createCropObservation({
      farmer_id: auth.user.userId,
      farmer_name: auth.user.name,
      farm_id: Number(farm_id),
      farm_name: farm?.farm_name || 'Farm',
      field_id: Number(field_id),
      crop,
      observation_date: new Date(),
      crop_stage,
      symptoms_observed: Array.isArray(symptoms_observed) ? symptoms_observed : (symptoms_observed ? [symptoms_observed] : []),
      dynamic_attributes: dynamic_attributes || {},
      notes: notes || '',
      images: Array.isArray(images) ? images : [],
      weather_context: weather_context || { temperature_c: 28, humidity_pct: 60, sky_condition: 'Normal' }
    });

    return NextResponse.json({
      success: true,
      message: 'Dynamic crop observation stored in MongoDB',
      observation: newObservation
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
