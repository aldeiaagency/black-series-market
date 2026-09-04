'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseCSV, normaliseRow, validateRow, TEMPLATE_CSV } from '@/lib/vehicle-intake/csv-parse'

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_importacion_blacklabel.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Column descriptions ────────────────────────────────────────────────────────

const COLUMNS = [
  { name: 'tipo',            req: false, note: 'coche (default) o moto' },
  { name: 'marca',           req: true,  note: 'Ferrari, Porsche, Ducati…' },
  { name: 'modelo',          req: true,  note: '911, 488, Panigale…' },
  { name: 'version',         req: false, note: 'GT3, Turbo S, S…' },
  { name: 'año',             req: true,  note: '2010–2025' },
  { name: 'km',              req: true,  note: 'número entero, sin puntos' },
  { name: 'precio',          req: false, note: 'número sin símbolo €' },
  { name: 'precio_consultar',req: false, note: 'si / no' },
  { name: 'combustible',     req: false, note: 'gasolina · diesel · electrico · hibrido' },
  { name: 'cambio',          req: false, note: 'manual · automatico · dct · cvt' },
  { name: 'traccion',        req: false, note: 'rwd · fwd · awd · 4wd' },
  { name: 'potencia_cv',     req: false, note: 'número entero' },
  { name: 'potencia_kw',     req: false, note: 'número entero' },
  { name: 'par_nm',          req: false, note: 'número entero (Nm)' },
  { name: 'cilindrada',      req: false, note: 'cc — número entero' },
  { name: 'cilindros',       req: false, note: '4, 6, 8, 12…' },
  { name: 'carroceria',      req: false, note: 'Coupé · SUV · Berlina · Cabrio…' },
  { name: 'condicion',       req: false, note: 'nuevo · seminuevo · ocasion · clasico · restaurado · preparado · coleccion' },
  { name: 'color',           req: false, note: 'texto libre (color exterior)' },
  { name: 'color_interior',  req: false, note: 'texto libre' },
  { name: 'tapiceria',       req: false, note: 'Piel · Alcántara · Cuero Nappa…' },
  { name: 'puertas',         req: false, note: '2, 3, 4, 5' },
  { name: 'plazas',          req: false, note: 'número entero' },
  { name: 'etiqueta_dgt',    req: false, note: '0 · ECO · C · B' },
  { name: 'año_matriculacion',req: false, note: 'año de primera matriculación' },
  { name: 'num_propietarios',req: false, note: 'número entero' },
  { name: 'iva_deducible',   req: false, note: 'si / no' },
  { name: 'descripcion',     req: false, note: 'texto libre' },
  { name: 'vin',             req: false, note: 'número de bastidor (17 chars)' },
  { name: 'fotos',           req: false, note: 'URLs separadas por "|" — se descargan y alojan automáticamente' },
  { name: 'id_externo',      req: false, note: 'id de tu sistema/DMS, si lo tienes — evita duplicados al reimportar' },
]

// ── Component ──────────────────────────────────────────────────────────────────

type ParsedRow = { raw: Record<string, string>; error: string | null }
type ImportResult = { inserted: number; errors: { row: number; message: string }[]; draftNoPhotos?: number } | null

