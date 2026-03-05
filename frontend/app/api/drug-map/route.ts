import { NextRequest, NextResponse } from 'next/server';

// Mock Jan Aushadhi Drug Registry
const drugRegistry: Record<string, { generic: string; savings: number; savingsPercentage: number }> = {
  'crocin': { generic: 'Paracetamol', savings: 45, savingsPercentage: 70 },
  'aspirin': { generic: 'Acetylsalicylic Acid', savings: 30, savingsPercentage: 65 },
  'ciplox': { generic: 'Ciprofloxacin', savings: 80, savingsPercentage: 75 },
  'dolo': { generic: 'Paracetamol', savings: 40, savingsPercentage: 68 },
  'brufen': { generic: 'Ibuprofen', savings: 55, savingsPercentage: 72 },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand')?.toLowerCase();

  if (!brand) {
    return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
  }

  const mapping = drugRegistry[brand];

  if (!mapping) {
    return NextResponse.json({
      error: 'Brand not found in registry',
      generic: 'Generic equivalent not available',
      savings: 0,
      savingsPercentage: 0
    }, { status: 404 });
  }

  return NextResponse.json(mapping);
}