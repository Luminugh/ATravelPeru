# Deploy en Vercel - ATravelPeru

## Configuración Completada ✅

El proyecto ha sido adaptado para desplegar en Vercel. La siguiente configuración ha sido implementada:

### Archivos Modificados:
- `astro.config.mjs` - Agregado adaptador de Vercel
- `package.json` - Scripts actualizados
- `vercel.json` - Configuración específica de Vercel *(nuevo)*
- `.vercelignore` - Archivos ignorados en deploy *(nuevo)*

### Pasos para Deploy:

#### 1. **Conectar a Vercel**
```bash
# Opción A: CLI de Vercel
npm install -g vercel
vercel

# Opción B: Dashboard
# Ir a https://vercel.com/import y conectar tu repositorio
```

#### 2. **Variables de Entorno**
En el dashboard de Vercel, agregar:
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_key
```

#### 3. **Deploy Automático**
- Push a `main` branch dispara automáticamente el deploy
- Preview automático en pull requests

### Características Habilitadas:
- ✅ Web Analytics (seguimiento de visitas)
- ✅ Image Optimization (optimización automática de imágenes)
- ✅ SSR híbrido (soporte para rutas dinámicas)
- ✅ Cache Headers optimizados

### URL de Producción:
Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`

### Comandos Locales:
```bash
npm run dev      # Desarrollo local (localhost:4321)
npm run build    # Build para producción
npm run preview  # Preview del build
```

### Verificar Deployment:
Después de conectar a Vercel, deberías ver el proceso de build en la consola.
El sitio estará listo en unos minutos.

---

**Nota**: Si tenías un dominio personalizado en GitHub Pages, puedes agregarlo en Vercel Settings → Domains.
