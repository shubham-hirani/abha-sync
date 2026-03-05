import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Mock FHIR save - in real implementation, this would save to ABDM gateway
    console.log('Saving to FHIR:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Data saved to FHIR successfully',
      id: `bundle-${Date.now()}`,
    });
  } catch (error) {
    console.error('FHIR save error:', error);
    return NextResponse.json({ error: 'Failed to save to FHIR' }, { status: 500 });
  }
}