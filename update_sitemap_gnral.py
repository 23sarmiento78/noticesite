import requests
import xml.etree.ElementTree as ET
import os
import logging
import re
from datetime import datetime
from urllib.parse import urlparse
from typing import List, Dict, Optional

# --- CONFIGURACIÓN ---
# URL de tu sitemap.xml generado por Pipedream (el que solo tiene el último artículo)
# Netlify lo servirá desde la raíz de tu sitio.
SITEMAP_ARTICULOS_URL = "https://es.hgaruna.org/sitemap.xml"

# Ruta a tu sitemap general local en el entorno de construcción de Netlify.
# Asegúrate de que este archivo exista en tu repositorio de GitHub.
LOCAL_SITEMAP_GNRAL_PATH = "sistemapGNRAL.xml"

# Namespace para el sitemap (no cambiar)
NS = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sitemap_update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuración adicional
MAX_URLS_IN_SITEMAP = 50000  # Límite recomendado por Google
REQUEST_TIMEOUT = 15
MAX_RETRIES = 3

# --- FUNCIONES DE VALIDACIÓN ---

def is_valid_url(url: str) -> bool:
    """Valida si una URL tiene un formato válido."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False

def is_valid_date(date_string: str) -> bool:
    """Valida si una fecha tiene formato ISO válido."""
    try:
        datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False

def is_article_url(url: str, base_url: str) -> bool:
    """Determina si una URL es de un artículo (no página principal)."""
    # Excluir URLs que son la página principal o sitemaps
    excluded_patterns = [
        r'/$',  # Página principal
        r'/sitemap\.xml$',  # Sitemaps
        r'/robots\.txt$',  # Robots
        r'\.(css|js|png|jpg|jpeg|gif|ico|pdf)$'  # Archivos estáticos
    ]
    
    for pattern in excluded_patterns:
        if re.search(pattern, url):
            return False
    
    return True

# --- FUNCIONES PRINCIPALES ---

def get_remote_sitemap_content(url: str) -> Optional[str]:
    """Descarga el contenido de un sitemap desde una URL con reintentos."""
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"Intentando descargar sitemap desde {url} (intento {attempt + 1}/{MAX_RETRIES})")
            response = requests.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            content = response.content.decode('utf-8')
            logger.info(f"Sitemap descargado exitosamente ({len(content)} caracteres)")
            return content
            
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout en intento {attempt + 1} para {url}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error en intento {attempt + 1} para {url}: {e}")
        
        if attempt < MAX_RETRIES - 1:
            logger.info("Esperando antes del siguiente intento...")
            import time
            time.sleep(2 ** attempt)  # Backoff exponencial
    
    logger.error(f"No se pudo descargar el sitemap después de {MAX_RETRIES} intentos")
    return None

def parse_sitemap_urls(xml_content: str) -> List[Dict[str, str]]:
    """Parsea el contenido XML de un sitemap y devuelve una lista de URLs válidas."""
    urls = []
    if not xml_content:
        logger.warning("Contenido XML vacío")
        return urls
    
    try:
        root = ET.fromstring(xml_content)
        
        # Manejo de namespace
        if '}' in root.tag:
            uri, tag = root.tag.split('}', 1)
            ns_map = {tag: uri.strip('{')}
        else:
            ns_map = {}

        url_count = 0
        for url_element in root.findall('sitemap:url', NS):
            url_count += 1
            
            # Extraer elementos
            loc_element = url_element.find('sitemap:loc', NS)
            lastmod_element = url_element.find('sitemap:lastmod', NS)
            changefreq_element = url_element.find('sitemap:changefreq', NS)
            priority_element = url_element.find('sitemap:priority', NS)

            # Validar y procesar datos
            loc = loc_element.text.strip() if loc_element is not None and loc_element.text else None
            if not loc or not is_valid_url(loc):
                logger.warning(f"URL inválida encontrada en elemento {url_count}: {loc}")
                continue

            # Validar fecha
            lastmod = lastmod_element.text if lastmod_element is not None else None
            if lastmod and not is_valid_date(lastmod):
                logger.warning(f"Fecha inválida para {loc}: {lastmod}")
                lastmod = datetime.now().isoformat()
            elif not lastmod:
                lastmod = datetime.now().isoformat()

            # Valores por defecto
            changefreq = changefreq_element.text if changefreq_element is not None else 'daily'
            priority = priority_element.text if priority_element is not None else '0.8'

            urls.append({
                'loc': loc,
                'lastmod': lastmod,
                'changefreq': changefreq,
                'priority': priority
            })

        logger.info(f"Parseadas {len(urls)} URLs válidas de {url_count} elementos totales")
        
    except ET.ParseError as e:
        logger.error(f"Error al parsear XML: {e}")
    except Exception as e:
        logger.error(f"Error inesperado al parsear sitemap: {e}")
    
    return urls

def write_sitemap(sitemap_path: str, urls_data: List[Dict[str, str]]) -> bool:
    """Escribe un sitemap XML con la lista de URLs."""
    try:
        if len(urls_data) > MAX_URLS_IN_SITEMAP:
            logger.warning(f"El sitemap excede el límite recomendado ({len(urls_data)} > {MAX_URLS_IN_SITEMAP})")
        
        root = ET.Element('urlset', attrib={'xmlns': NS['sitemap']})

        for url_data in urls_data:
            url_element = ET.SubElement(root, 'url')
            ET.SubElement(url_element, 'loc').text = url_data['loc']
            ET.SubElement(url_element, 'lastmod').text = url_data['lastmod']
            ET.SubElement(url_element, 'changefreq').text = url_data['changefreq']
            ET.SubElement(url_element, 'priority').text = url_data['priority']
        
        tree = ET.ElementTree(root)
        ET.indent(tree, space="  ", level=0)
        
        # Crear backup antes de escribir
        if os.path.exists(sitemap_path):
            backup_path = f"{sitemap_path}.backup"
            os.rename(sitemap_path, backup_path)
            logger.info(f"Backup creado: {backup_path}")
        
        tree.write(sitemap_path, encoding='utf-8', xml_declaration=True)
        logger.info(f"Sitemap actualizado guardado en: {sitemap_path} ({len(urls_data)} URLs)")
        return True
        
    except Exception as e:
        logger.error(f"Error al escribir sitemap: {e}")
        return False

def get_new_articles(remote_urls: List[Dict[str, str]], local_urls: List[Dict[str, str]], base_url: str) -> List[Dict[str, str]]:
    """Identifica artículos nuevos comparando sitemaps remoto y local."""
    new_articles = []
    local_urls_set = {url['loc'] for url in local_urls}
    
    for url_info in remote_urls:
        if (url_info['loc'] not in local_urls_set and 
            is_article_url(url_info['loc'], base_url)):
            new_articles.append(url_info)
    
    logger.info(f"Encontrados {len(new_articles)} artículos nuevos")
    return new_articles

# --- PROCESO PRINCIPAL ---
if __name__ == "__main__":
    logger.info(f"Iniciando proceso de actualización de {LOCAL_SITEMAP_GNRAL_PATH}")
    
    try:
        # 1. Descargar sitemap remoto
        remote_sitemap_content = get_remote_sitemap_content(SITEMAP_ARTICULOS_URL)
        if not remote_sitemap_content:
            logger.error("No se pudo obtener el sitemap remoto. Saliendo.")
            exit(1)

        remote_urls_data = parse_sitemap_urls(remote_sitemap_content)
        if not remote_urls_data:
            logger.error("El sitemap remoto no contiene URLs válidas. Saliendo.")
            exit(1)

        # 2. Leer sitemap local
        local_urls_data = []
        if os.path.exists(LOCAL_SITEMAP_GNRAL_PATH):
            try:
                with open(LOCAL_SITEMAP_GNRAL_PATH, 'r', encoding='utf-8') as f:
                    local_sitemap_content = f.read()
                local_urls_data = parse_sitemap_urls(local_sitemap_content)
                logger.info(f"Sitemap local leído con {len(local_urls_data)} URLs")
            except Exception as e:
                logger.error(f"Error al leer sitemap local: {e}")
                local_urls_data = []
        else:
            logger.info(f"El archivo {LOCAL_SITEMAP_GNRAL_PATH} no existe. Se creará uno nuevo.")

        # 3. Identificar artículos nuevos
        base_url = SITEMAP_ARTICULOS_URL.replace('/sitemap.xml', '')
        new_articles = get_new_articles(remote_urls_data, local_urls_data, base_url)
        
        if not new_articles:
            logger.info("No se encontraron artículos nuevos. Saliendo.")
            exit(0)

        # 4. Actualizar sitemap local
        updated_urls_data = list(local_urls_data)
        
        # Añadir nuevos artículos y actualizar existentes
        for new_article in new_articles:
            article_added = False
            for i, existing_url in enumerate(updated_urls_data):
                if existing_url['loc'] == new_article['loc']:
                    updated_urls_data[i]['lastmod'] = new_article['lastmod']
                    logger.info(f"URL existente actualizada: {new_article['loc']}")
                    article_added = True
                    break
            
            if not article_added:
                updated_urls_data.append(new_article)
                logger.info(f"Nueva URL añadida: {new_article['loc']}")

        # 5. Ordenar por fecha (más recientes primero) en lugar de alfabético
        updated_urls_data.sort(key=lambda x: x['lastmod'], reverse=True)

        # 6. Escribir sitemap actualizado
        if write_sitemap(LOCAL_SITEMAP_GNRAL_PATH, updated_urls_data):
            logger.info("Proceso de actualización completado exitosamente")
        else:
            logger.error("Error al escribir el sitemap actualizado")
            exit(1)

    except KeyboardInterrupt:
        logger.info("Proceso interrumpido por el usuario")
        exit(1)
    except Exception as e:
        logger.error(f"Error inesperado en el proceso principal: {e}")
        exit(1)
    