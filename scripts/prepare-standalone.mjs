// Copia los archivos estáticos dentro de .next/standalone para que el servidor mínimo
// (`node .next/standalone/server.js`) sea autosuficiente al subirlo al VPS.
import { cpSync, existsSync } from 'node:fs';

const target = '.next/standalone';
if (!existsSync(target)) process.exit(0);

cpSync('public', `${target}/public`, { recursive: true });
cpSync('.next/static', `${target}/.next/static`, { recursive: true });
console.log('✓ standalone listo: node .next/standalone/server.js');
