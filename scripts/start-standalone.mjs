// Arranca el build de producción en local: `pnpm build && pnpm start`.
// Fija HOSTNAME a propósito: Git Bash/Windows lo define con el nombre de la máquina y el servidor
// standalone lo usa para enlazarse (si no, el contenido de la sesión no llega en streaming).
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const server = '.next/standalone/server.js';
if (!existsSync(server)) {
  console.error('Falta el build. Ejecuta primero: pnpm build');
  process.exit(1);
}

// El servidor standalone no lee .env.local por sí solo: se cargan aquí las variables locales.
const env = { ...process.env };
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) env[match[1]] = match[2];
  }
}
env.HOSTNAME = process.env.HOST ?? '127.0.0.1';
env.PORT = process.env.PORT ?? '3000';

console.log(`→ http://localhost:${env.PORT}`);
spawn(process.execPath, [server], { stdio: 'inherit', env }).on('exit', (code) => process.exit(code ?? 0));
