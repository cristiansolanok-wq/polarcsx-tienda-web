# AGENTS — AI agent instructions (idioma)

Purpose
- Provide minimal, actionable guidance so AI coding agents are productive immediately.

Idioma (language)
- Preferencia: Español. Responde en español por defecto.
- Usar inglés sólo cuando: quoting third-party error messages, library names, or when el usuario lo pida.

Behaviour / Rules for agents
- Antes de editar: buscar en el repositorio por archivos relevantes (tests, build files, README).
- Mantener cambios mínimos y conservadores; explicar suposiciones si modificas archivos críticos.
- Preguntar aclaraciones en español cuando falte información.
- En los commits/PRs: incluir descripción corta en español y pasos para reproducir.

Build & test discovery
- No se detectaron archivos de proyecto en el workspace. Si aparecen, usa comandos comunes:
  - Node.js: `npm test`, `npm run build`
  - Python: `pytest`, `python -m unittest`
  - .NET: `dotnet test`

Link, don't embed
- No duplicar documentación existente: enlaza al README o docs cuando estén disponibles.

Suggested next customizations
- Crear una skill de traducción/`idioma` para tareas de localización.
- Crear un hook que ejecute tests antes de proponer PRs.

If you want changes or a Spanish-first `.github/copilot-instructions.md`, tell me and I will create it.
