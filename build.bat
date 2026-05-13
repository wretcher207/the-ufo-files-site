@echo off
REM Double-click build for the-ufo-files-site.
REM Installs dependencies, builds the Astro site, runs Pagefind index.

echo Building the-ufo-files-site...
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
echo.
echo Build complete. Output is in dist\.
echo.
pause
exit /b 0

:error
echo.
echo Build failed.
pause
exit /b 1
