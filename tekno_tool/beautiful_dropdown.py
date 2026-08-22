import customtkinter as ctk
import arabic_reshaper
from bidi.algorithm import get_display

def ar(text):
    if not isinstance(text, str):
        return text
    if any("\uFE70" <= c <= "\uFEFF" or "\uFB50" <= c <= "\uFDFF" for c in text):
        return text
    if not any("\u0600" <= c <= "\u06FF" for c in text):
        return text
    return get_display(arabic_reshaper.reshape(text))

class BeautifulDropdown(ctk.CTkFrame):
    def __init__(self, master, values=None, command=None, width=200, state="normal", **kwargs):
        super().__init__(master, fg_color="transparent", **kwargs)
        self.values = values or []
        self.command = command
        self.current_value = None
        self.state = state
        self.width = width
        
        self.main_btn = ctk.CTkButton(
            self, text="", width=self.width,
            fg_color="#3b3b3b", hover_color="#4f4f4f",
            text_color="#FFFFFF", command=self.toggle_dropdown,
            state=self.state, anchor="w",
            corner_radius=6, border_width=1, border_color="#555555"
        )
        self.main_btn.pack(fill="both", expand=True)
        
        self.popup = None
        
        if self.values:
            self.set(self.values[0])
            
    def configure(self, **kwargs):
        if 'values' in kwargs:
            self.values = kwargs.pop('values')
        if 'state' in kwargs:
            self.state = kwargs.pop('state')
            self.main_btn.configure(state=self.state)
        if 'command' in kwargs:
            self.command = kwargs.pop('command')
            
        super().configure(**kwargs)
        
    def set(self, value):
        self.current_value = value
        self.main_btn.configure(text=f"  {ar(value)}  ▼")
        
    def get(self):
        return self.current_value
        
    def toggle_dropdown(self):
        if self.state == "disabled":
            return
            
        if self.popup is not None and self.popup.winfo_exists():
            self.close_dropdown()
            return
            
        self.popup = ctk.CTkToplevel(self)
        self.popup.overrideredirect(True)
        self.popup.attributes("-topmost", True)
        
        # Calculate position
        x = self.main_btn.winfo_rootx()
        y = self.main_btn.winfo_rooty() + self.main_btn.winfo_height() + 2
        
        # Determine popup height based on number of items (max 250px)
        item_height = 32
        h = min(len(self.values) * item_height + 10, 250)
        
        self.popup.geometry(f"{self.width}x{h}+{x}+{y}")
        
        scroll = ctk.CTkScrollableFrame(self.popup, width=self.width, height=h, fg_color="#2b2b2b", corner_radius=6)
        scroll.pack(fill="both", expand=True)
        
        for val in self.values:
            btn = ctk.CTkButton(
                scroll, text=ar(val), fg_color="transparent",
                hover_color="#1f538d", anchor="w",
                text_color="#FFFFFF", height=28,
                corner_radius=4,
                command=lambda v=val: self.select_item(v)
            )
            btn.pack(fill="x", pady=1, padx=2)
            
        self.popup.focus()
        
        # Use a global click binding on the root window to close the dropdown if clicked outside
        root = self.winfo_toplevel()
        self._global_click_id = root.bind("<Button-1>", self.on_global_click, add="+")
        
    def select_item(self, value):
        self.set(value)
        self.close_dropdown()
        if self.command:
            self.command(value)
            
    def close_dropdown(self):
        if self.popup is not None and self.popup.winfo_exists():
            self.popup.destroy()
            self.popup = None
            if hasattr(self, "_global_click_id"):
                root = self.winfo_toplevel()
                root.unbind("<Button-1>", self._global_click_id)
                del self._global_click_id
                
    def on_global_click(self, event):
        if self.popup is None or not self.popup.winfo_exists():
            return
            
        x, y = event.x_root, event.y_root
        
        # Check if click is inside the popup
        px, py = self.popup.winfo_rootx(), self.popup.winfo_rooty()
        pw, ph = self.popup.winfo_width(), self.popup.winfo_height()
        if (px <= x <= px + pw) and (py <= y <= py + ph):
            return
            
        # Check if click is inside the main button (let toggle_dropdown handle it)
        bx, by = self.main_btn.winfo_rootx(), self.main_btn.winfo_rooty()
        bw, bh = self.main_btn.winfo_width(), self.main_btn.winfo_height()
        if (bx <= x <= bx + bw) and (by <= y <= by + bh):
            return
            
        self.close_dropdown()
