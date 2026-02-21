@echo off
REM =========================================
REM Safe deploy to gh-pages using temporary orphan branch
REM =========================================

REM Switch to main and pull latest changes
git checkout main
git pull origin main

REM Build the Vite app
npm run build

REM Delete previous temp branch if it exists
git branch -D temp-gh-pages 2>nul

REM Create a temporary orphan branch
git checkout --orphan temp-gh-pages

REM Remove all files from the index (working tree stays intact)
git rm -rf . >nul 2>&1

REM Copy dist contents into repo index
xcopy /E /I /Y dist\* . >nul

REM Add all files and commit
git add .
git commit -m "Deploy %date% %time%"

REM Force push to gh-pages
git push -f origin temp-gh-pages:gh-pages

REM Switch back to main
git checkout main

REM Delete temporary branch
git branch -D temp-gh-pages

echo Deployment complete!
pause