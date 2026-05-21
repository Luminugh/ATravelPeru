# Documentacion basica del proyecto

## 1. Analisis del proyecto

### Estructura detectada
- `src/pages/api/` contiene los endpoints HTTP.
- `src/application/use-cases/` contiene la logica de orquestacion de casos de uso.
- `src/domain/` contiene tipos, errores y servicios puros.
- `src/infrastructure/` contiene repositorios y factories de Supabase.
- `src/lib/` conserva utilidades y flujo legado que aun usa parte del sitio publico.

### Como se manejan los endpoints
- Los endpoints de API instancian dependencias y delegan la ejecucion a un Use Case.
- La respuesta HTTP se arma en el endpoint, pero la logica principal vive fuera de el.
- Ejemplos claros: `src/pages/api/tours.ts`, `src/pages/api/admin/app-config.ts`.

### Como se accede a la base de datos
- El acceso a datos nuevo ocurre desde repositorios en `src/infrastructure/repositories/`.
- Los repositorios usan factories de Supabase en `src/infrastructure/supabase/`.
- Todavia existe flujo legado en `src/lib/supabase.ts`, `src/lib/catalog.ts` y `src/lib/cache.ts`.

### Donde esta la logica de negocio
- La logica principal esta en `src/application/use-cases/`.
- Reglas puras reutilizables estan en `src/domain/services/`.
- Los tipos de negocio viven en `src/domain/models/`.

### Patrones repetidos observados
- Instanciacion de repositorios y Use Cases dentro de endpoints.
- Formateo de precio y normalizacion de galeria en mas de un lugar.
- Manejo repetido de respuestas JSON y captura de errores.

### Arquitectura detectada
- Arquitectura incremental tipo Clean Architecture.
- Flujo principal: HTTP endpoint -> Use Case -> Repositorio -> Supabase.
- El sitio publico aun tiene una ruta con flujo legado para catalogo.

## 2. Problemas detectados

1. Persisten puntos de acoplamiento con codigo legado en `src/lib/`.
2. `src/pages/tours/index.astro` sigue leyendo catalogo desde `src/lib/catalog.ts`.
3. `src/lib/catalog.ts` y `src/lib/cache.ts` duplican parte del trabajo que ya hace la capa nueva.
4. `src/lib/supabase.ts` coexiste con factories nuevas y puede confundir la fuente de verdad.
5. Hay logica repetida de formateo y normalizacion que conviene centralizar mejor.
6. Algunos repositorios siguen lanzando `Error` generico cuando falta cliente Supabase.

## 3. Propuesta de solucion incremental

### Enfoque
- No rehacer todo el proyecto.
- Mover solo el flujo legado que sigue vivo hacia la capa nueva.
- Reducir duplicacion sin introducir abstracciones innecesarias.

### Archivos a modificar
- `src/pages/tours/index.astro`
- `src/lib/catalog.ts`
- `src/lib/cache.ts`
- `src/lib/supabase.ts`
- `src/infrastructure/repositories/SupabaseTourRepository.ts`

### Archivos a crear o mantener
- Mantener `src/application/use-cases/` como capa principal de orquestacion.
- Mantener `src/infrastructure/repositories/` como unica capa de acceso a datos nueva.

### Justificacion
- El cambio es compatible con el estilo actual del proyecto.
- Se conserva la separacion entre interfaz, caso de uso y datos.
- Se elimina codigo espagueti sin romper el sitio existente.

## 4. Direccion recomendada

1. Migrar `src/pages/tours/index.astro` para que consuma la capa nueva.
2. Eliminar `src/lib/catalog.ts` y `src/lib/cache.ts` cuando ya no tengan consumidores.
3. Dejar `src/lib/supabase.ts` solo si aun hay una necesidad real; si no, retirarlo o redirigirlo a la infraestructura nueva.
4. Centralizar utilidades repetidas en una sola capa para evitar duplicacion.

## 5. Estado actual resumido

- El backend ya esta bastante organizado por capas.
- La mayoria de los endpoints ya usa Use Cases.
- El principal pendiente de limpieza es el catalogo publico legado en `src/lib/` y su consumo desde `src/pages/tours/index.astro`.

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

