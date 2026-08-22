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
    reshaped_text = arabic_reshaper.reshape(text)
    return get_display(reshaped_text)

def apply_bidi_patch():
    _OriginalCTkLabel = ctk.CTkLabel
    _OriginalCTkButton = ctk.CTkButton
    _OriginalCTkRadioButton = ctk.CTkRadioButton
    _OriginalCTkCheckBox = ctk.CTkCheckBox
    _OriginalCTkEntry = ctk.CTkEntry
    _OriginalCTkOptionMenu = ctk.CTkOptionMenu

    class PatchedCTkLabel(_OriginalCTkLabel):
        def __init__(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().__init__(*args, **kwargs)
        def configure(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().configure(*args, **kwargs)

    class PatchedCTkButton(_OriginalCTkButton):
        def __init__(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().__init__(*args, **kwargs)
        def configure(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().configure(*args, **kwargs)

    class PatchedCTkRadioButton(_OriginalCTkRadioButton):
        def __init__(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().__init__(*args, **kwargs)
        def configure(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().configure(*args, **kwargs)

    class PatchedCTkCheckBox(_OriginalCTkCheckBox):
        def __init__(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().__init__(*args, **kwargs)
        def configure(self, *args, **kwargs):
            if 'text' in kwargs and isinstance(kwargs['text'], str):
                kwargs['text'] = ar(kwargs['text'])
            super().configure(*args, **kwargs)

    class PatchedCTkEntry(_OriginalCTkEntry):
        def __init__(self, *args, **kwargs):
            if 'placeholder_text' in kwargs and isinstance(kwargs['placeholder_text'], str):
                kwargs['placeholder_text'] = ar(kwargs['placeholder_text'])
            super().__init__(*args, **kwargs)
        def configure(self, *args, **kwargs):
            if 'placeholder_text' in kwargs and isinstance(kwargs['placeholder_text'], str):
                kwargs['placeholder_text'] = ar(kwargs['placeholder_text'])
            super().configure(*args, **kwargs)

    class PatchedCTkOptionMenu(_OriginalCTkOptionMenu):
        def __init__(self, *args, **kwargs):
            self._ar_map = {}
            if 'values' in kwargs:
                new_vals = []
                for v in kwargs['values']:
                    res = ar(v)
                    self._ar_map[res] = v
                    new_vals.append(res)
                kwargs['values'] = new_vals
            
            if 'command' in kwargs and kwargs['command']:
                orig_cmd = kwargs['command']
                kwargs['command'] = lambda val, cmd=orig_cmd: cmd(self._ar_map.get(val, val))
                
            super().__init__(*args, **kwargs)

        def configure(self, *args, **kwargs):
            if not hasattr(self, '_ar_map'):
                self._ar_map = {}
            if 'values' in kwargs:
                new_vals = []
                for v in kwargs['values']:
                    res = ar(v)
                    self._ar_map[res] = v
                    new_vals.append(res)
                kwargs['values'] = new_vals

            if 'command' in kwargs and kwargs['command']:
                orig_cmd = kwargs['command']
                kwargs['command'] = lambda val, cmd=orig_cmd: cmd(self._ar_map.get(val, val))
                
            super().configure(*args, **kwargs)

        def get(self):
            val = super().get()
            return self._ar_map.get(val, val)

        def set(self, value):
            if hasattr(self, '_ar_map') and value in self._ar_map:
                res = value
            else:
                res = ar(value)
                if not hasattr(self, '_ar_map'):
                    self._ar_map = {}
                self._ar_map[res] = value
            super().set(res)

    ctk.CTkLabel = PatchedCTkLabel
    ctk.CTkButton = PatchedCTkButton
    ctk.CTkRadioButton = PatchedCTkRadioButton
    ctk.CTkCheckBox = PatchedCTkCheckBox
    ctk.CTkEntry = PatchedCTkEntry
    ctk.CTkOptionMenu = PatchedCTkOptionMenu
