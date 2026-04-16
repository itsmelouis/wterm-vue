<script setup lang="ts">
import { ref } from "vue";
import { Terminal, useTerminal, type WTerm } from "@itsmelouis/wterm-vue";

const { terminalRef, write, focus } = useTerminal();

const theme = ref("");
const title = ref("wterm-vue");
const bytesIn = ref(0);

function onReady(wt: WTerm) {
  write("\x1b[1;32mwelcome to @itsmelouis/wterm-vue\x1b[0m\r\n");
  write(`grid: ${wt.cols}x${wt.rows}\r\n`);
  write("type something, or use the buttons above.\r\n\r\n");
  focus();
}

function onData(data: string) {
  bytesIn.value += data.length;
}

function onTitle(t: string) {
  title.value = t;
}

function demoColors() {
  const lines = [
    "\x1b[31mred\x1b[0m \x1b[32mgreen\x1b[0m \x1b[33myellow\x1b[0m \x1b[34mblue\x1b[0m \x1b[35mmagenta\x1b[0m \x1b[36mcyan\x1b[0m",
    "\x1b[1mbold\x1b[0m \x1b[3mitalic\x1b[0m \x1b[4munderline\x1b[0m \x1b[7mreverse\x1b[0m",
    "\x1b[38;2;255;128;0m24-bit truecolor orange\x1b[0m",
    "",
  ];
  write(lines.join("\r\n"));
}

function clearScreen() {
  write("\x1b[2J\x1b[H");
}
</script>

<template>
  <h1>{{ title }}</h1>

  <div class="toolbar">
    <button @click="demoColors">colors</button>
    <button @click="clearScreen">clear</button>
    <select v-model="theme">
      <option value="">default</option>
      <option value="solarized-dark">solarized-dark</option>
      <option value="monokai">monokai</option>
      <option value="light">light</option>
    </select>
  </div>

  <div class="terminal-wrap">
    <Terminal
      ref="terminalRef"
      :cols="80"
      :rows="24"
      :theme="theme || undefined"
      :cursor-blink="true"
      @ready="onReady"
      @data="onData"
      @title="onTitle"
    />
    <p class="status">bytes typed: {{ bytesIn }}</p>
  </div>
</template>
