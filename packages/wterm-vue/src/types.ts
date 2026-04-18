import type { WTerm } from '@wterm/dom'

export interface TerminalProps {
  cols?: number
  rows?: number
  wasmUrl?: string
  theme?: string
  autoResize?: boolean
  cursorBlink?: boolean
  echo?: boolean
}

export interface TerminalInstance {
  write: (data: string | Uint8Array) => void
  resize: (cols: number, rows: number) => void
  focus: () => void
  readonly instance: WTerm | null
}
