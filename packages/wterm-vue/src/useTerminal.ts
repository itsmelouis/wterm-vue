import type { ShallowRef } from 'vue'
import type { TerminalInstance } from './types'
import { shallowRef } from 'vue'

export interface UseTerminalReturn {
  terminalRef: ShallowRef<TerminalInstance | null>
  write: (data: string | Uint8Array) => void
  resize: (cols: number, rows: number) => void
  focus: () => void
}

export function useTerminal(): UseTerminalReturn {
  const terminalRef = shallowRef<TerminalInstance | null>(null)

  return {
    terminalRef,
    write: data => terminalRef.value?.write(data),
    resize: (cols, rows) => terminalRef.value?.resize(cols, rows),
    focus: () => terminalRef.value?.focus(),
  }
}
