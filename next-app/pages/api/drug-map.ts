// Mock drug mapping API
export default function handler(req: any, res: any) {
  const brand = req.query.brand || 'Unknown'
  // Very small mock mapping logic
  const map: Record<string,{generic:string,savings:number}> = {
    'Crocin': { generic: 'Paracetamol (Jan Aushadhi)', savings: 25 },
    'Crocin 650': { generic: 'Paracetamol 650 mg (Jan Aushadhi)', savings: 40 },
    'Crocin Advance': { generic: 'Paracetamol+Domperidone (Jan Aushadhi)', savings: 60 }
  }

  const result = map[brand] || { generic: `${brand} (Jan Aushadhi Generic)`, savings: Math.floor(Math.random()*100) }
  res.status(200).json(result)
}
