// components/StatusBadge.tsx
import { getStatusColor, getStatusLabel, getStatusEmoji } from '@/lib/utils'
import type { StatusAbsen } from '@/types'

interface StatusBadgeProps {
  status: StatusAbsen
  showEmoji?: boolean
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, showEmoji = false, size = 'md' }: StatusBadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium border
      ${getStatusColor(status)}
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'}
    `}>
      {showEmoji && <span>{getStatusEmoji(status)}</span>}
      {getStatusLabel(status)}
    </span>
  )
}
