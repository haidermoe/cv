import os
import sys
import json
import tempfile
import io
import zipfile
import re
import threading
import requests
import urllib3
import pandas as pd
from http.server import HTTPServer, BaseHTTPRequestHandler
import cgi
from concurrent.futures import ThreadPoolExecutor

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def sanitize_filename(name):
    clean = re.sub(r'[\\/*?:"<>|]', "", str(name))
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean[:100] if clean else "image"

def get_file_extension(url, content_type=None):
    clean_url = url.split("?")[0].split("#")[0]
    ext = os.path.splitext(clean_url)[1].lower()
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"]:
        return ext
    if content_type:
        ct = content_type.lower()
        if "png" in ct:
            return ".png"
        if "webp" in ct:
            return ".webp"
        if "gif" in ct:
            return ".gif"
        if "svg" in ct:
            return ".svg"
    return ".jpg"

def parse_headers_with_python(file_path):
    try:
        if file_path.lower().endswith('.csv'):
            df = pd.read_csv(file_path, nrows=2)
        else:
            df = pd.read_excel(file_path, nrows=2)
        
        def num_to_col_str(n):
            s = ""
            while n >= 0:
                s = chr((n % 26) + 65) + s
                n = (n // 26) - 1
            return s

        headers = []
        for idx, col in enumerate(df.columns):
            col_letter = num_to_col_str(idx)
            val_str = str(col).strip()
            if val_str and not val_str.startswith("Unnamed:"):
                headers.append(f"{col_letter} ({val_str})")
            else:
                headers.append(f"{col_letter}")
        return headers
    except Exception:
        return []

class ImageDownloaderHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept')
        self.end_headers()

    def do_POST(self):
        try:
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Expected multipart/form-data'}).encode('utf-8'))
                return

            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    'REQUEST_METHOD': 'POST',
                    'CONTENT_TYPE': self.headers['Content-Type'],
                }
            )

            # HEADERS ENDPOINT
            if self.path.endswith('/headers'):
                file_item = form['file']
                if not file_item.file:
                    self.send_response(400)
                    self.end_headers()
                    return

                suffix = ".xlsx" if file_item.filename.endswith(".xlsx") else (".csv" if file_item.filename.endswith(".csv") else ".xls")
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    tmp.write(file_item.file.read())
                    tmp_path = tmp.name

                headers = parse_headers_with_python(tmp_path)
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'headers': headers}).encode('utf-8'))
                return

            # PROCESS & ZIP DOWNLOAD ENDPOINT
            if self.path.endswith('/download'):
                file_item = form['file']
                name_col_idx = int(form.getvalue('name_col', '0'))
                url_cols_raw = form.getvalue('url_cols', '1')
                url_cols_indices = [int(x.strip()) for x in str(url_cols_raw).split(',') if x.strip().isdigit()]

                suffix = ".xlsx" if file_item.filename.endswith(".xlsx") else (".csv" if file_item.filename.endswith(".csv") else ".xls")
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    tmp.write(file_item.file.read())
                    tmp_path = tmp.name

                if tmp_path.lower().endswith('.csv'):
                    df = pd.read_csv(tmp_path, dtype=str).fillna("")
                else:
                    df = pd.read_excel(tmp_path, dtype=str).fillna("")

                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

                # Build download task list
                tasks = []
                for _, row in df.iterrows():
                    row_vals = list(row)
                    item_name = str(row_vals[name_col_idx]).strip() if name_col_idx < len(row_vals) else ""
                    if not item_name:
                        continue
                    
                    item_urls = []
                    for col_idx in url_cols_indices:
                        if col_idx < len(row_vals):
                            u = str(row_vals[col_idx]).strip()
                            if u.startswith("http://") or u.startswith("https://"):
                                item_urls.append(u)
                    
                    if item_urls:
                        tasks.append({'name': item_name, 'urls': item_urls})

                # Concurrently download images into in-memory ZIP
                zip_buffer = io.BytesIO()
                session = requests.Session()
                session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    def download_item_images(task):
                        base_clean_name = sanitize_filename(task['name'])
                        results = []
                        for i, url in enumerate(task['urls']):
                            try:
                                resp = session.get(url, timeout=12, verify=False)
                                if resp.status_code == 200:
                                    ext = get_file_extension(url, resp.headers.get('Content-Type'))
                                    suffix = f"_{i+1}" if len(task['urls']) > 1 else ""
                                    file_name = f"{base_clean_name}{suffix}{ext}"
                                    results.append((file_name, resp.content))
                            except Exception:
                                pass
                        return results

                    with ThreadPoolExecutor(max_workers=10) as executor:
                        all_results = executor.map(download_item_images, tasks)
                        for item_results in all_results:
                            for file_name, file_bytes in item_results:
                                zip_file.writestr(file_name, file_bytes)

                zip_buffer.seek(0)
                zip_data = zip_buffer.getvalue()

                self.send_response(200)
                self.send_header('Content-Type', 'application/zip')
                self.send_header('Content-Disposition', 'attachment; filename="downloaded_images.zip"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(zip_data)
                return

            self.send_response(404)
            self.end_headers()

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

def run_server(port=8001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ImageDownloaderHandler)
    print(f"Image Downloader Python Server running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
