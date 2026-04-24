import type { WebSocketTransportOptions } from '@wterm/dom'
import type { MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import type { TerminalInstance } from './types'
import { WebSocketTransport } from '@wterm/dom'
import {
  getCurrentScope,
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'

export interface UseWebSocketTransportOptions
  extends Omit<WebSocketTransportOptions, 'url'> {
  /**
   * Optional terminal ref. When provided, incoming WebSocket data is
   * automatically written to the terminal via `wt.write(data)`.
   *
   * You still need to forward user input by binding the terminal's `@data`
   * event to `send` — this preserves the Vue event flow and lets consumers
   * intercept input if needed.
   */
  terminal?: MaybeRefOrGetter<TerminalInstance | null | undefined>
  /**
   * Open the connection immediately on mount when `url` is provided.
   * Default `true`. Set to `false` to call `open()` manually later.
   */
  immediate?: boolean
}

export interface UseWebSocketTransportReturn {
  /** The underlying transport (shallow ref — `null` during SSR). */
  transport: Readonly<ShallowRef<WebSocketTransport | null>>
  /** Reactive connection state, updated via the transport's open/close callbacks. */
  connected: Readonly<Ref<boolean>>
  /** Send data to the remote PTY. Buffered if not yet connected. */
  send: (data: string | Uint8Array) => void
  /** Open (or reopen at a new URL). */
  open: (url?: string) => void
  /** Close the connection and disable auto-reconnect. */
  close: () => void
}

/**
 * Idiomatic Vue wrapper around `WebSocketTransport` from `@wterm/dom`.
 *
 * Handles the transport lifecycle (create on first call, destroy on scope
 * dispose), exposes a reactive `connected` flag, and optionally wires
 * incoming data to a `<Terminal>` ref automatically.
 *
 * @example
 * ```vue
 * <script setup>
 * import { Terminal, useTerminal, useWebSocketTransport } from '@itsmelouis/wterm-vue'
 *
 * const { terminalRef } = useTerminal()
 * const { send, connected } = useWebSocketTransport('ws://localhost:8080/pty', {
 *   terminal: terminalRef,
 * })
 * </script>
 *
 * <template>
 *   <span>{{ connected ? 'online' : 'offline' }}</span>
 *   <Terminal ref="terminalRef" :echo="false" @data="send" />
 * </template>
 * ```
 */
export function useWebSocketTransport(
  url?: MaybeRefOrGetter<string | undefined>,
  options: UseWebSocketTransportOptions = {},
): UseWebSocketTransportReturn {
  const {
    terminal,
    immediate = true,
    reconnect,
    maxReconnectDelay,
    onData,
    onOpen,
    onClose,
    onError,
  } = options

  const transport = shallowRef<WebSocketTransport | null>(null)
  const connected = ref(false)

  if (typeof window !== 'undefined') {
    const wt = new WebSocketTransport({
      reconnect,
      maxReconnectDelay,
      onOpen: () => {
        connected.value = true
        onOpen?.()
      },
      onClose: () => {
        connected.value = false
        onClose?.()
      },
      onError: (event) => {
        onError?.(event)
      },
      onData: (data) => {
        const term = toValue(terminal)
        term?.write(data)
        onData?.(data)
      },
    })
    transport.value = wt

    if (immediate) {
      const resolved = toValue(url)
      if (resolved)
        wt.connect(resolved)
    }

    watch(
      () => toValue(url),
      (next, prev) => {
        if (!next || next === prev)
          return
        wt.connect(next)
      },
    )

    if (getCurrentScope()) {
      onScopeDispose(() => {
        wt.close()
        transport.value = null
      })
    }
  }

  return {
    transport,
    connected: readonly(connected),
    send: (data) => {
      transport.value?.send(data)
    },
    open: (nextUrl) => {
      const t = transport.value
      if (!t)
        return
      const resolved = nextUrl ?? toValue(url)
      if (!resolved)
        return
      t.connect(resolved)
    },
    close: () => {
      transport.value?.close()
    },
  }
}
