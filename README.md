# Aula virtual Mate Fácil — frontend (Next.js)

Frontend del aula virtual de Mate Fácil Academy, basado en el **prototipo B · Panel de estudio**
(`../aula-mate-facil-final/b`): barra lateral fija, panel ordenado y lección en pestañas, con la identidad
visual de la web (Bricolage Grotesque + Nunito, bordes gruesos azul marino, sombras sólidas, rosa principal)
y el logo oficial que usa la web en Astro.

El backend es una **API .NET** (otro equipo). Este proyecto es solo frontend: mientras la API no esté lista,
trabaja con datos de ejemplo en memoria (`API_MODE=mock`).

## Correr

Requisitos: Node ≥ 20.9 y pnpm (`corepack enable` lo activa con la versión de `packageManager`).

```bash
cp .env.example .env.local   # API_MODE=mock por defecto
pnpm install
pnpm dev                     # desarrollo → http://localhost:3000
```

Para probar el build de producción en local:

```bash
pnpm build
pnpm start                   # → http://localhost:3000 (lee .env.local y fija HOSTNAME=127.0.0.1)
```

Datos de prueba (solo modo mock; también aparecen en la pantalla de ingreso). Guía completa con respuestas y qué probar: [docs/CREDENCIALES-PRUEBA.md](docs/CREDENCIALES-PRUEBA.md).

| Cuenta  | Usuario                | Clave              |
|---------|------------------------|--------------------|
| Alumno  | `valentina.r`          | 🦊 🚀 🍕 (figuras) |
| Familia | `familia@matefacil.pe` | `matefacil123`     |

| Script           | Qué hace                                                  |
|------------------|-----------------------------------------------------------|
| `pnpm dev`       | Desarrollo (Turbopack)                                    |
| `pnpm build`     | Build de producción + prepara `.next/standalone`          |
| `pnpm start`     | Sirve el build de producción en local (puerto 3000)       |
| `pnpm typecheck` | Genera tipos de rutas + TypeScript estricto               |
| `pnpm lint`      | ESLint (reglas de Next y de React)                        |
| `pnpm test`      | Pruebas unitarias (Vitest)                                |

## Pantallas y funciones

| Ruta            | Rol     | Contenido |
|-----------------|---------|-----------|
| `/ingreso`      | —       | Alumno con usuario + 3 figuras secretas; familia con correo. Límite de intentos. |
| `/inicio`       | alumno  | Saludo según la hora local, «continuar» por ruta, clases de la semana, tareas, progreso, avisos. |
| `/ruta`         | alumno  | 4 niveles de Matemáticas, frecuencia de clases, laboratorios del año, temarios. |
| `/lecciones`    | alumno  | Selector Matemáticas / Laboratorio · clase grabada con capítulos · práctica · materiales · entrega del lab · tutor IA. |
| `/evaluaciones` | alumno  | Prueba de entrada, semanales **con límite de tiempo** y calificación por competencia; el tutor se pausa. |
| `/clases`       | alumno  | Calendario semanal en la zona horaria de la familia, entregas, materiales, clases en vivo, asistencia. |
| `/logros`       | alumno  | Estrellas, insignias, portafolio (enlace para compartir), certificados con código verificable. |
| `/familia`      | familia | Por hijo: resumen, evaluaciones, asistencia, proyectos, certificados, mensajes, membresía. Informe imprimible/PDF. |

Interactividad: estrellas que suben en vivo en la cabecera, avisos con marcado de leídos, menú de perfil,
toasts, pestañas accesibles con teclado, video con capítulos, práctica con corrección inmediata,
chat del tutor, entregas en la misma tarjeta, mensajes con UI optimista.

## Modo oscuro

Botón 🌙/☀️ en la cabecera (y flotante en el ingreso). Misma convención que la web en Astro: se guarda en
`localStorage` (`mf-tema` = `claro` | `oscuro`); sin elección, sigue al sistema y sus cambios en vivo.

- Un script en `<head>` aplica `data-theme` **antes del primer pintado** → sin destello y sin volver dinámico el layout.
- Los colores son tokens (`--sup`, `--tx`, `--linea`, `--contraste`…) en `app/globals.css`; el modo oscuro solo
  redefine esos tokens en `:root[data-theme='dark']`. Para colores nuevos, usar siempre tokens, nunca `#fff`.
- El logo va sobre una «pegatina» blanca en oscuro; el informe impreso/PDF siempre sale en claro.

## Arquitectura

```
src/
  app/                    Rutas (App Router). Solo composición: sin lógica de negocio.
    (auth)/ingreso        Pantalla de ingreso
    (alumno)/…            Área del alumno (layout con barra lateral)
    (familia)/familia     Panel de la familia
  features/<dominio>/     Código por funcionalidad: components/, actions.ts (Server Actions)
    auth  account  dashboard  learning  lessons  assessments  schedule  achievements  family
  components/             UI compartida (ui/, layout/, brand/)
  services/               Capa de datos
    contracts.ts          Interfaces (contrato con .NET)
    http/                 Implementación contra la API .NET
    mock/                 Implementación en memoria + lógica simulada (corrección, tutor)
    index.ts              Elige mock | http según API_MODE
  server/                 Solo servidor: sesión (cookies), DAL, utilidades de Server Actions
  lib/                    Utilidades puras (http, tiempo, fracciones, rate limit)
  hooks/                  Hooks de cliente (reloj, cuenta regresiva, enfriamiento)
  types/domain.ts         Modelo de dominio (DTOs)
  proxy.ts                Redirecciones optimistas por cookie (antes «middleware»)
```

Principios:

- **BFF (backend for frontend).** El navegador nunca habla con la API .NET. Los Server Components y las
  Server Actions de Next llaman a `services`, que adjunta el token desde una cookie `httpOnly`.
