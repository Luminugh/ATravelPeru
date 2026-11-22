# Arquitectura del proyecto

## Capas y dependencias

- `src/pages/` contiene las rutas Astro y traduce solicitudes/respuestas HTTP.
- `src/application/use-cases/` contiene operaciones de aplicación y depende de contratos del dominio.
- `src/domain/` contiene modelos, contratos de repositorio, errores y servicios puros.
- `src/infrastructure/` implementa los contratos con Supabase y compone las dependencias de ejecución.
- `src/lib/` contiene configuración compartida de la interfaz; no debe acceder directamente a la base de datos.

## Flujo del catálogo

Las páginas públicas de listado y detalle y el endpoint `/api/tours` comparten `tourUseCases` desde `src/infrastructure/composition.ts`. El flujo es `página/API -> caso de uso -> ITourRepository -> SupabaseTourRepository -> Supabase`.

El cliente de Supabase de lectura se crea en `src/infrastructure/supabase/SupabaseClientFactory.ts`. El mapeo de precio y galería vive en el repositorio para evitar lecturas alternativas con formatos distintos. El caché de archivo del catálogo fue retirado porque escribía en el sistema de archivos durante solicitudes de servidor y podía servir datos obsoletos entre instancias.

## Límites actuales

- Algunas operaciones administrativas todavía reciben un `SupabaseClient` directamente en sus casos de uso. Conviene migrarlas gradualmente a repositorios si aumenta su complejidad o se necesitan pruebas aisladas.
- Los endpoints aún repiten parte del formato JSON y del manejo de errores; puede extraerse una capa HTTP común cuando se estandarice el contrato de respuestas.
- El proyecto usa Astro en salida `server` con adaptador Vercel. La protección de origen de Astro queda habilitada por defecto.

## Cambios importantes recientes (21-05-2026)

Se implementaron varias mejoras y correcciones enfocadas en la persistencia de la galería, la experiencia de usuario en móviles y ajustes visuales:

- Persistencia y normalización de galería
	- La base de datos ahora mantiene `tour_media` y `tours.galeria` (JSONB) sincronizada vía triggers.
	- Normalización en la capa de lectura para aceptar objetos con `imagen`, `url` o `publicUrl`.
	- Archivos modificados: `src/infrastructure/repositories/SupabaseTourRepository.ts`, `src/application/use-cases/CreateTourUseCase.ts`, `src/application/use-cases/UpdateTourUseCase.ts`.

- Interfaz pública: listado y detalle de tours
	- Página de listado `src/pages/tours/index.astro`: se añadió un `tours-page-shell` y un `tours-top-spacer` para corregir solapamiento con el header fijo y márgenes laterales.
	- Página de detalle `src/pages/tours/[id].astro`: nueva ficha de producto con hero, miniaturas y panel de reserva refactorizados.
	- Archivos modificados: `src/pages/tours/index.astro`, `src/pages/tours/[id].astro`.

- Comportamiento responsive y carrusel móvil
	- La imagen principal del tour fue convertida a un carrusel horizontal con `scroll-snap` y auto-scroll en móviles (reanudación tras interacción).
	- Miniaturas se convierten a fila horizontal en móvil y sincronizan con el carrusel.
	- Reglas CSS en `src/styles/pages/tours.scss` ajustadas para grid, paneles y botones en pantallas pequeñas.

- Botón WhatsApp
	- El CTA de WhatsApp se redujo (padding, icono y tipografía) para evitar que ocupase demasiado espacio en la ficha.
	- Selector principal: `.btn-cta` y `.btn-icon` en `src/styles/pages/tours.scss`.

- Build y validación
	- `npm run build` se ejecutó y pasó correctamente tras los cambios.

## Cómo hacer commit y push del README (desde tu entorno local)

Ejecuta los siguientes comandos en la raíz del repositorio:

```bash
git add README.md
git commit -m "docs: document recent gallery, responsive and UI changes"
git push
```

Si tu entorno requiere autenticación (token/SSH), asegúrate de tener las credenciales configuradas antes de hacer `git push`.

Si quieres que yo intente el `git commit` y `git push` desde aquí, dímelo y lo ejecuto ahora (puede pedir autenticación en tu máquina).

