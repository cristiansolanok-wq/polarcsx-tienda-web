# Skill: idioma — ayuda para localización y traducciones

Objetivo
- Proveer pasos concretos para localizar la aplicación al español y mantener la consistencia de idioma.

Qué hace esta skill
- Busca cadenas de texto visibles en el código.
- Crea o actualiza archivos de locales (`locales/es.json`, `locales/es/` o `src/locales/es`).
- Genera propuestas de traducción en español que deben revisarse manualmente.
- Añade tests básicos para comprobar que las claves i18n existen.

Acciones recomendadas para el agente
- Detectar el framework (React/Vue/Node/Python). Si no se detecta, preguntar al usuario.
- Usar `i18next` o `react-intl` cuando proceda; para backend Python sugerir `gettext` o `babel`.
- Crear un archivo `locales/es.json` con todas las claves nuevas y un ejemplo mínimo.
- Añadir una tarea en el `README.md` describiendo cómo añadir/actualizar traducciones.

Restricciones
- No subir traducciones automáticas sin revisión humana.
- Mantener un glosario si se hacen cambios en terminología.

Pedir al usuario
- ¿Quieres que genere las traducciones automáticamente (borrador) o prefieres que solo cree las claves y archivos para que tú las rellenes?