- **Inversión de dependencias.** Pantallas y acciones dependen de `services/contracts.ts`; cambiar de mock a la
  API real es `API_MODE=http`, sin tocar componentes.
- **DAL único** (`server/auth/dal.ts`): resuelve el usuario una vez por petición (`React.cache`), y cada
  Server Action vuelve a verificar sesión y rol (el proxy solo hace comprobaciones optimistas).
- **Las respuestas no llegan al navegador.** Ejercicios y evaluaciones viajan sin solución; se corrige en el servidor.
- **Validación en el borde.** Toda entrada de Server Actions se recorta, valida y limita.

## Conectar con la API .NET

1. `API_MODE=http` y `API_BASE_URL=https://api…/api` en `.env.local`.
2. La API debe implementar los endpoints de `src/services/http/index.ts` y devolver los tipos de
   `src/types/domain.ts` (JSON camelCase, fechas ISO 8601 UTC). Resumen:

| Método | Ruta | Devuelve |
|--------|------|----------|
| POST | `/auth/student/login` · `/auth/family/login` | `{ token, user, expiresIn }` (401 si falla) |
| GET  | `/auth/me` | `SessionUser` |
| GET  | `/students/me` · `/dashboard` · `/learning-path` · `/achievements` | perfil y vistas |
| GET  | `/students/me/lessons/current?track=math\|lab` | `{ lesson, unit }` |
| POST | `/practice/exercises/{id}/check` | `AnswerCheck` |
| POST | `/tutor/ask` | `TutorReply` |
| GET  | `/students/me/evaluations` | `EvaluationSummary[]` |
| POST | `/evaluations/{id}/attempts` | `QuizAttempt` (el servidor fija `deadline`) |
| POST | `/evaluations/attempts/{id}/submit` | `QuizResult` (marca `late` si llega tarde) |
| GET  | `/students/me/schedule` | `Schedule` |
| POST | `/tasks/{id}/submissions` | `Task` |
| GET/POST | `/families/me/children` · `/messages` · `/membership` | vistas de familia |
| GET/POST | `/notifications` · `/notifications/read-all` | avisos |

3. Errores: usar códigos HTTP estándar (401, 403, 404, 422, 429 con `Retry-After`); el frontend los traduce a
   mensajes amables (`lib/http/errors.ts`).
4. Archivos de entregas: la API debe dar URLs firmadas para subir directo al almacenamiento.

## Rendimiento (VPS con poca CPU/GPU)

- **Server Components por defecto.** Solo las piezas interactivas envían JavaScript.
- **Cache Components + Partial Prerendering.** Cada ruta tiene un armazón estático prerenderizado
  (llega al instante); solo la parte de la sesión se calcula por petición y llega en streaming.
- **Mutaciones sin re-render del servidor.** Las Server Actions devuelven datos y el cliente actualiza su estado.
- **Temporizadores mínimos.** Un solo reloj por componente que **se pausa con la pestaña oculta**; la cuenta
  regresiva usa la hora real (no se desfasa); las clases se revisan cada 30 s, no cada segundo.
- **GPU:** sin `blur`, `backdrop-filter`, sombras difusas ni animaciones infinitas. Solo se animan
  `transform`/`opacity`; la barra del video usa `scaleX`. Se respeta `prefers-reduced-motion`.
- **Servidor:** `output: 'standalone'`, optimización de imágenes desactivada (el logo ya es WebP: sin `sharp`
  en tiempo real), fuentes variables autoalojadas, `Intl.DateTimeFormat` reutilizados, memoria acotada en
  los limitadores y en el chat del tutor. Detrás de Nginx/Caddy con compresión: `NEXT_COMPRESS=false`.

## Límites de tiempo y de frecuencia

| Dónde | Regla |
|-------|-------|
| Peticiones a .NET | Límite por petición (`API_TIMEOUT_MS`, 8 s; tutor 20 s) + 1 reintento solo en GET ante 502/503/504 |
| Ingreso | 5 intentos / 5 min por IP y tipo de cuenta; mensaje con intentos restantes y tiempo de espera |
| Tutor IA | 12 mensajes / min por alumno (servidor) + enfriamiento de 1,2 s en el navegador; 300 caracteres máx. |
| Práctica | 40 comprobaciones / min por alumno |
| Mensajes y entregas | 6 mensajes / min; 10 entregas / min; máx. 5 archivos de 50 MB |
| Evaluaciones | Plazo fijado por el servidor; cuenta regresiva, aviso en el último minuto, envío automático al llegar a 0; el servidor marca `late` pasada la gracia de 10 s |
| Clases en vivo | «Entrar» se habilita 10 min antes del inicio y se cierra al terminar |
| Sesión | Cookie `httpOnly` de 8 h; token vencido → se borran cookies y vuelve al ingreso |

Los limitadores están en memoria (`lib/rate-limit.ts`): sirven para **una** instancia. Con varias, cambiar el
almacenamiento a Redis manteniendo la interfaz `RateLimiter`.

## Despliegue en VPS

```bash
docker build -t aula-mf .
docker run -d -p 3000:3000 --env-file .env.production --restart unless-stopped aula-mf
```

Sin Docker: `pnpm install --frozen-lockfile && pnpm build`, copiar `.next/standalone/` al servidor y ejecutar
`HOSTNAME=0.0.0.0 PORT=3000 node server.js` (con PM2 o systemd).

> **Importante:** el servidor standalone usa la variable `HOSTNAME` para enlazarse. Si queda con el nombre de
> la máquina (Git Bash en Windows lo define así), el contenido de la sesión no se transmite. Fíjala siempre
> (`0.0.0.0` en el VPS, `127.0.0.1` en local).

Con varias instancias, definir `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` igual en todas.
