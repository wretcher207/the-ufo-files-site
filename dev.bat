@echo off
setlocal
pushd "%~dp0"
echo Starting the-ufo-files-site dev server...
echo Local URL prints below. Ctrl-C to stop.
echo.
call npm run dev
popd
endlocal
