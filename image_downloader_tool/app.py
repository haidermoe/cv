import os
import sys
import string
import threading
import traceback
import requests
import urllib3
import pandas as pd
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import customtkinter as ctk

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")


class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Image Downloader Pro")
        self.geometry("960x780")
        self.minsize(850, 600)

        # Catch uncaught exceptions to prevent silent crashes
        self.report_callback_exception = self.handle_exception

        # Data storage
        self.excel_df = None
        self.download_folder = ""
        self.items_data = []  # List of dicts: {'name': str, 'urls': list of str}
        self.is_downloading = False
        self.selected_url_cols = []

        self.setup_ui()

    def handle_exception(self, exc_type, exc_value, exc_traceback):
        err_msg = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        print("ERROR:", err_msg)
        try:
            messagebox.showerror("System Error", f"An unexpected error occurred:\n\n{str(exc_value)}")
        except Exception:
            pass

    def setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        # =========================================================================
        # --- Top Section: Excel Import ---
        # =========================================================================
        top_card = ctk.CTkFrame(self, corner_radius=10)
        top_card.grid(row=0, column=0, padx=20, pady=(15, 10), sticky="ew")

        # Row 1: File selection
        file_row = ctk.CTkFrame(top_card, fg_color="transparent")
        file_row.pack(fill="x", padx=15, pady=(12, 8))

        self.browse_excel_btn = ctk.CTkButton(
            file_row, text="📁 Browse Excel/CSV", command=self.browse_excel,
            width=160, font=("Arial", 12, "bold")
        )
        self.browse_excel_btn.pack(side="left", padx=(0, 12))

        self.excel_label = ctk.CTkLabel(
            file_row, text="No file selected — Select an Excel (.xlsx, .xls) or CSV file",
            text_color="#9aa0a6", font=("Arial", 12)
        )
        self.excel_label.pack(side="left", padx=5)

        # Row 2: Column Selection & Import
        col_row = ctk.CTkFrame(top_card, fg_color="transparent")
        col_row.pack(fill="x", padx=15, pady=(0, 12))

        name_lbl = ctk.CTkLabel(col_row, text="Name Column:", font=("Arial", 12, "bold"))
        name_lbl.pack(side="left", padx=(0, 6))

        self.name_col_combo = ctk.CTkComboBox(col_row, values=[""], width=160, state="disabled")
        self.name_col_combo.pack(side="left", padx=(0, 15))

        self.url_cols_btn = ctk.CTkButton(
            col_row, text="🔗 Select URL Columns (0)", command=self.open_url_cols_dialog,
            width=190, state="disabled", fg_color="#2d3748", hover_color="#4a5568",
            font=("Arial", 12, "bold")
        )
        self.url_cols_btn.pack(side="left", padx=(0, 10))

        self.url_cols_summary = ctk.CTkLabel(
            col_row, text="No columns selected", text_color="#718096", font=("Arial", 11)
        )
        self.url_cols_summary.pack(side="left", padx=(0, 15))

        self.import_btn = ctk.CTkButton(
            col_row, text="📥 Import Data", command=self.import_data,
            width=130, state="disabled", fg_color="#2b6cb0", hover_color="#2c5282",
            font=("Arial", 12, "bold")
        )
        self.import_btn.pack(side="right")

        # =========================================================================
        # --- Middle Section: Ultra-Fast Data Table ---
        # =========================================================================
        table_card = ctk.CTkFrame(self, corner_radius=10)
        table_card.grid(row=2, column=0, padx=20, pady=(0, 10), sticky="nsew")
        table_card.grid_rowconfigure(1, weight=1)
        table_card.grid_columnconfigure(0, weight=1)

        # Header bar of table
        table_header = ctk.CTkFrame(table_card, fg_color="transparent")
        table_header.grid(row=0, column=0, padx=15, pady=(10, 6), sticky="ew")

        self.table_title_lbl = ctk.CTkLabel(
            table_header, text="Items List (0 items, 0 images)",
            font=("Arial", 14, "bold"), text_color="#e2e8f0"
        )
        self.table_title_lbl.pack(side="left")

        # Table action buttons
        self.clear_table_btn = ctk.CTkButton(
            table_header, text="Clear All", command=self.clear_all_items,
            width=80, height=26, fg_color="#742a2a", hover_color="#9b2c2c", font=("Arial", 11)
        )
        self.clear_table_btn.pack(side="right", padx=(5, 0))

        self.delete_selected_btn = ctk.CTkButton(
            table_header, text="Delete Selected", command=self.delete_selected_item,
            width=110, height=26, fg_color="#4a5568", hover_color="#718096", font=("Arial", 11)
        )
        self.delete_selected_btn.pack(side="right", padx=5)

        self.add_manual_btn = ctk.CTkButton(
            table_header, text="+ Add Item Manually", command=self.open_add_manual_dialog,
            width=140, height=26, fg_color="#276749", hover_color="#2f855a", font=("Arial", 11, "bold")
        )
        self.add_manual_btn.pack(side="right", padx=5)

        # Treeview styled for Dark Theme
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "Treeview",
            background="#1e2530",
            foreground="#e2e8f0",
            fieldbackground="#1e2530",
            rowheight=26,
            font=("Arial", 10)
        )
        style.configure(
            "Treeview.Heading",
            background="#2d3748",
            foreground="#ffffff",
            font=("Arial", 11, "bold"),
            relief="flat"
        )
        style.map("Treeview", background=[("selected", "#3182ce")], foreground=[("selected", "#ffffff")])
        style.map("Treeview.Heading", background=[("active", "#4a5568")])

        # Table container with scrollbar
        table_container = tk.Frame(table_card, bg="#1e2530")
        table_container.grid(row=1, column=0, padx=15, pady=(0, 12), sticky="nsew")

        tree_scroll_y = ttk.Scrollbar(table_container, orient="vertical")
        tree_scroll_x = ttk.Scrollbar(table_container, orient="horizontal")

        self.tree = ttk.Treeview(
            table_container,
            columns=("Index", "Name", "ImgCount", "URLs"),
            show="headings",
            yscrollcommand=tree_scroll_y.set,
            xscrollcommand=tree_scroll_x.set,
            selectmode="extended"
        )

        tree_scroll_y.config(command=self.tree.yview)
        tree_scroll_x.config(command=self.tree.xview)

        tree_scroll_y.pack(side="right", fill="y")
        tree_scroll_x.pack(side="bottom", fill="x")
        self.tree.pack(side="left", fill="both", expand=True)

        self.tree.heading("Index", text="#")
        self.tree.heading("Name", text="Item Name / File Name")
        self.tree.heading("ImgCount", text="Images")
        self.tree.heading("URLs", text="Image URLs Preview")

        self.tree.column("Index", width=50, minwidth=40, anchor="center")
        self.tree.column("Name", width=220, minwidth=150, anchor="w")
        self.tree.column("ImgCount", width=70, minwidth=60, anchor="center")
        self.tree.column("URLs", width=500, minwidth=250, anchor="w")

        # =========================================================================
        # --- Bottom Section: Download Settings & Progress ---
        # =========================================================================
        bottom_card = ctk.CTkFrame(self, corner_radius=10)
        bottom_card.grid(row=4, column=0, padx=20, pady=(0, 15), sticky="ew")
        bottom_card.grid_columnconfigure(1, weight=1)

        self.select_folder_btn = ctk.CTkButton(
            bottom_card, text="📁 Choose Save Folder",
            command=self.select_folder, width=170, font=("Arial", 12, "bold")
        )
        self.select_folder_btn.grid(row=0, column=0, padx=15, pady=12)

        self.folder_label = ctk.CTkLabel(
            bottom_card, text="Path: Not selected", text_color="#a0aec0", font=("Arial", 12)
        )
        self.folder_label.grid(row=0, column=1, padx=10, pady=12, sticky="w")

        self.download_btn = ctk.CTkButton(
            bottom_card, text="🚀 Start Download",
            command=self.start_download, width=170, height=36,
            font=("Arial", 13, "bold"), fg_color="#2b6cb0", hover_color="#2c5282"
        )
        self.download_btn.grid(row=0, column=2, padx=15, pady=12)

        self.progress_bar = ctk.CTkProgressBar(bottom_card)
        self.progress_bar.grid(row=1, column=0, columnspan=3, padx=15, pady=(0, 8), sticky="ew")
        self.progress_bar.set(0)

        self.status_label = ctk.CTkLabel(
            bottom_card, text="Status: Ready", text_color="#cbd5e0", font=("Arial", 12)
        )
        self.status_label.grid(row=2, column=0, columnspan=3, padx=15, pady=(0, 10))

    # =========================================================================
    # --- Excel Handling & Import ---
    # =========================================================================
    def browse_excel(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Excel & CSV Files", "*.xlsx *.xls *.csv"), ("All Files", "*.*")]
        )
        if not file_path:
            return

        self.excel_label.configure(text=os.path.basename(file_path), text_color="#63b3ed")
        try:
            if file_path.lower().endswith('.csv'):
                self.excel_df = pd.read_csv(file_path)
            else:
                self.excel_df = pd.read_excel(file_path)

            columns = [str(c) for c in self.excel_df.columns]
            self.name_col_combo.configure(values=columns, state="normal")
            self.name_col_combo.set(columns[0] if len(columns) > 0 else "")

            # Auto-detect URL columns
            url_keywords = ['url', 'image', 'img', 'link', 'photo', 'pic', 'صورة', 'صوره', 'رابط']
            auto_selected = [c for c in columns if any(k in c.lower() for k in url_keywords)]

            if not auto_selected and len(columns) > 1:
                auto_selected = [columns[1]]

            self.selected_url_cols = auto_selected
            self.update_url_cols_ui()

            self.url_cols_btn.configure(state="normal")
            self.import_btn.configure(state="normal")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to read file:\n{str(e)}")

    def update_url_cols_ui(self):
        count = len(self.selected_url_cols)
        self.url_cols_btn.configure(text=f"🔗 Select URL Columns ({count})")
        if count == 0:
            self.url_cols_summary.configure(text="⚠ No URL columns selected", text_color="#ed8936")
        elif count <= 2:
            self.url_cols_summary.configure(text=f"Selected: {', '.join(self.selected_url_cols)}", text_color="#90cdf4")
        else:
            first_two = ', '.join(self.selected_url_cols[:2])
            self.url_cols_summary.configure(text=f"Selected ({count}): {first_two}, ...", text_color="#90cdf4")

    def open_url_cols_dialog(self):
        if self.excel_df is None:
            return

        columns = [str(c) for c in self.excel_df.columns]
        dialog = ctk.CTkToplevel(self)
        dialog.title("Select URL Columns")
        dialog.geometry("460x520")
        dialog.transient(self)
        dialog.grab_set()

        ctk.CTkLabel(
            dialog, text="Select columns that contain image URLs:",
            font=("Arial", 13, "bold")
        ).pack(padx=20, pady=(15, 10), anchor="w")

        btn_frame = ctk.CTkFrame(dialog, fg_color="transparent")
        btn_frame.pack(fill="x", padx=20, pady=(0, 10))

        checkbox_vars = {}

        def select_all():
            for var in checkbox_vars.values():
                var.set(True)

        def deselect_all():
            for var in checkbox_vars.values():
                var.set(False)

        def auto_select():
            url_keywords = ['url', 'image', 'img', 'link', 'photo', 'pic', 'صورة', 'صوره', 'رابط']
            for col, var in checkbox_vars.items():
                var.set(any(k in col.lower() for k in url_keywords))

        ctk.CTkButton(btn_frame, text="Select All", width=80, height=26, font=("Arial", 11),
                      command=select_all).pack(side="left", padx=(0, 5))
        ctk.CTkButton(btn_frame, text="Clear All", width=80, height=26, font=("Arial", 11),
                      command=deselect_all).pack(side="left", padx=5)
        ctk.CTkButton(btn_frame, text="Auto Detect", width=95, height=26, font=("Arial", 11),
                      command=auto_select).pack(side="left", padx=5)

        scroll_frame = ctk.CTkScrollableFrame(dialog, height=300)
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=5)

        for col in columns:
            var = ctk.BooleanVar(value=(col in self.selected_url_cols))
            checkbox_vars[col] = var
            chk = ctk.CTkCheckBox(scroll_frame, text=col, variable=var)
            chk.pack(anchor="w", pady=5, padx=10)

        def apply_selection():
            chosen = [col for col, var in checkbox_vars.items() if var.get()]
            if not chosen:
                messagebox.showwarning("Warning", "Please select at least one URL column.", parent=dialog)
                return
            self.selected_url_cols = chosen
            self.update_url_cols_ui()
            dialog.destroy()

        ctk.CTkButton(
            dialog, text="Confirm & Save", command=apply_selection,
            font=("Arial", 13, "bold"), height=36, fg_color="#2b6cb0"
        ).pack(fill="x", padx=20, pady=15)

    def import_data(self):
        if self.excel_df is None:
            return

        name_col = self.name_col_combo.get()
        if not name_col or name_col not in self.excel_df.columns:
            messagebox.showerror("Error", "Selected Name column does not exist in the file.")
            return

        if not self.selected_url_cols:
            messagebox.showwarning("Warning", "Please select at least one URL column.")
            return

        self.items_data.clear()
        total_imported_urls = 0

        for index, row in self.excel_df.iterrows():
            name_val = row[name_col]
            if pd.isna(name_val) or not str(name_val).strip():
                continue

            all_urls_for_row = []
            for col in self.selected_url_cols:
                if col in self.excel_df.columns:
                    val = row[col]
                    if pd.notna(val):
                        raw_cell = str(val).strip()
                        parts = raw_cell.replace(',', '\n').replace(';', '\n').splitlines()
                        for p in parts:
                            p_clean = p.strip()
                            if p_clean and (p_clean.startswith('http') or '.' in p_clean):
                                all_urls_for_row.append(p_clean)

            if all_urls_for_row:
                self.items_data.append({
                    'name': str(name_val).strip(),
                    'urls': all_urls_for_row
                })
                total_imported_urls += len(all_urls_for_row)

        self.refresh_table()

        messagebox.showinfo(
            "Success",
            f"Successfully imported {len(self.items_data)} items ({total_imported_urls} images in total)!\n"
            f"From {len(self.selected_url_cols)} selected URL column(s)."
        )

    # =========================================================================
    # --- Table UI Updates & Actions ---
    # =========================================================================
    def refresh_table(self):
        # Clear tree
        for row in self.tree.get_children():
            self.tree.delete(row)

        total_images = sum(len(item['urls']) for item in self.items_data)

        # Batch insert for speed
        for idx, item in enumerate(self.items_data, start=1):
            urls_preview = " | ".join(item['urls'])
            self.tree.insert("", "end", iid=str(idx - 1), values=(
                idx,
                item['name'],
                len(item['urls']),
                urls_preview
            ))

        self.table_title_lbl.configure(
            text=f"Items List ({len(self.items_data)} items, {total_images} images)"
        )

    def delete_selected_item(self):
        selected_iids = self.tree.selection()
        if not selected_iids:
            return

        indices_to_remove = set(int(iid) for iid in selected_iids)
        self.items_data = [item for idx, item in enumerate(self.items_data) if idx not in indices_to_remove]
        self.refresh_table()

    def clear_all_items(self):
        if not self.items_data:
            return
        if messagebox.askyesno("Clear All", "Are you sure you want to clear all items from the list?"):
            self.items_data.clear()
            self.refresh_table()

    def open_add_manual_dialog(self):
        dialog = ctk.CTkToplevel(self)
        dialog.title("Add Item Manually")
        dialog.geometry("460x380")
        dialog.transient(self)
        dialog.grab_set()

        ctk.CTkLabel(dialog, text="Item Name:", font=("Arial", 12, "bold")).pack(padx=20, pady=(15, 4), anchor="w")
        name_entry = ctk.CTkEntry(dialog, placeholder_text="e.g. shirt_blue", width=420)
        name_entry.pack(padx=20, pady=(0, 10))

        ctk.CTkLabel(dialog, text="Image URLs (one URL per line):", font=("Arial", 12, "bold")).pack(padx=20, pady=(0, 4), anchor="w")
        url_text = ctk.CTkTextbox(dialog, height=140, width=420)
        url_text.pack(padx=20, pady=(0, 15))

        def add_and_close():
            name = name_entry.get().strip()
            raw_urls = url_text.get("1.0", "end").strip()
            urls = [u.strip() for u in raw_urls.splitlines() if u.strip()]

            if not name:
                messagebox.showwarning("Warning", "Please enter an item name.", parent=dialog)
                return
            if not urls:
                messagebox.showwarning("Warning", "Please enter at least one URL.", parent=dialog)
                return

            self.items_data.append({'name': name, 'urls': urls})
            self.refresh_table()
            dialog.destroy()

        ctk.CTkButton(
            dialog, text="Add Item", command=add_and_close,
            font=("Arial", 13, "bold"), height=36, fg_color="#276749"
        ).pack(fill="x", padx=20, pady=(0, 15))

    # =========================================================================
    # --- Download Engine ---
    # =========================================================================
    def select_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.download_folder = folder
            self.folder_label.configure(text=f"Path: {folder}", text_color="#68d391")

    def start_download(self):
        if self.is_downloading:
            return

        if not self.download_folder:
            messagebox.showwarning("Warning", "Please choose a save folder first.")
            return

        if not self.items_data:
            messagebox.showwarning("Warning", "No items to download. Please import or add items first.")
            return

        total_files = sum(len(item['urls']) for item in self.items_data)

        self.is_downloading = True
        self.download_btn.configure(state="disabled")
        self.progress_bar.set(0)
        self.status_label.configure(
            text=f"Starting download of {total_files} image(s)...", text_color="#63b3ed"
        )

        threading.Thread(
            target=self.download_process,
            args=(list(self.items_data), total_files),
            daemon=True
        ).start()

    def get_extension(self, url, content_type):
        ext = os.path.splitext(url.split("?")[0])[1]
        if ext and len(ext) < 6 and ext.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp']:
            return ext
        if content_type:
            if "jpeg" in content_type or "jpg" in content_type: return ".jpg"
            if "png"  in content_type: return ".png"
            if "gif"  in content_type: return ".gif"
            if "webp" in content_type: return ".webp"
        return ".jpg"

    def sanitize_filename(self, name):
        valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
        clean = ''.join(c for c in name if c in valid_chars or c.isalnum() or c in ' -_.()')
        return clean.strip() or "image"

    def download_process(self, items, total_files):
        success_count = 0
        error_count   = 0
        failed_items  = []
        file_index    = 0

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
        }

        for item in items:
            name     = item['name']
            urls     = item['urls']
            num_urls = len(urls)

            for idx, url in enumerate(urls):
                file_index += 1

                if not url.startswith('http://') and not url.startswith('https://'):
                    url = 'https://' + url

                display_name = name if num_urls == 1 else f"{name} ({idx + 1}/{num_urls})"
                self.after(0, self.status_label.configure,
                           {"text": f"Downloading {file_index}/{total_files}: {display_name}..."})

                try:
                    response = requests.get(url, headers=headers, stream=True, timeout=30, verify=False)
                    response.raise_for_status()

                    content_type = response.headers.get('content-type', '')
                    ext = self.get_extension(url, content_type)

                    if num_urls == 1:
                        base = name if name.lower().endswith(ext.lower()) else f"{name}{ext}"
                    else:
                        base_name = os.path.splitext(name)[0] if name.lower().endswith(ext.lower()) else name
                        base = f"{base_name}_{idx + 1}{ext}"

                    filename = self.sanitize_filename(base)
                    filepath = os.path.join(self.download_folder, filename)

                    with open(filepath, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)

                    success_count += 1

                except Exception as e:
                    error_msg = str(e)
                    print(f"Failed to download {url}: {error_msg}")
                    error_count += 1
                    failed_items.append(f"Name: {display_name} | URL: {url} | Error: {error_msg}")

                # Update progress bar safely
                self.after(0, self.progress_bar.set, file_index / total_files)

        # Write error log if any
        log_path = ""
        if failed_items:
            try:
                log_path = os.path.join(self.download_folder, "failed_downloads_log.txt")
                with open(log_path, 'w', encoding='utf-8') as f:
                    f.write("Failed Downloads Log:\n" + "=" * 40 + "\n\n")
                    f.write("\n".join(failed_items))
            except Exception:
                pass

        self.after(0, self.download_finished, success_count, error_count, log_path)

    def download_finished(self, success, errors, log_path=""):
        self.is_downloading = False
        self.download_btn.configure(state="normal")
        self.status_label.configure(
            text=f"Finished!  ✔ Downloaded: {success}   ✘ Failed: {errors}",
            text_color="#48bb78" if errors == 0 else "#ecc94b"
        )

        msg = f"Download Completed!\n\n✔ Successfully downloaded: {success} image(s)\n✘ Failed: {errors}"
        if errors > 0 and log_path:
            msg += f"\n\nError details saved to:\nfailed_downloads_log.txt"
            messagebox.showwarning("Finished with Errors", msg)
        else:
            messagebox.showinfo("Success", msg)


if __name__ == "__main__":
    app = App()
    app.mainloop()
