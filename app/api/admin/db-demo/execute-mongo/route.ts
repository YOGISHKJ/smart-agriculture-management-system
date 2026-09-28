import { NextRequest, NextResponse } from 'next/server';
import { runMongoAggregationPipeline } from '@/lib/mongodb/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pipelineName } = body;

    const data = await runMongoAggregationPipeline(pipelineName || 'ADVISORIES_BY_CROP');

    return NextResponse.json({
      success: true,
      pipelineName,
      pipeline: data.pipeline,
      result: data.result,
      executionTimeMs: data.executionTimeMs
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
