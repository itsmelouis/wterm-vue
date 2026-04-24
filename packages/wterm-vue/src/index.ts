export { default as Terminal } from './Terminal.vue'
export type { TerminalInstance, TerminalProps } from './types'
export { useTerminal, type UseTerminalReturn } from './useTerminal'
export {
  useWebSocketTransport,
  type UseWebSocketTransportOptions,
  type UseWebSocketTransportReturn,
} from './useWebSocketTransport'
export * from '@wterm/dom'
