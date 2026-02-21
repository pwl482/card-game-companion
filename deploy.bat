@echo off
REM =========================================
REM Safe deploy to gh-pages using temp orphan branch
REM =========================================

REM Ensure we are on main branch and up to date
git checkout main
git pull origin main

REM Build the Vite app
npm run build

REM Create a temporary folder for deployment
set TMP_DIR=%TEMP%\gh-pages-temp
rmdir /S /Q "%TMP_DIR%"
mkdir "%TMP_DIR%"

REM Copy dist contents to temp folder
xcopy /E /I /Y dist\* "%TMP_DIR%\" >nul

REM Change to temp folder and initialize orphan branch
pushd "%TMP_DIR%"
git init
git remote add origin https://github.com/pwl482/card-game-companion.git
git checkout -b gh-pages

git add .
git commit -m "Deploy %date% %time%"
git push -f origin gh-pages

REM Return to repo root and clean up
popd
rmdir /S /Q "%TMP_DIR%"

REM Return to main branch just in case
git checkout main

echo Deployment complete!
pause