import { NextRequest, NextResponse } from 'next/server';
import { getAgriculturalAdvisories, createAgriculturalAdvisory } from '@/lib/mongodb/db';
import { requireAuth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const crop = searchParams.get('crop') || undefined;
  const category = searchParams.get('category') || undefined;

  try {
    const advisories = await getAgriculturalAdvisories({ search, crop, category });
    return NextResponse.json({
      advisories,
      count: advisories.length,
      database: 'MongoDB (NoSQL Document Store)'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'OFFICER']);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Only Admin or Officer can author advisories' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json();
    const { crop, topic, category, severity_level, symptoms, recommendations, preventive_measures, tags } = body;

    if (!crop || !topic || !category || !symptoms || !recommendations) {
      return NextResponse.json({ error: 'crop, topic, category, symptoms, and recommendations are required' }, { status: 400 });
    }

    const newAdvisory = await createAgriculturalAdvisory({
      crop,
      topic,
      category,
      severity_level: severity_level || 'MODERATE',
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      recommendations,
      preventive_measures: Array.isArray(preventive_measures) ? preventive_measures : [],
      tags: Array.isArray(tags) ? tags : [tags],
      author: auth.user.name,
      verified: true,
      helpful_votes: 1
    });

    return NextResponse.json({
      success: true,
      message: 'Agricultural advisory document created in MongoDB',
      advisory: newAdvisory
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