export default function ImportarPage() {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setResult(null)
    setFileError(null)
    if (!file.name.endsWith('.csv')) {
      setFileError('Solo se admiten archivos .csv — si tienes Excel, usa Archivo → Guardar como → CSV.')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      const bytes = new Uint8Array(buffer)
      let text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
      if (text.includes('')) {
        text = new TextDecoder('windows-1252').decode(bytes)
      }
      const { rows } = parseCSV(text)
      if (!rows.length) { setFileError('El archivo está vacío o no tiene filas de datos.'); return }
      const normalised = rows.map(r => normaliseRow(r))
      setParsed(normalised.map(r => ({ raw: r, error: validateRow(r) })))
    }
    reader.readAsArrayBuffer(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearFile() {
    setParsed([])
    setFileName(null)
    setResult(null)
    setFileError(null)
  }

  async function handleImport() {
    const validRows = parsed.filter(p => !p.error).map(p => p.raw)
    if (!validRows.length) return
    setImporting(true)
    setResult(null)
    try {
      const res = await fetch('/api/vehicles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      })
      const json = await res.json()
      setResult(json)
    } catch {
      setResult({ inserted: 0, errors: [{ row: 0, message: 'Error de conexión' }] })
    } finally {
      setImporting(false)
    }
  }

  const validCount   = parsed.filter(p => !p.error).length
  const invalidCount = parsed.filter(p => p.error).length
  const PREVIEW_MAX  = 8

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Importar vehículos</h1>
        <p className="text-sm text-bsm-text-muted">
          Sube un archivo CSV para añadir varios vehículos a la vez. Quedarán en revisión hasta ser aprobados.{' '}
          <Link href="/dashboard/publicar" className="text-gold hover:text-gold-light transition-colors">
            ¿Añadir uno por uno? →
          </Link>
        </p>
      </div>

      {/* Template download */}
      <div className="flex items-center justify-between p-4 bg-surface border border-bsm-border mb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-gold flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-bsm-text-primary">Plantilla oficial (29 columnas)</p>
            <p className="text-xs text-bsm-text-muted">Descarga, rellena con tus vehículos y sube el archivo</p>
          </div>
        </div>
        <button onClick={downloadTemplate} className="btn-outline text-xs px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <Download className="w-3.5 h-3.5" />
          Descargar plantilla
        </button>
      </div>

      {/* Upload zone */}
      {!parsed.length && !fileError && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors duration-200 mb-8',
            dragging ? 'border-gold/60 bg-gold/5' : 'border-bsm-border hover:border-bsm-border-light hover:bg-surface'
          )}
        >
          <input ref={inputRef} type="file" accept=".csv" className="sr-only" onChange={onInputChange} />
          <Upload className="w-8 h-8 text-bsm-text-muted mx-auto mb-3" />
          <p className="text-sm text-bsm-text-primary mb-1">
            Arrastra tu CSV aquí o <span className="text-gold underline underline-offset-2">selecciona el archivo</span>
          </p>
          <p className="text-xs text-bsm-text-muted">Solo .csv · máx. 500 filas por importación</p>
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div className="flex items-start gap-3 p-4 border border-red-400/30 bg-red-400/5 mb-6">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400">{fileError}</p>
            <button onClick={clearFile} className="text-xs text-bsm-text-muted hover:text-bsm-text-primary mt-2 underline">
              Intentar con otro archivo
            </button>
          </div>
        </div>
      )}

      {/* Parsed preview */}
      {parsed.length > 0 && (
        <div className="space-y-6">

          {/* Summary bar */}
          <div className="flex items-center justify-between p-4 bg-surface border border-bsm-border">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-bsm-text-muted">
                Archivo: <span className="text-bsm-text-primary font-medium">{fileName}</span>
              </span>
              <span className="text-emerald-400 font-medium">{validCount} válidos</span>
              {invalidCount > 0 && <span className="text-red-400 font-medium">{invalidCount} con error</span>}
            </div>
            <button onClick={clearFile} className="text-bsm-text-muted hover:text-bsm-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto border border-bsm-border">
            <table className="w-full text-xs">
              <thead className="bg-surface">
                <tr>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium w-8">#</th>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium">Marca</th>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium">Modelo</th>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium">Año</th>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium">Km</th>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium">Precio</th>
                  <th className="px-3 py-2.5 text-left text-bsm-text-muted font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, PREVIEW_MAX).map((p, i) => (
                  <tr key={i} className={cn('border-t border-bsm-border', p.error ? 'bg-red-400/5' : 'hover:bg-surface')}>
                    <td className="px-3 py-2.5 text-bsm-text-muted">{i + 1}</td>
                    <td className="px-3 py-2.5 text-bsm-text-primary">{p.raw.brand_name || '—'}</td>
                    <td className="px-3 py-2.5 text-bsm-text-primary">{p.raw.model_name || '—'}</td>
                    <td className="px-3 py-2.5 text-bsm-text-secondary">{p.raw.year || '—'}</td>
                    <td className="px-3 py-2.5 text-bsm-text-secondary">{p.raw.mileage_km || '—'}</td>
                    <td className="px-3 py-2.5 text-bsm-text-secondary">{p.raw.price || '—'}</td>
                    <td className="px-3 py-2.5">
                      {p.error
                        ? <span className="flex items-center gap-1 text-red-400"><AlertCircle className="w-3 h-3" />{p.error}</span>
                        : <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" />OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > PREVIEW_MAX && (
              <p className="text-xs text-bsm-text-muted text-center py-3 border-t border-bsm-border">
                …y {parsed.length - PREVIEW_MAX} filas más
              </p>
            )}
          </div>

          {/* Import button */}
          {!result && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="btn-gold"
              >
                {importing
                  ? 'Importando…'
                  : `Importar ${validCount} vehículo${validCount !== 1 ? 's' : ''}`}
              </button>
              {invalidCount > 0 && (
                <p className="text-xs text-bsm-text-muted">
                  Las {invalidCount} filas con error se omitirán.
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={cn(
              'p-5 border',
              result.inserted > 0 ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-red-400/30 bg-red-400/5'
            )}>
              {result.inserted > 0 && (
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  {result.inserted} vehículo{result.inserted !== 1 ? 's' : ''} enviado{result.inserted !== 1 ? 's' : ''} a revisión
                </div>
              )}
              {!!result.draftNoPhotos && (
                <div className="flex items-start gap-2 text-amber-400 mb-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    {result.draftNoPhotos} de esos vehículo{result.draftNoPhotos !== 1 ? 's' : ''} no traía{result.draftNoPhotos !== 1 ? 'n' : ''} fotos en el CSV
                    y se {result.draftNoPhotos !== 1 ? 'han' : 'ha'} guardado como borrador — no se publican hasta que subas al menos una foto de cada uno desde{' '}
                    <Link href="/dashboard/inventario" className="underline hover:text-amber-300">Inventario</Link>.
                  </p>
                </div>
              )}
              {result.errors.length > 0 && (
                <div>
                  <p className="text-sm text-red-400 font-medium mb-2">
                    {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''} al importar:
                  </p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-400">
                        {e.row > 0 ? `Fila ${e.row}: ` : ''}{e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.inserted > 0 && (
                <Link href="/dashboard/inventario" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 mt-3 transition-colors">
                  Ver inventario <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Column guide */}
      <div className="mt-10 border border-bsm-border bg-surface">
        <div className="px-5 py-4 border-b border-bsm-border">
          <h2 className="text-sm font-medium text-bsm-text-primary">Columnas admitidas ({COLUMNS.length})</h2>
        </div>
        <div className="divide-y divide-bsm-border">
          {COLUMNS.map(col => (
            <div key={col.name} className="flex items-baseline gap-4 px-5 py-2.5">
              <code className="text-[11px] text-gold font-mono w-40 flex-shrink-0">{col.name}</code>
              <span className={cn('text-[11px] w-20 flex-shrink-0', col.req ? 'text-bsm-text-primary font-medium' : 'text-bsm-text-muted')}>
                {col.req ? 'Obligatorio' : 'Opcional'}
              </span>
              <span className="text-[11px] text-bsm-text-muted">{col.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
