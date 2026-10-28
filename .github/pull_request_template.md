## Qué cambia

<!-- Una o dos frases. Enlaza el ticket de Jira: SCRUM-XX -->

## Cómo probarlo

<!-- Pasos concretos para que quien revise lo compruebe. Ejemplo:
1. `pnpm dev` con `API_MODE=mock`
2. Entrar como alumno (`valentina.r`) o familia (`familia@matefacil.pe`) e ir a ...
3. Esperado: ...
-->

## Capturas

<!-- Si cambia algo visible: antes / después, en móvil y escritorio. -->

## Checklist

- [ ] El CI pasa (lint, tipos, tests, build e imagen Docker)
- [ ] Probado en modo mock; si toca la API, también con `API_MODE=http`
- [ ] Si cambia `services/contracts.ts` o `services/http`: la tabla de endpoints del README sigue al día
- [ ] Sin secretos en el código ni en `.env.example`
