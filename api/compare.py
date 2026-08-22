from http.server import BaseHTTPRequestHandler
import cgi
import json
import os
import tempfile
import sys

# Ensure tekno_tool module is importable
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
tekno_dir = os.path.join(parent_dir, "tekno_tool")

if tekno_dir not in sys.path:
    sys.path.insert(0, tekno_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from comparator import compare_excel_files

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
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

            if 'file_old' not in form or 'file_new' not in form:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
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

            # Read options
            key_old = form.getfirst('key_col_old', 'Row-by-Row')
            key_new = form.getfirst('key_col_new', 'Row-by-Row')
            ignore_punct = form.getfirst('ignore_punct', 'true').lower() == 'true'
            filter_keywords = form.getfirst('filter_keywords', '')
            mode = form.getfirst('mode', 'compare')

            # Run exact Python comparator engine
            compare_excel_files(
                tmp_old_path, tmp_new_path, output_path,
                key_col_old=key_old, key_col_new=key_new,
                ignore_punct=ignore_punct,
                use_ai=False, ai_api_key="",
                mode=mode,
                filter_keywords=filter_keywords,
                ref_filepath=tmp_ref_path
            )

            with open(output_path, 'rb') as f:
                excel_bytes = f.read()

            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            self.send_header('Content-Disposition', 'attachment; filename="Tekno_Data_Report.xlsx"')
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
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
