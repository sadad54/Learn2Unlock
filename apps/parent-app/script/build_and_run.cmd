@echo off
setlocal
cd /d "%~dp0.."
set "MODE=%~1"
if "%MODE%"=="" set "MODE=start"
if /i "%MODE%"=="start" goto start
if /i "%MODE%"=="run" goto start
if /i "%MODE%"=="android" goto android
if /i "%MODE%"=="--android" goto android
if /i "%MODE%"=="ios" goto ios
if /i "%MODE%"=="--ios" goto ios
if /i "%MODE%"=="web" goto web
if /i "%MODE%"=="--web" goto web
if /i "%MODE%"=="doctor" goto doctor
if /i "%MODE%"=="--doctor" goto doctor
if /i "%MODE%"=="export" goto export
if /i "%MODE%"=="--export" goto export
if /i "%MODE%"=="help" goto help
if /i "%MODE%"=="--help" goto help
echo Unknown mode: %MODE% 1>&2
exit /b 2
:start
pnpm start
exit /b %errorlevel%
:android
pnpm android
exit /b %errorlevel%
:ios
pnpm ios
exit /b %errorlevel%
:web
pnpm web
exit /b %errorlevel%
:doctor
pnpm doctor
exit /b %errorlevel%
:export
pnpm export
exit /b %errorlevel%
:help
echo usage: script\build_and_run.cmd [start^|android^|ios^|web^|export^|doctor^|help]

