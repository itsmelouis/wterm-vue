<script setup lang="ts">
import { ref } from "vue";
import { Terminal, useTerminal, type WTerm } from "@itsmelouis/wterm-vue";

const { terminalRef, write, focus } = useTerminal();

const theme = ref("");
const title = ref("wterm-vue");

let line = "";
let cols = 80;

const BANNER = "\x1b[1;36m" + String.raw`
           __                                                      
__  _  ___/  |_  ___________  _____           ___  ____ __   ____  
\ \/ \/ /\   __\/ __ \_  __ \/     \   ______ \  \/ /  |  \_/ __ \ 
 \     /  |  | \  ___/|  | \/  Y Y  \ /_____/  \   /|  |  /\  ___/ 
  \/\_/   |__|  \___  >__|  |__|_|  /           \_/ |____/  \___  >
                    \/            \/                            \/ 
`.replace(/\n/g, "\r\n") + "\x1b[0m\r\n \x1b[2m A Vue 3 terminal component powered by @wterm/dom\x1b[0m\r\n";

const PROMPT = "\x1b[1;32m$ \x1b[0m";

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () =>
    [
      "",
      "  \x1b[1mAvailable commands:\x1b[0m",
      "",
      "  \x1b[33mhelp\x1b[0m       Show this message",
      "  \x1b[33mclear\x1b[0m      Clear the screen",
      "  \x1b[33mcolors\x1b[0m     Display ANSI color palette",
      "  \x1b[33mecho\x1b[0m       Echo arguments back",
      "  \x1b[33mdate\x1b[0m       Print current date/time",
      "  \x1b[33mwhoami\x1b[0m     Who are you?",
      "  \x1b[33mtheme\x1b[0m      Show or set theme (default, solarized-dark, monokai, light)",
      "",
    ].join("\r\n"),

  clear: () => "\x1b[2J\x1b[H",

  colors: () =>
    [
      "",
      "  \x1b[31m██\x1b[0m \x1b[32m██\x1b[0m \x1b[33m██\x1b[0m \x1b[34m██\x1b[0m \x1b[35m██\x1b[0m \x1b[36m██\x1b[0m \x1b[37m██\x1b[0m",
      "  \x1b[1;31m██\x1b[0m \x1b[1;32m██\x1b[0m \x1b[1;33m██\x1b[0m \x1b[1;34m██\x1b[0m \x1b[1;35m██\x1b[0m \x1b[1;36m██\x1b[0m \x1b[1;37m██\x1b[0m",
      "",
      "  \x1b[1mbold\x1b[0m \x1b[3mitalic\x1b[0m \x1b[4munderline\x1b[0m \x1b[7mreverse\x1b[0m \x1b[9mstrike\x1b[0m",
      "  \x1b[38;2;255;128;0m24-bit truecolor orange\x1b[0m",
      "",
    ].join("\r\n"),

  echo: (args) => `\r\n${args.join(" ")}`,

  date: () => `\r\n  ${new Date().toLocaleString()}`,

  whoami: () => "\r\n  \x1b[1;35mguest\x1b[0m@wterm-vue",

  theme: (args) => {
    const valid = ["default", "solarized-dark", "monokai", "light"];
    if (!args.length) {
      return `\r\n  current: \x1b[1m${theme.value || "default"}\x1b[0m`;
    }
    const t = args[0] ?? "";
    if (!valid.includes(t)) {
      return `\r\n  \x1b[31munknown theme:\x1b[0m ${t}\r\n  available: ${valid.join(", ")}`;
    }
    theme.value = t === "default" ? "" : t;
    return `\r\n  switched to \x1b[1m${t}\x1b[0m`;
  },
};

function prompt() {
  write(PROMPT);
}

function exec(input: string) {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0] ?? "";
  const args = parts.slice(1);

  if (!cmd) {
    prompt();
    return;
  }

  const handler = COMMANDS[cmd];
  if (handler) {
    const output = handler(args);
    write(output);
  } else {
    write(`\r\n  \x1b[31mcommand not found:\x1b[0m ${cmd}`);
  }

  write("\r\n");
  prompt();
}

function onReady(wt: WTerm) {
  cols = wt.cols;
  write(BANNER);
  write("\r\n  Type \x1b[1mhelp\x1b[0m for available commands.\r\n\r\n");
  prompt();
  focus();
}

function onData(data: string) {
  for (const ch of data) {
    if (ch === "\r" || ch === "\n") {
      write("\r\n");
      exec(line);
      line = "";
    } else if (ch === "\x7f" || ch === "\b") {
      if (line.length > 0) {
        line = line.slice(0, -1);
        write("\b \b");
      }
    } else if (ch === "\x03") {
      // Ctrl+C
      line = "";
      write("^C\r\n");
      prompt();
    } else if (ch === "\x15") {
      // Ctrl+U — erase line
      const len = line.length;
      line = "";
      write(`\x1b[${len}D\x1b[K`);
    } else if (ch === "\x1b") {
      // skip escape sequences (arrow keys etc.)
    } else if (ch >= " ") {
      line += ch;
      write(ch);
    }
  }
}

function onTitle(t: string) {
  title.value = t;
}

function onResize(c: number) {
  cols = c;
}
</script>

<template>
  <h1>{{ title }}</h1>

  <div class="toolbar">
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
      :echo="false"
      :theme="theme || undefined"
      :cursor-blink="true"
      @ready="onReady"
      @data="onData"
      @title="onTitle"
      @resize="onResize"
    />
  </div>
</template>
