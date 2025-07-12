import requests
import xml.etree.ElementTree as ET
import os
from datetime import datetime

# --- CONFIGURACIÓN ---
# URL de tu sitemap.xml generado por Pipedream (el que solo tiene el último artículo)
# Netlify lo servirá desde la raíz de tu sitio.
SITEMAP_ARTICULOS_URL = "https://es.hgaruna.org/sitemap.xml"

# Ruta a tu sitemap general local en el entorno de construcción de Netlify.
# Asegúrate de que este archivo exista en tu repositorio de GitHub.
LOCAL_SITEMAP_GNRAL_PATH = "sistemapGNRAL.xml"

# Namespace para el sitemap (no cambiar)
NS = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

    # --- FUNCIONES ---

def get_remote_sitemap_content(url):
        """Descarga el contenido de un sitemap desde una URL."""
        try:
            response = requests.get(url, timeout=10) # Añadir timeout
            response.raise_for_status()  # Lanza un error para códigos de estado HTTP incorrectos
            return response.content.decode('utf-8')
        except requests.exceptions.RequestException as e:
            print(f"Error al descargar el sitemap remoto de {url}: {e}")
            return None

def parse_sitemap_urls(xml_content):
        """Parsea el contenido XML de un sitemap y devuelve una lista de URLs (loc, lastmod, changefreq, priority)."""
        urls = []
        if not xml_content:
            return urls
        try:
            # Asegurarse de que el namespace se maneje correctamente al parsear
            root = ET.fromstring(xml_content)
            
            # Si el root tiene un namespace, lo registramos para futuras búsquedas
            if '}' in root.tag:
                uri, tag = root.tag.split('}', 1)
                ns_map = {tag: uri.strip('{')}
                # Actualizar el NS global si es necesario, aunque para sitemaps suele ser fijo
                # NS['sitemap'] = uri.strip('{') # No es necesario si el NS es fijo
            else:
                ns_map = {} # No namespace prefix

            for url_element in root.findall('sitemap:url', NS):
                loc_element = url_element.find('sitemap:loc', NS)
                lastmod_element = url_element.find('sitemap:lastmod', NS)
                changefreq_element = url_element.find('sitemap:changefreq', NS)
                priority_element = url_element.find('sitemap:priority', NS)

                loc = loc_element.text if loc_element is not None else None
                lastmod = lastmod_element.text if lastmod_element is not None else datetime.now().isoformat()
                changefreq = changefreq_element.text if changefreq_element is not None else 'daily'
                priority = priority_element.text if priority_element is not None else '0.8'

                if loc:
                    urls.append({
                        'loc': loc,
                        'lastmod': lastmod,
                        'changefreq': changefreq,
                        'priority': priority
                    })
        except ET.ParseError as e:
            print(f"Error al parsear el XML del sitemap: {e}")
        return urls

def write_sitemap(sitemap_path, urls_data):
        """Escribe un sitemap XML con la lista de URLs."""
        root = ET.Element('urlset', attrib={'xmlns': NS['sitemap']})

        for url_data in urls_data:
            url_element = ET.SubElement(root, 'url')
            ET.SubElement(url_element, 'loc').text = url_data['loc']
            ET.SubElement(url_element, 'lastmod').text = url_data['lastmod']
            ET.SubElement(url_element, 'changefreq').text = url_data['changefreq']
            ET.SubElement(url_element, 'priority').text = url_data['priority']
        
        tree = ET.ElementTree(root)
        ET.indent(tree, space="  ", level=0) # Formatear el XML para que sea legible
        tree.write(sitemap_path, encoding='utf-8', xml_declaration=True)
        print(f"Sitemap actualizado guardado en: {sitemap_path}")

    # --- PROCESO PRINCIPAL ---
if __name__ == "__main__":
        print(f"Iniciando el proceso de actualización de {LOCAL_SITEMAP_GNRAL_PATH}...")

        # 1. Descargar el sitemap.xml generado por Pipedream (el que tiene el último artículo)
        remote_sitemap_content = get_remote_sitemap_content(SITEMAP_ARTICULOS_URL)
        if not remote_sitemap_content:
            print("No se pudo obtener el sitemap remoto. No se realizará la fusión.")
            exit(0) # Salir sin error si no se puede descargar el sitemap remoto

        remote_urls_data = parse_sitemap_urls(remote_sitemap_content)
        
        if not remote_urls_data:
            print("El sitemap remoto no contiene URLs válidas. No se realizará la fusión.")
            exit(0) # Salir sin error si el sitemap remoto está vacío

        # La URL del último artículo es la última en el sitemap remoto (o la única si solo tiene 2)
        # Nos aseguramos de tomar la URL del artículo, no la URL base si está presente
        latest_article_url_info = None
        for url_info in remote_urls_data:
            if url_info['loc'] != SITEMAP_ARTICULOS_URL.replace('/sitemap.xml', '/'): # Excluir la URL base del sitio
                latest_article_url_info = url_info
                break # Solo necesitamos la primera URL de artículo que encontremos

        if not latest_article_url_info:
            print("No se encontró una URL de artículo válida en el sitemap remoto. Saliendo.")
            exit(0)

        print(f"Última URL de artículo detectada: {latest_article_url_info['loc']}")

        # 2. Leer el sitemap general local existente
        local_urls_data = []
        if os.path.exists(LOCAL_SITEMAP_GNRAL_PATH):
            with open(LOCAL_SITEMAP_GNRAL_PATH, 'r', encoding='utf-8') as f:
                local_sitemap_content = f.read()
            local_urls_data = parse_sitemap_urls(local_sitemap_content)
            print(f"Sitemap general local existente leído con {len(local_urls_data)} URLs.")
        else:
            print(f"El archivo {LOCAL_SITEMAP_GNRAL_PATH} no existe. Se creará uno nuevo.")

        # 3. Añadir la nueva URL del artículo al sitemap general, evitando duplicados
        updated_urls_data = list(local_urls_data) # Copiar las URLs existentes
        
        # Verificar si la URL del nuevo artículo ya existe en el sitemap general
        is_article_present = False
        for url_info in updated_urls_data:
            if url_info['loc'] == latest_article_url_info['loc']:
                is_article_present = True
                # Opcional: Actualizar lastmod si ya existe
                url_info['lastmod'] = latest_article_url_info['lastmod']
                print(f"URL {latest_article_url_info['loc']} ya presente. Lastmod actualizado.")
                break
        
        if not is_article_present:
            updated_urls_data.append(latest_article_url_info)
            print(f"URL {latest_article_url_info['loc']} añadida al sitemap general.")
        
        # Opcional: Ordenar las URLs para consistencia (alfabético por loc)
        updated_urls_data.sort(key=lambda x: x['loc'])

        # 4. Escribir el sitemap general actualizado
        write_sitemap(LOCAL_SITEMAP_GNRAL_PATH, updated_urls_data)

        print(f"Proceso de actualización de {LOCAL_SITEMAP_GNRAL_PATH} finalizado.")
    