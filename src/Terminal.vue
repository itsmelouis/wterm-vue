<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
  type CSSProperties,
} from "vue";
import { WTerm } from "@wterm/dom";
import type { TerminalProps, TerminalInstance } from "./types";

const props = withDefaults(defineProps<TerminalProps>(), {
  cols: 80,
  rows: 24,
  autoResize: false,
  cursorBlink: false,
  echo: true,
});

const emit = defineEmits<{
  data: [data: string];
  title: [title: string];
  resize: [cols: number, rows: number];
  ready: [wt: WTerm];
  error: [err: unknown];
}>();

const rootEl = useTemplateRef<HTMLDivElement>("rootEl");
const wterm = shallowRef<WTerm | null>(null);

const rootClass = computed(() => {
  const classes: string[] = [];
  if (props.theme) classes.push(`theme-${props.theme}`);
  return classes.join(" ") || undefined;
});

const rootStyle = computed<CSSProperties | undefined>(() => {
  if (props.autoResize) return undefined;
  return { height: `${props.rows * 17 + 24}px` };
});

onMounted(async () => {
  if (!rootEl.value) return;
  const wt = new WTerm(rootEl.value, {
    cols: props.cols,
    rows: props.rows,
    wasmUrl: props.wasmUrl,
    autoResize: props.autoResize,
    cursorBlink: props.cursorBlink,
    onData: (data: string) => {
      emit("data", data);
      if (props.echo) wterm.value?.write(data);
    },
    onTitle: (title: string) => emit("title", title),
    onResize: (c: number, r: number) => emit("resize", c, r),
  });
  wterm.value = wt;
  try {
    await wt.init();
    emit("ready", wt);
  } catch (err) {
    emit("error", err);
  }
});

onBeforeUnmount(() => {
  wterm.value?.destroy();
  wterm.value = null;
});

watch(
  () => [props.cols, props.rows] as const,
  ([cols, rows]) => {
    const wt = wterm.value;
    if (!wt?.bridge || props.autoResize) return;
    if (wt.cols !== cols || wt.rows !== rows) wt.resize(cols, rows);
  },
);

watch(
  () => props.cursorBlink,
  (blink) => {
    const wt = wterm.value;
    if (!wt?.bridge) return;
    wt.element.classList.toggle("cursor-blink", !!blink);
  },
);

defineExpose<TerminalInstance>({
  write(data) {
    wterm.value?.write(data);
  },
  resize(c, r) {
    wterm.value?.resize(c, r);
  },
  focus() {
    wterm.value?.focus();
  },
  get instance() {
    return wterm.value;
  },
});
</script>

<template>
  <div
    ref="rootEl"
    role="textbox"
    aria-label="Terminal"
    aria-multiline="true"
    aria-roledescription="terminal"
    :class="rootClass"
    :style="rootStyle"
  />
</template>
