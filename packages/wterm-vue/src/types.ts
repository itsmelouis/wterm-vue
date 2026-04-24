import type { WTerm } from '@wterm/dom'

export interface TerminalProps {
  cols?: number
  rows?: number
  wasmUrl?: string
  theme?: string
  autoResize?: boolean
  cursorBlink?: boolean
  /**
   * Enable debug mode. Exposes a `DebugAdapter` on the underlying `WTerm`
   * instance (accessible via the exposed `instance` ref) for inspecting
   * escape sequences, cell data, render performance, and unhandled CSI
   * sequences. Init-only — changing after mount has no effect.
   */
  debug?: boolean
  echo?: boolean
}

export interface TerminalInstance {
  write: (data: string | Uint8Array) => void
  resize: (cols: number, rows: number) => void
  focus: () => void
  readonly instance: WTerm | null
}
