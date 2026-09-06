@echo off
chcp 65001 > nul
title تشغيل نظام إدارة الموارد ERP
color 0A

echo ========================================================
echo    جاري تشغيل منظومة الخطة - ERP System...
echo ========================================================
echo.

set PATH=D:\Elkheta\git\cmd;%PATH%

echo [1/2] تشغيل السيرفر الخلفي (Backend API - Port 5000)...
start "Elkheta ERP - Backend" cmd /k "cd /d D:\Elkheta\elkheta-erp\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] تشغيل واجهة الموقع (Frontend - Port 3000)...
start "Elkheta ERP - Frontend" cmd /k "cd /d D:\Elkheta\elkheta-erp\frontend && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo ========================================================
echo    تم تشغيل السيرفرات بنجاح! جاري فتح الموقع في المتصفح...
echo ========================================================
start http://localhost:3000

exit
