# دليل نشر النظام أونلاين

## المرحلة الأولى: نشر قاعدة البيانات والخادم (Render)

### الخطوات:
1. افتح https://render.com وسجل بـ GitHub
2. اضغط New → Blueprint
3. اربط مع الـ repository: mohymen28/elkheta-erp
4. Render سيقرأ ملف render.yaml تلقائياً وينشئ:
   - قاعدة بيانات PostgreSQL مجانية
   - خادم API مجاني
5. بعد النشر، ستحصل على رابط مثل:
   https://elkheta-erp-api.onrender.com

### مهم: تشغيل السيد على قاعدة البيانات الجديدة
بعد النشر على Render، افتح Shell من لوحة Render واكتب:
```
npm run db:push
npm run db:seed
```

## المرحلة الثانية: نشر الواجهة (Vercel)

### الخطوات:
1. افتح https://vercel.com وسجل بـ GitHub
2. اضغط Add New → Project
3. اختر الـ repository: mohymen28/elkheta-erp
4. Root Directory: اكتب `frontend`
5. Environment Variables → أضف:
   - NEXT_PUBLIC_API_URL = https://elkheta-erp-api.onrender.com/api
6. اضغط Deploy

### النتيجة:
سيكون الموقع متاح على رابط مثل:
https://elkheta-erp.vercel.app

## ملاحظات
- الاستضافة مجانية بالكامل
- Free tier على Render قد ينام بعد 15 دقيقة من عدم الاستخدام
- يمكن الترقية لخطة مدفوعة ($7/شهر) لإيقاف هذا السلوك
