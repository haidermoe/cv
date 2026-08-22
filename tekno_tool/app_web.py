import streamlit as st
import openpyxl
import pandas as pd
import os
import tempfile
import sys

# Import core comparison engine
from comparator import compare_excel_files, get_sheet_names, get_headers

st.set_page_config(
    page_title="أداة تكنو - مقارنة وسحب بيانات الإكسل",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Arabic Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    html, body, [class*="css"], div, span, p, h1, h2, h3, label {
        font-family: 'Cairo', sans-serif !important;
        direction: rtl;
        text-align: right;
    }
    
    .main-title {
        text-align: center;
        font-size: 2.2rem;
        font-weight: 800;
        color: #1E293B;
        margin-bottom: 0.5rem;
    }
    
    .sub-title {
        text-align: center;
        font-size: 1.1rem;
        color: #64748B;
        margin-bottom: 2rem;
    }

    .stButton>button {
        width: 100%;
        background-color: #2563EB;
        color: white;
        font-weight: bold;
        font-size: 1.1rem;
        border-radius: 8px;
        padding: 0.6rem;
    }
    .stButton>button:hover {
        background-color: #1D4ED8;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">⚡ أداة تكنو (Tekno Tool)</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">أداة مقارنة وسحب بيانات الإكسل الذكية للمتاجر الإلكترونية والمخازن</div>', unsafe_allow_html=True)

# Sidebar Options
st.sidebar.header("⚙️ إعدادات النمط والخيارات")
mode = st.sidebar.radio(
    "اختر وضع التشغيل:",
    ["وضع المقارنة (Compare)", "وضع سحب البيانات (Pull Data)"],
    index=0
)
mode_val = "compare" if "Compare" in mode else "pull"

ignore_punct = st.sidebar.checkbox("تجاهل الفواصل والرموز على عمود المعرف", value=True)
enable_fuzzy = st.sidebar.checkbox("تفعيل اقتراحات التشابه (Fuzzy Matching)", value=True)
sim_thresh = st.sidebar.slider("نسبة التشابه المطلوبة للاقتراحات %", 0, 100, 70) if enable_fuzzy else 101.0

filter_keywords = st.sidebar.text_input("كلمات مفتاحية للفلترة (مفصولة بفاصلة)", placeholder="مثال: ps5, ps4, ns")

st.sidebar.markdown("---")
st.sidebar.info("💡 تم تطوير الأداة لربط ومقارنة بيانات المتجر الإلكتروني والمخازن بدقة متناهية.")

# File Upload Section
col1, col2, col3 = st.columns(3)

with col1:
    st.subheader("1️⃣ ملف الموقع الإلكتروني")
    file_old = st.file_uploader("اختر ملف الموقع (Excel أو CSV)", type=["xlsx", "xls", "csv"], key="file_old")

with col2:
    st.subheader("2️⃣ ملف جرد المخزن")
    file_new = st.file_uploader("اختر ملف المخزن (Excel أو CSV)", type=["xlsx", "xls", "csv"], key="file_new")

with col3:
    st.subheader("3️⃣ ملف التصحيح / المرجع (اختياري)")
    file_ref = st.file_uploader("اختر ملف المرجع للتصحيح (Excel أو CSV)", type=["xlsx", "xls", "csv"], key="file_ref")

if file_old and file_new:
    st.markdown("---")
    st.subheader("📋 تحديد الأعمدة والشيتات المستهدفة")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_old.name)[1]) as tmp_old:
        tmp_old.write(file_old.getbuffer())
        tmp_old_path = tmp_old.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_new.name)[1]) as tmp_new:
        tmp_new.write(file_new.getbuffer())
        tmp_new_path = tmp_new.name

    tmp_ref_path = ""
    if file_ref:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_ref.name)[1]) as tmp_ref:
            tmp_ref.write(file_ref.getbuffer())
            tmp_ref_path = tmp_ref.name

    try:
        old_sheets = get_sheet_names(tmp_old_path)
        new_sheets = get_sheet_names(tmp_new_path)
        
        is_old_csv = tmp_old_path.lower().endswith('.csv')
        is_new_csv = tmp_new_path.lower().endswith('.csv')

        if is_old_csv and not is_new_csv:
            common_sheets = new_sheets
        elif is_new_csv and not is_old_csv:
            common_sheets = old_sheets
        elif is_old_csv and is_new_csv:
            common_sheets = ["CSV Data"]
        else:
            common_sheets = [s for s in old_sheets if s in new_sheets]

        if common_sheets:
            sheet_options = ["Compare All Sheets"] + common_sheets
            selected_sheet = st.selectbox("اختر الشيت المستهدف:", sheet_options)
            
            target_for_headers = common_sheets[0] if selected_sheet == "Compare All Sheets" else selected_sheet
            old_headers = get_headers(tmp_old_path, target_for_headers)
            new_headers = get_headers(tmp_new_path, target_for_headers)

            c_key1, c_key2 = st.columns(2)
            with c_key1:
                key_old_opts = ["Row-by-Row"] + old_headers
                default_old_idx = 0
                for idx, h in enumerate(key_old_opts):
                    if any(k in h.lower() for k in ["sku", "اسم", "name", "title"]):
                        default_old_idx = idx
                        break
                key_old = st.selectbox("عمود الربط (الاسم) في ملف الموقع:", key_old_opts, index=default_old_idx)

            with c_key2:
                key_new_opts = ["Row-by-Row"] + new_headers
                default_new_idx = 0
                for idx, h in enumerate(key_new_opts):
                    if any(k in h.lower() for k in ["sku", "اسم", "name", "title"]):
                        default_new_idx = idx
                        break
                key_new = st.selectbox("عمود الربط (الاسم) في ملف المخزن:", key_new_opts, index=default_new_idx)

            c_comp1, c_comp2 = st.columns(2)
            with c_comp1:
                comp_old_opts = ["Compare All Columns"] + old_headers
                default_comp_old = 0
                for idx, h in enumerate(comp_old_opts):
                    if any(k in h.lower() for k in ["qty", "الرصيد", "مخزون", "quantity", "stock"]):
                        default_comp_old = idx
                        break
                comp_old = st.selectbox("عمود المقارنة في ملف الموقع:", comp_old_opts, index=default_comp_old)

            with c_comp2:
                comp_new_opts = ["Compare All Columns"] + new_headers
                default_comp_new = 0
                for idx, h in enumerate(comp_new_opts):
                    if any(k in h.lower() for k in ["qty", "الرصيد", "مخزون", "quantity", "stock"]):
                        default_comp_new = idx
                        break
                label_comp_new = "العمود المراد سحبه من ملف المخزن:" if mode_val == "pull" else "عمود المقارنة في ملف المخزن:"
                comp_new = st.selectbox(label_comp_new, comp_new_opts, index=default_comp_new)

            new_col_name = ""
            if mode_val == "pull":
                new_col_name = st.text_input("اسم العمود الجديد القادم من المخزن:", value="المخزون الساحب")

            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🚀 بدء معالجة الملفات والمقارنة"):
                with st.spinner("جاري معالجة وتوحيد البيانات ومقارنتها..."):
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_out:
                        output_file_path = tmp_out.name

                    try:
                        compare_excel_files(
                            tmp_old_path, tmp_new_path, output_file_path,
                            key_col_old=key_old, key_col_new=key_new,
                            target_sheet=selected_sheet,
                            comp_col_old=comp_old, comp_col_new=comp_new,
                            ignore_punct=ignore_punct,
                            similarity_threshold=sim_thresh,
                            use_ai=False, ai_api_key="",
                            mode=mode_val, new_col_name=new_col_name,
                            filter_keywords=filter_keywords,
                            ref_filepath=tmp_ref_path
                        )

                        with open(output_file_path, "rb") as f:
                            report_bytes = f.read()

                        st.success("✅ تمت العملية بنجاح! التقرير جاهز للتحميل.")
                        st.download_button(
                            label="📥 تحميل تقرير المقارنة النهائي (Excel)",
                            data=report_bytes,
                            file_name="Tekno_Data_Report.xlsx",
                            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                    except Exception as e:
                        st.error(f"حدث خطأ أثناء معالجة البيانات: {e}")
                    finally:
                        if os.path.exists(output_file_path):
                            try: os.remove(output_file_path)
                            except: pass

        else:
            st.error("لم يتم العثور على شيتات مشتركة بين الملفين.")

    except Exception as e:
        st.error(f"حدث خطأ أثناء قراءة الشيتات والأعمدة: {e}")
    finally:
        for p in [tmp_old_path, tmp_new_path, tmp_ref_path]:
            if p and os.path.exists(p):
                try: os.remove(p)
                except: pass
else:
    st.info("👈 يرجى اختيار ملف الموقع وملف المخزن للبدء.")
