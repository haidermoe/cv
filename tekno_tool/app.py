import customtkinter as ctk
import tkinter.messagebox as messagebox
import tkinter.filedialog as filedialog
import threading
import os
import sys
import subprocess
import traceback

import bidi_patch
bidi_patch.apply_bidi_patch()

# Redirect stdout/stderr only when running as a compiled bundle to prevent console issues
if getattr(sys, 'frozen', False):
    try:
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')
    except Exception:
        pass

from beautiful_dropdown import BeautifulDropdown
from comparator import compare_excel_files, get_sheet_names, get_headers

# Set appearance mode and color theme
ctk.set_appearance_mode("System")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Excel Diff Tool")
        self.geometry("800x850")
        self.resizable(True, True)
        
        # Set window icon if icon.ico exists in the directory
        icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon.ico")
        if os.path.exists(icon_path):
            try:
                self.iconbitmap(icon_path)
            except Exception as e:
                pass

        # Title Label
        self.title_label = ctk.CTkLabel(self, text="Excel Diff Tool", font=ctk.CTkFont(size=24, weight="bold"))
        self.title_label.pack(pady=(20, 5))

        self.subtitle_label = ctk.CTkLabel(self, text="Compare or Merge files using smart AI column mapping.", font=ctk.CTkFont(size=14))
        self.subtitle_label.pack(pady=(0, 15))

        # Operation Mode Frame
        self.frame_mode = ctk.CTkFrame(self)
        self.frame_mode.pack(pady=5, padx=20, fill="x")
        
        self.lbl_mode = ctk.CTkLabel(self.frame_mode, text="Operation Mode:", width=100, anchor="w", font=ctk.CTkFont(weight="bold"))
        self.lbl_mode.pack(side="left", padx=10, pady=10)
        
        self.mode_var = ctk.StringVar(value="compare")
        
        self.radio_compare = ctk.CTkRadioButton(self.frame_mode, text="وضع المقارنة (Compare)", variable=self.mode_var, value="compare", command=self.on_mode_change)
        self.radio_compare.pack(side="left", padx=10, pady=10)
        
        self.radio_pull = ctk.CTkRadioButton(self.frame_mode, text="وضع سحب البيانات (Pull Data)", variable=self.mode_var, value="pull", command=self.on_mode_change)
        self.radio_pull.pack(side="left", padx=10, pady=10)

        # First File (Website) Frame
        self.frame_old = ctk.CTkFrame(self)
        self.frame_old.pack(pady=5, padx=20, fill="x")
        
        self.lbl_old = ctk.CTkLabel(self.frame_old, text="ملف الموقع الإلكتروني:", width=140, anchor="w", font=ctk.CTkFont(weight="bold", size=13))
        self.lbl_old.pack(side="left", padx=10, pady=10)
        
        self.entry_old = ctk.CTkEntry(self.frame_old, placeholder_text="اختر ملف الموقع (Excel أو CSV)...", width=410, state="disabled")
        self.entry_old.pack(side="left", padx=10, pady=10)
        
        self.btn_old = ctk.CTkButton(self.frame_old, text="تصفح", width=80, command=self.browse_old)
        self.btn_old.pack(side="left", padx=10, pady=10)

        # Second File (Warehouse) Frame
        self.frame_new = ctk.CTkFrame(self)
        self.frame_new.pack(pady=5, padx=20, fill="x")
        
        self.lbl_new = ctk.CTkLabel(self.frame_new, text="ملف جرد المخزن (الأساس):", width=140, anchor="w", font=ctk.CTkFont(weight="bold", size=13))
        self.lbl_new.pack(side="left", padx=10, pady=10)
        
        self.entry_new = ctk.CTkEntry(self.frame_new, placeholder_text="اختر ملف المخزن (Excel)...", width=410, state="disabled")
        self.entry_new.pack(side="left", padx=10, pady=10)
        
        self.btn_new = ctk.CTkButton(self.frame_new, text="تصفح", width=80, command=self.browse_new)
        self.btn_new.pack(side="left", padx=10, pady=10)

        # Target Sheet Frame
        self.frame_sheet = ctk.CTkFrame(self)
        self.frame_sheet.pack(pady=5, padx=20, fill="x")
        
        self.lbl_sheet = ctk.CTkLabel(self.frame_sheet, text="الشيت المستهدف:", width=140, anchor="w", font=ctk.CTkFont(size=13))
        self.lbl_sheet.pack(side="left", padx=10, pady=10)
        
        self.menu_sheet = BeautifulDropdown(self.frame_sheet, values=["Compare All Sheets"], width=500, state="disabled", command=self.on_sheet_selected)
        self.menu_sheet.pack(side="left", padx=10, pady=10)

        # Unique ID Columns Frame
        self.frame_keys = ctk.CTkFrame(self)
        self.frame_keys.pack(pady=5, padx=20, fill="x")
        
        self.lbl_key_title = ctk.CTkLabel(self.frame_keys, text="عمود الربط (الاسم):", width=140, anchor="w", font=ctk.CTkFont(size=13))
        self.lbl_key_title.pack(side="left", padx=10, pady=10)
        
        self.menu_key_old = BeautifulDropdown(self.frame_keys, values=["Row-by-Row"], width=245, state="disabled")
        self.menu_key_old.pack(side="left", padx=5, pady=10)
        
        self.menu_key_new = BeautifulDropdown(self.frame_keys, values=["Row-by-Row"], width=245, state="disabled")
        self.menu_key_new.pack(side="left", padx=5, pady=10)
        
        # Comparison Columns Frame
        self.frame_comps = ctk.CTkFrame(self)
        self.frame_comps.pack(pady=5, padx=20, fill="x")
        
        self.lbl_comp_title = ctk.CTkLabel(self.frame_comps, text="عمود المقارنة:", width=140, anchor="w", font=ctk.CTkFont(size=13))
        self.lbl_comp_title.pack(side="left", padx=10, pady=10)
        
        self.menu_comp_old = BeautifulDropdown(self.frame_comps, values=["Compare All Columns"], width=245, state="disabled")
        self.menu_comp_old.pack(side="left", padx=5, pady=10)
        
        self.entry_new_col_name = ctk.CTkEntry(self.frame_comps, placeholder_text="اسم العمود الجديد...", width=245)
        # Not packed initially, only when in pull mode
        
        self.menu_comp_new = BeautifulDropdown(self.frame_comps, values=["Compare All Columns"], width=245, state="disabled")
        self.menu_comp_new.pack(side="left", padx=5, pady=10)

        # Options Frame
        self.frame_opts = ctk.CTkFrame(self)
        self.frame_opts.pack(pady=5, padx=20, fill="x")
        
        self.chk_ignore_punct_var = ctk.BooleanVar(value=True)
        self.chk_ignore_punct = ctk.CTkCheckBox(self.frame_opts, text="تجاهل الفواصل والرموز في عمود المعرّف (مثل ربط 'Item/1' مع 'Item1')", variable=self.chk_ignore_punct_var, font=ctk.CTkFont(size=13))
        self.chk_ignore_punct.pack(side="left", padx=10, pady=10)

        # Threshold Frame
        self.frame_thresh = ctk.CTkFrame(self)
        self.frame_thresh.pack(pady=5, padx=20, fill="x")
        
        self.chk_fuzzy_var = ctk.BooleanVar(value=True)
        self.chk_fuzzy = ctk.CTkCheckBox(self.frame_thresh, text="تفعيل اقتراحات التشابه (Fuzzy Matching)", variable=self.chk_fuzzy_var, font=ctk.CTkFont(size=13), command=self.toggle_fuzzy)
        self.chk_fuzzy.pack(side="left", padx=10, pady=10)
        
        self.lbl_sim = ctk.CTkLabel(self.frame_thresh, text="نسبة التشابه المطلوبة للاقتراحات:", width=220, anchor="w", font=ctk.CTkFont(size=13))
        self.lbl_sim.pack(side="left", padx=10, pady=10)
        
        self.entry_sim = ctk.CTkEntry(self.frame_thresh, width=60)
        self.entry_sim.insert(0, "70")
        self.entry_sim.pack(side="left", padx=5, pady=10)
        
        self.lbl_sim_pct = ctk.CTkLabel(self.frame_thresh, text="%", font=ctk.CTkFont(size=13))
        self.lbl_sim_pct.pack(side="left", padx=0, pady=10)

        # AI Frame
        self.frame_ai = ctk.CTkFrame(self)
        self.frame_ai.pack(pady=5, padx=20, fill="x")
        
        self.chk_ai_var = ctk.BooleanVar(value=True)
        self.chk_ai = ctk.CTkCheckBox(self.frame_ai, text="تفعيل المطابقة الذكية بالذكاء الاصطناعي (Gemini 2.5 Flash)", variable=self.chk_ai_var, font=ctk.CTkFont(size=13, weight="bold"))
        self.chk_ai.pack(side="left", padx=10, pady=10)

        # Filter Frame
        self.frame_filter = ctk.CTkFrame(self)
        self.frame_filter.pack(pady=5, padx=20, fill="x")
        
        self.lbl_filter = ctk.CTkLabel(self.frame_filter, text="كلمات مفتاحية للفلترة (مفصولة بفاصلة):", width=220, anchor="w", font=ctk.CTkFont(size=13))
        self.lbl_filter.pack(side="left", padx=10, pady=10)
        
        self.entry_filter = ctk.CTkEntry(self.frame_filter, placeholder_text="مثال: ps5, ps4, ns", width=300)
        self.entry_filter.pack(side="left", padx=5, pady=10)

        # Reference File Frame
        self.frame_ref = ctk.CTkFrame(self)
        self.frame_ref.pack(pady=5, padx=20, fill="x")
        
        self.lbl_ref = ctk.CTkLabel(self.frame_ref, text="ملف المرجع (Excel - اختياري):", width=220, anchor="w", font=ctk.CTkFont(size=13, weight="bold"))
        self.lbl_ref.pack(side="left", padx=10, pady=10)
        
        self.entry_ref = ctk.CTkEntry(self.frame_ref, placeholder_text="اختر ملف المرجع الذي يوحد الأسماء...", width=220, state="disabled")
        self.entry_ref.pack(side="left", padx=5, pady=10)
        
        self.btn_ref = ctk.CTkButton(self.frame_ref, text="Browse", width=80, command=self.browse_ref_file)
        self.btn_ref.pack(side="left", padx=5, pady=10)

        # Progress and Status
        self.status_label = ctk.CTkLabel(self, text="Ready", font=ctk.CTkFont(size=12))
        self.status_label.pack(pady=(10, 5))

        self.progress_bar = ctk.CTkProgressBar(self, width=500)
        self.progress_bar.pack(pady=(0, 10))
        self.progress_bar.set(0)

        # Start Button
        self.start_button = ctk.CTkButton(self, text="Start Comparison", font=ctk.CTkFont(size=16, weight="bold"), height=40, command=self.start_comparison)
        self.start_button.pack(pady=10)

        self.old_filepath = ""
        self.new_filepath = ""
        self.ref_filepath = ""
        self.common_sheets = []

    def on_mode_change(self):
        mode = self.mode_var.get()
        if mode == "compare":
            self.lbl_comp_title.configure(text="عمود المقارنة:")
            if self.entry_new_col_name.winfo_ismapped():
                self.entry_new_col_name.pack_forget()
            self.menu_comp_old.pack(side="left", padx=5, pady=10, before=self.menu_comp_new)
        else:
            self.lbl_comp_title.configure(text="العمود المراد سحبه:")
            if self.menu_comp_old.winfo_ismapped():
                self.menu_comp_old.pack_forget()
            self.entry_new_col_name.pack(side="left", padx=5, pady=10, before=self.menu_comp_new)

    def browse_ref_file(self):
        filepath = filedialog.askopenfilename(filetypes=[("Excel/CSV Files", "*.xlsx *.xls *.csv")])
        if filepath:
            self.ref_filepath = filepath
            self.update_entry(self.entry_ref, os.path.basename(filepath))

    def toggle_fuzzy(self):
        if self.chk_fuzzy_var.get():
            self.entry_sim.configure(state="normal")
        else:
            self.entry_sim.configure(state="disabled")

    def update_entry(self, entry, text):
        entry.configure(state="normal")
        entry.delete(0, "end")
        entry.insert(0, text)
        entry.configure(state="disabled")

    def browse_old(self):
        filename = filedialog.askopenfilename(
            title="Select Old/Base Excel File",
            filetypes=[("Excel/CSV files", "*.xlsx *.xls *.csv")]
        )
        if filename:
            self.old_filepath = filename
            self.update_entry(self.entry_old, os.path.basename(filename))
            self.check_files_and_load_sheets()

    def browse_new(self):
        filename = filedialog.askopenfilename(
            title="Select Updated Excel File",
            filetypes=[("Excel/CSV files", "*.xlsx *.xls *.csv")]
        )
        if filename:
            self.new_filepath = filename
            self.update_entry(self.entry_new, os.path.basename(filename))
            self.check_files_and_load_sheets()

    def check_files_and_load_sheets(self):
        if self.old_filepath and self.new_filepath:
            self.status_label.configure(text="Loading sheets...")
            try:
                old_sheets = get_sheet_names(self.old_filepath)
                new_sheets = get_sheet_names(self.new_filepath)
                
                is_old_csv = self.old_filepath.lower().endswith('.csv')
                is_new_csv = self.new_filepath.lower().endswith('.csv')
                
                if is_old_csv and not is_new_csv:
                    self.common_sheets = new_sheets
                elif is_new_csv and not is_old_csv:
                    self.common_sheets = old_sheets
                elif is_old_csv and is_new_csv:
                    self.common_sheets = ["CSV Data"]
                else:
                    self.common_sheets = [s for s in old_sheets if s in new_sheets]
                
                if self.common_sheets:
                    options = ["Compare All Sheets"] + self.common_sheets
                    self.menu_sheet.configure(values=options, state="normal")
                    self.menu_sheet.set("Compare All Sheets")
                    self.on_sheet_selected("Compare All Sheets")
                else:
                    self.menu_sheet.configure(values=["No common sheets"], state="disabled")
                    self.menu_sheet.set("No common sheets")
                    self.menu_key_old.configure(values=["Row-by-Row"], state="disabled")
                    self.menu_key_new.configure(values=["Row-by-Row"], state="disabled")
                    self.menu_comp_old.configure(values=["Compare All Columns"], state="disabled")
                    self.menu_comp_new.configure(values=["Compare All Columns"], state="disabled")
                    
                self.status_label.configure(text="Ready")
            except Exception as e:
                self.status_label.configure(text="Error loading sheets.")
                print(e)
                if "Permission" in str(e) or "الوصول" in str(e) or "denied" in str(e).lower():
                    messagebox.showerror("ملف قيد الاستخدام", "أحد الملفات مفتوح في برنامج الإكسل أو برنامج آخر. يرجى إغلاق الملفات تماماً ثم المحاولة مرة أخرى.", parent=self.winfo_toplevel())
                else:
                    messagebox.showerror("خطأ", f"حدث خطأ أثناء قراءة الملفات:\n{e}", parent=self.winfo_toplevel())

    def on_sheet_selected(self, sheet_name):
        self.status_label.configure(text="Loading headers...")
        self.update()
        try:
            target = self.common_sheets[0] if sheet_name == "Compare All Sheets" else sheet_name
            old_headers = get_headers(self.old_filepath, target)
            new_headers = get_headers(self.new_filepath, target)
            
            if old_headers and new_headers:
                old_key_opts = ["Row-by-Row"] + old_headers
                new_key_opts = ["Row-by-Row"] + new_headers
                self.menu_key_old.configure(values=old_key_opts, state="normal")
                self.menu_key_new.configure(values=new_key_opts, state="normal")
                self.menu_key_old.set("Row-by-Row")
                self.menu_key_new.set("Row-by-Row")
                
                old_comp_opts = ["Compare All Columns"] + old_headers
                new_comp_opts = ["Compare All Columns"] + new_headers
                self.menu_comp_old.configure(values=old_comp_opts, state="normal")
                self.menu_comp_new.configure(values=new_comp_opts, state="normal")
                self.menu_comp_old.set("Compare All Columns")
                self.menu_comp_new.set("Compare All Columns")
                self.status_label.configure(text="Ready")
                self.update()
            else:
                self.status_label.configure(text="Could not load headers. Are the sheets empty?")
                self.update()
                self.menu_key_old.configure(values=["Row-by-Row"], state="disabled")
                self.menu_key_new.configure(values=["Row-by-Row"], state="disabled")
                self.menu_comp_old.configure(values=["Compare All Columns"], state="disabled")
                self.menu_comp_new.configure(values=["Compare All Columns"], state="disabled")
                if not old_headers:
                    messagebox.showwarning("تنبيه", "لم يتمكن البرنامج من قراءة أعمدة الملف الأول. يرجى التأكد من أن الملف غير مفتوح في برنامج آخر أو أنه ليس فارغاً تماماً.", parent=self.winfo_toplevel())
                elif not new_headers:
                    messagebox.showwarning("تنبيه", "لم يتمكن البرنامج من قراءة أعمدة الملف الثاني. يرجى التأكد من أن الملف غير مفتوح في برنامج آخر أو أنه ليس فارغاً تماماً.", parent=self.winfo_toplevel())
                
            self.status_label.configure(text="Ready")
        except Exception as e:
            self.status_label.configure(text="Error loading headers.")
            print(e)
            if "Permission" in str(e) or "الوصول" in str(e) or "denied" in str(e).lower():
                messagebox.showerror("ملف قيد الاستخدام", "أحد الملفات مفتوح في برنامج الإكسل. يرجى إغلاقه ثم المحاولة.")
            else:
                messagebox.showerror("خطأ", f"حدث خطأ أثناء قراءة الأعمدة:\n{e}")

    def update_progress(self, message, percent):
        self.after(0, self._update_gui, message, percent)

    def _update_gui(self, message, percent):
        self.status_label.configure(text=message)
        self.progress_bar.set(percent)

    def comparison_thread(self, old_path, new_path, out_path, key_old, key_new, target_sheet, comp_old, comp_new, ignore_punct, sim_thresh, use_ai, ai_api_key, mode, new_col_name, filter_keywords, ref_filepath):
        try:
            from comparator import compare_excel_files
            compare_excel_files(
                old_path, new_path, out_path,
                key_col_old=key_old, key_col_new=key_new, target_sheet=target_sheet,
                comp_col_old=comp_old, comp_col_new=comp_new, ignore_punct=ignore_punct,
                similarity_threshold=sim_thresh, use_ai=use_ai, ai_api_key=ai_api_key,
                mode=mode, new_col_name=new_col_name, filter_keywords=filter_keywords,
                ref_filepath=ref_filepath,
                progress_callback=self.update_progress
            )
            self.after(0, self.on_success, out_path)
        except Exception as e:
            self.after(0, self.on_error, str(e))

    def on_success(self, out_path):
        self.start_button.configure(state="normal")
        self.status_label.configure(text="Operation finished successfully.")
        self.progress_bar.set(1.0)
        messagebox.showinfo("Success", f"Report saved successfully to:\n{out_path}")

    def on_error(self, error_msg):
        self.start_button.configure(state="normal")
        self.status_label.configure(text="Error occurred.")
        self.progress_bar.set(0)
        messagebox.showerror("Error", f"An error occurred:\n{error_msg}")

    def start_comparison(self):
        if not self.old_filepath or not self.new_filepath:
            messagebox.showwarning("Missing files", "Please select both files first.")
            return

        if not os.path.exists(self.old_filepath) or not os.path.exists(self.new_filepath):
            messagebox.showerror("File Error", "One or both selected files do not exist.")
            return

        mode = self.mode_var.get()
        key_old = self.menu_key_old.get()
        key_new = self.menu_key_new.get()
        target_sheet = self.menu_sheet.get()
        comp_old = self.menu_comp_old.get()
        comp_new = self.menu_comp_new.get()
        new_col_name = self.entry_new_col_name.get().strip()
        ignore_punct = self.chk_ignore_punct_var.get()
        use_ai = self.chk_ai_var.get()
        filter_keywords = self.entry_filter.get().strip()
        
        if mode == "pull":
            if not new_col_name:
                messagebox.showwarning("Missing info", "يرجى كتابة اسم العمود الجديد.")
                return
            if comp_new == "Compare All Columns":
                messagebox.showwarning("Missing info", "يرجى اختيار 'العمود المراد سحبه' من الملف الجديد (وليس Compare All Columns).")
                return

        try:
            if self.chk_fuzzy_var.get():
                similarity_threshold = float(self.entry_sim.get().strip())
                if not (0 <= similarity_threshold <= 100):
                    messagebox.showerror("Error", "Similarity threshold must be between 0 and 100")
                    self.start_button.configure(state="normal")
                    return
            else:
                similarity_threshold = 101.0
        except ValueError:
            messagebox.showerror("Error", "Invalid similarity threshold. Please enter a valid number.")
            self.start_button.configure(state="normal")
            return

        ai_api_key = ""
        if use_ai:
            import json
            if getattr(sys, 'frozen', False):
                application_path = os.path.dirname(sys.executable)
            else:
                application_path = os.path.dirname(os.path.abspath(__file__))
                
            config_path = os.path.join(application_path, "config.json")
            
            if not os.path.exists(config_path):
                # Fallback in case they run it from dist/ but config is in parent dir
                parent_config = os.path.join(os.path.dirname(application_path), "config.json")
                if os.path.exists(parent_config):
                    config_path = parent_config
                    
            if os.path.exists(config_path):
                try:
                    with open(config_path, "r", encoding="utf-8") as f:
                        ai_api_key = json.load(f).get("api_key", "")
                except Exception as e:
                    print("Error reading config.json:", e)
            else:
                messagebox.showwarning("تنبيه", "ملف config.json غير موجود. لن يتم تفعيل الذكاء الاصطناعي.")

        out_path = filedialog.asksaveasfilename(
            title="Save Report As",
            defaultextension=".xlsx",
            filetypes=[("Excel file", "*.xlsx")],
            initialfile="Data_Report.xlsx"
        )

        if not out_path:
            self.start_button.configure(state="normal")
            return

        self.start_button.configure(state="disabled")
        self.status_label.configure(text="Initializing...")
        self.progress_bar.set(0)

        thread = threading.Thread(target=self.comparison_thread, args=(self.old_filepath, self.new_filepath, out_path, key_old, key_new, target_sheet, comp_old, comp_new, ignore_punct, similarity_threshold, use_ai, ai_api_key, mode, new_col_name, filter_keywords, self.ref_filepath))
        thread.daemon = True
        thread.start()

if __name__ == "__main__":
    app = App()
    app.mainloop()
