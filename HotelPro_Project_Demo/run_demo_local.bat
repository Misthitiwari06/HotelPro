@echo off
title HotelPro MERN Project Launcher
echo ========================================================
echo        HotelPro - Luxury Hotel Management System
echo ========================================================
echo.
echo [1/2] Starting Backend Server (Express + MongoDB)...
cd /d "%~dp0\..\server"
start "HotelPro Backend API" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Client (React + Vite)...
cd /d "%~dp0\..\client"
start "HotelPro Frontend Client" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul
echo.
echo Opening HotelPro in your browser...
start http://localhost:3000
echo Done! Enjoy HotelPro.
pause
