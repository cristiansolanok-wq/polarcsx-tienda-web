# GitHub Copilot Instructions — Configuración en Español

Propósito
- Indicar a los agentes AI que el proyecto debe configurarse y documentarse preferentemente en español.

Reglas principales
- Idioma por defecto: Español. Responder y comentar en español salvo que sea necesario citar mensajes de error o nombres de librerías en inglés.
- Al cambiar texto visible en la UI: siempre añadir traducción en `locales/es.*` o `i18n` según el proyecto.
- Crear nuevas claves i18n en lugar de sobrescribir texto literal.

Flujo recomendado para cambios relacionados con idioma
1. Buscar strings de interfaz: `grep -R "<" -n src || rg "TODO"` (ajustar según stack).
2. Añadir claves i18n y archivos de `locales/es.json` o `locales/es/`.
3. Ejecutar linters y tests locales antes de proponer PR: `npm test`, `pytest`, etc.
4. Incluir en el PR: resumen en español, archivos afectados y pasos para probar la localización.

Comprobaciones de calidad
- No introducir traducciones automáticas sin revisión humana.
- Mantener consistencia terminológica: usar glosario si existe (`docs/glossary.md`).

Si el repo tiene un stack específico (React, Vue, Django, Flask, etc.), adapta las acciones anteriores al framework y avisa si necesitas plantillas.
