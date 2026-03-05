import { UploadCloud } from 'lucide-react'

export default function UploadZone({ onFile }: { onFile?: (f: File) => void }) {
  return (
    <div className="med-card border-2 border-dashed border-secondary/30 hover:border-secondary p-8 flex flex-col items-center gap-4 transition-all duration-200 bg-gradient-to-br from-secondary/5 to-transparent">
      <UploadCloud size={48} className="text-secondary" />
      <div className="text-lg font-bold text-gray-800">Drag & drop prescriptions or lab PDFs</div>
      <div className="text-sm text-gray-600">AI will extract drug names, dosages and diagnoses in FHIR format</div>
      <label className="mt-4 cursor-pointer">
        <input
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile?.(e.target.files[0])}
        />
        <span className="btn-secondary inline-block">Choose File</span>
      </label>
    </div>
  )
}
