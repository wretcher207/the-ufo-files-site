@echo off
setlocal
pushd "%~dp0..\.."
echo === extract.ts ===
npx tsx scripts/extract/extract.ts
echo.
echo === extract-ai.ts ===
npx tsx scripts/extract/extract-ai.ts
echo.
echo === geocode.ts ===
npx tsx scripts/extract/geocode.ts
echo.
echo === relationships.ts ===
npx tsx scripts/extract/relationships.ts
echo.
echo === coverage.ts ===
npx tsx scripts/extract/coverage.ts
popd
endlocal
pause
