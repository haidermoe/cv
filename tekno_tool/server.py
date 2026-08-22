import os
import sys
import tempfile
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import cgi

# Ensure tekno_tool directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from comparator import compare_excel_files, get_headers

def parse_headers_with_python(file_path):
    """Uses Python comparator.py get_headers natively to read Excel/CSV column headers."""
    try:
        raw_headers = get_headers(file_path)
        def num_to_col_str(n):
            s = ""
            while n >= 0:
                s = chr((n % 26) + 65) + s
                n = (n // 26) - 1
            return s
        
        headers = []
        for idx, val in enumerate(raw_headers):
            col_letter = num_to_col_str(idx)
            val_str = str(val).strip()
            if val_str:
                headers.append(f"{col_letter} ({val_str})")
            else:
                headers.append(f"{col_letter}")
        return headers
    except Exception as e:
        return []

class PythonBackendHandler(BaseHTTPRequestHandler):
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
                    'CONTENT_TYPE': content_type,
                }
            )

            # Endpoint 1: Parse Headers using Python comparator.py get_headers
            if self.path.endswith('/headers'):
                if 'file' not in form:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'No file uploaded'}).encode('utf-8'))
                    return

                file_item = form['file']
                file_ext = os.path.splitext(file_item.filename)[1] if file_item.filename else ".xlsx"

                with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
                    tmp.write(file_item.file.read())
                    tmp_path = tmp.name

                headers = parse_headers_with_python(tmp_path)

                if os.path.exists(tmp_path):
                    try: os.remove(tmp_path)
                    except: pass

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'headers': headers}).encode('utf-8'))
                return

            # Endpoint 2: Compare & Process using Python comparator.py compare_excel_files
            if self.path.endswith('/compare'):
                if 'file_old' not in form or 'file_new' not in form:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'يرجى اختيار ملف الموقع وملف المخزن'}).encode('utf-8'))
                    return

                file_old_item = form['file_old']
                file_new_item = form['file_new']

                file_old_ext = os.path.splitext(file_old_item.filename)[1] if file_old_item.filename else ".xlsx"
                file_new_ext = os.path.splitext(file_new_item.filename)[1] if file_new_item.filename else ".xlsx"

                with tempfile.NamedTemporaryFile(delete=False, suffix=file_old_ext) as tmp_old:
                    tmp_old.write(file_old_item.file.read())
                    tmp_old_path = tmp_old.name

                with tempfile.NamedTemporaryFile(delete=False, suffix=file_new_ext) as tmp_new:
                    tmp_new.write(file_new_item.file.read())
                    tmp_new_path = tmp_new.name

                tmp_ref_path = ""
                if 'file_ref' in form and form['file_ref'].filename:
                    file_ref_item = form['file_ref']
                    file_ref_ext = os.path.splitext(file_ref_item.filename)[1]
                    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ref_ext) as tmp_ref:
                        tmp_ref.write(file_ref_item.file.read())
                        tmp_ref_path = tmp_ref.name

                with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_out:
                    output_path = tmp_out.name

                # Read parameters
                key_old = form.getfirst('key_col_old', '')
                key_new = form.getfirst('key_col_new', '')
                comp_old = form.getfirst('comp_col_old', '')
                comp_new = form.getfirst('comp_col_new', '')
                mode = form.getfirst('mode', 'compare')
                new_col_name = form.getfirst('new_col_name', 'المخزون الساحب')
                ignore_punct = form.getfirst('ignore_punct', 'true').lower() == 'true'
                
                try:
                    similarity_threshold = float(form.getfirst('similarity_threshold', '70'))
                except:
                    similarity_threshold = 70.0

                filter_keywords = form.getfirst('filter_keywords', '')

                # Execute Python comparison engine
                compare_excel_files(
                    tmp_old_path, tmp_new_path, output_path,
                    key_col_old=key_old, key_col_new=key_new,
                    comp_col_old=comp_old, comp_col_new=comp_new,
                    ignore_punct=ignore_punct,
                    similarity_threshold=similarity_threshold,
                    use_ai=False, ai_api_key="",
                    mode=mode,
                    new_col_name=new_col_name,
                    filter_keywords=filter_keywords,
                    ref_filepath=tmp_ref_path
                )

                with open(output_path, 'rb') as f:
                    excel_bytes = f.read()

                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                self.send_header('Content-Disposition', 'attachment; filename="Tekno_Data_Report.xlsx"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(excel_bytes)

                # Cleanup
                for p in [tmp_old_path, tmp_new_path, tmp_ref_path, output_path]:
                    if p and os.path.exists(p):
                        try: os.remove(p)
                        except: pass

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=PythonBackendHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Python API Backend server running on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run(port=port)
