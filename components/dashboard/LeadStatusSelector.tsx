'use client'

import { useState } from 'react'
import { LEAD_STATUS_LABELS, getLeadStatusColor } from '@/lib/utils'
import type { LeadStatus } from '@/lib/types'

interface Props {
  leadId: string
  currentStatus: LeadStatus
}

const STATUSES: LeadStatus[] = ['new', 'contacted', 'negotiating', 'appointment', 'reserved', 'closed', 'lost', 'discarded']

export default function LeadStatusSelector({ leadId, currentStatus }: Props) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: LeadStatus) {
    if (next === status || loading) return
    setLoading(true)
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      setStatus(next)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          disabled={loading}
          className={`text-[10px] px-2 py-1 border transition-colors disabled:opacity-50
            ${s === status
              ? `badge ${getLeadStatusColor(s)} border-transparent`
              : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'
            }`}
        >
          {LEAD_STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
