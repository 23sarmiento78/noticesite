# Configuración de GitHub Actions para Actualización Automática

## 🚀 Configuración Automática

Este sistema utiliza GitHub Actions para actualizar automáticamente el archivo `articulos-list.json` cada vez que se añade un nuevo artículo a la carpeta `articulos/`.

## 📋 Requisitos Previos

1. **Repositorio en GitHub**: Tu proyecto debe estar en un repositorio de GitHub
2. **Branch principal**: El workflow está configurado para la branch `main`
3. **Permisos de escritura**: El workflow necesita permisos para hacer commit y push

## 🔧 Configuración de Permisos

### 1. Habilitar Permisos de Workflow

Ve a tu repositorio en GitHub:
1. **Settings** → **Actions** → **General**
2. En "Workflow permissions", selecciona: **"Read and write permissions"**
3. Marca la casilla: **"Allow GitHub Actions to create and approve pull requests"**
4. Haz clic en **Save**

### 2. Configurar Token de Acceso (Opcional)

Si tienes problemas con los permisos, puedes crear un token personal:

1. **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token** → **Generate new token (classic)**
3. Dale un nombre como "Auto-update articles"
4. Selecciona los scopes: `repo` (todos los permisos del repo)
5. Copia el token generado

Luego añade el token como secreto:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Nombre: `GH_TOKEN`
4. Valor: El token que copiaste

## 📁 Estructura de Archivos

El sistema requiere estos archivos:

```
.github/
  workflows/
    update-articles-json.yml    # Workflow de GitHub Actions
update-json-local.js           # Script para actualizar JSON
articulos-list.json            # Lista de artículos (se actualiza automáticamente)
articulos/                     # Carpeta con artículos HTML
```

## 🔄 Cómo Funciona

1. **Detección**: Cuando se hace push a la branch `main` con cambios en `articulos/**`
2. **Ejecución**: GitHub Actions ejecuta el workflow automáticamente
3. **Procesamiento**: El script `update-json-local.js` lee todos los archivos HTML
4. **Actualización**: Genera un nuevo `articulos-list.json` con metadatos
5. **Commit**: Hace commit y push automático del archivo actualizado

## 🧪 Prueba del Sistema

### 1. Añadir un Artículo de Prueba

Crea un archivo HTML en la carpeta `articulos/`:

```html
<!-- articulos/articulo-prueba-2025-01-27.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Artículo de Prueba - HGARUNA NEWS</title>
    <meta name="description" content="Este es un artículo de prueba para verificar el sistema automático">
</head>
<body>
    <h1>Artículo de Prueba</h1>
    <p>Contenido del artículo...</p>
</body>
</html>
```

### 2. Hacer Commit y Push

```bash
git add articulos/articulo-prueba-2025-01-27.html
git commit -m "Añadir artículo de prueba"
git push origin main
```

### 3. Verificar el Workflow

1. Ve a tu repositorio en GitHub
2. Pestaña **Actions**
3. Deberías ver el workflow "Actualizar Lista de Artículos" ejecutándose
4. Una vez completado, verifica que `articulos-list.json` se actualizó

## 🔍 Monitoreo

### Ver Logs del Workflow

1. **Actions** → **Actualizar Lista de Artículos**
2. Haz clic en el último run
3. Revisa los logs de cada paso

### Verificar Archivo JSON

El archivo `articulos-list.json` debería verse así:

```json
{
  "articles": [
    {
      "fileName": "articulo-prueba-2025-01-27.html",
      "title": "Artículo de Prueba",
      "description": "Este es un artículo de prueba para verificar el sistema automático",
      "imageUrl": "/assets/img/ai-article-default.jpg",
      "url": "/articulos/articulo-prueba-2025-01-27.html",
      "date": "2025-01-27",
      "isAI": true
    }
  ],
  "lastUpdated": "2025-01-27T10:30:00.000Z",
  "totalArticles": 1
}
```

## 🛠️ Solución de Problemas

### Error: "Permission denied"

**Solución**: Verifica que los permisos de workflow estén habilitados (paso 1 de configuración)

### Error: "Workflow not triggered"

**Solución**: Verifica que:
- El archivo esté en la carpeta `articulos/`
- El push sea a la branch `main`
- El archivo tenga extensión `.html`

### Error: "Script not found"

**Solución**: Verifica que `update-json-local.js` esté en la raíz del repositorio

### Workflow no se ejecuta

**Solución**: 
1. Ve a **Actions** → **Actualizar Lista de Artículos**
2. Haz clic en **Run workflow** (botón azul)
3. Selecciona la branch `main`
4. Haz clic en **Run workflow**

## 📝 Notas Importantes

- **Frecuencia**: El workflow se ejecuta solo cuando hay cambios en `articulos/**`
- **Orden**: Los artículos se ordenan por fecha (más recientes primero)
- **Metadatos**: Se extraen automáticamente del HTML cuando es posible
- **Fallback**: Si no hay metadatos, se generan desde el nombre del archivo
- **Imagen**: Se usa una imagen por defecto si no hay og:image

## 🔗 Integración con Piper

Para que funcione con tu flujo de Piper:

1. **Commit automático**: Asegúrate de que Piper haga commit y push de los nuevos artículos
2. **Estructura de archivos**: Los artículos deben guardarse en `articulos/nombre-archivo-YYYY-MM-DD.html`
3. **Metadatos**: Incluye `<title>` y `<meta name="description">` en los artículos HTML

## ✅ Verificación Final

Para verificar que todo funciona:

1. Añade un artículo HTML a `articulos/`
2. Haz commit y push
3. Ve a **Actions** y verifica que el workflow se ejecute
4. Verifica que `articulos-list.json` se actualice
5. En tu sitio web, verifica que el artículo aparezca en la sección "Artículos Generados por IA"

¡El sistema debería funcionar automáticamente desde ahora! 🎉 