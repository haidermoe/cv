---
name: skillui
description: استخراج أنظمة التصميم، لوحات الألوان، الخطوط، المسافات، الأنميشن، ومكونات الواجهات من أي موقع، مستودع Git، أو مشروع محلي باستخدام أداة skillui. فعّل هذه المهارة عندما يطلب المستخدم تحليل أو تفكيك تصميم واجهة باستخدام skillui.
---

# دليل مهارة SkillUI

أداة `skillui` هي أداة سطر أوامر (CLI) تقوم بتفكيك وتحليل أي نظام تصميم (Design System) وتحويله إلى ملفات مهارة جاهزة للذكاء الاصطناعي. تعمل بتحليل ستاتيكي محلي بدون الحاجة لـ API keys أو سيرفرات MCP.

## الأنماط والأوامر الرئيسية (Commands & Modes)

### 1. نمط المواقع الإلكترونية (URL Mode)
استخراج التصميم والألوان والخطوط من أي رابط مباشر:
```bash
skillui --url https://target-site.com
```

### 2. النمط السينمائي المتقدم (Ultra Mode with Playwright)
التقاط لقطات الشاشة أثناء التمرير، وتحليل تفاعلات MOUSE وFOCUS والأنميشن:
```bash
skillui --url https://target-site.com --mode ultra --screens 5
```

### 3. نمط المشاريع المحلية (Local Dir Mode)
فحص ملفات `.css` و`.scss` و`.ts` و`.tsx` و`.js` و`.jsx` لتبويب متغيرات CSS وإعدادات Tailwind:
```bash
skillui --dir ./my-project --name "MyProject"
```

### 4. نمط مستودعات Git (Repo Mode)
استنساخ وفحص المستودعات العامة تلقائياً:
```bash
skillui --repo https://github.com/org/repo
```

## الخيارات والإشارات الإضافية (Flags)
- `--out <path>`: تحديد المجلد الناتج (الافتراضي: `./`).
- `--format design-md|skill|both`: صيغة المخرجات (الافتراضي: `both`).
- `--no-skill`: استخراج `DESIGN.md` فقط بدون حزمة `.skill`.
- `--name <string>`: تخصيص اسم المشروع.

## هيكلية الملفات المخرجة من SkillUI
عند تشغيل الأداة يتم إنشاء:
- `DESIGN.md`: دليل الألوان والخطوط والمسافات والظلال بالكامل.
- `SKILL.md` و`CLAUDE.md`: ملفات التعليمات والسياسات الخاصة بالذكاء الاصطناعي.
- `references/`: ملفات فرعية لـ `ANIMATIONS.md` و`LAYOUT.md` و`COMPONENTS.md` و`INTERACTIONS.md`.
- `tokens/`: ملفات JSON (`colors.json`, `spacing.json`, `typography.json`).
- `screens/`: لقطات الشاشة الخاصة بأقسام وشاشات الموقع.
