@echo off
REM ===========================
REM Clean deploy to gh-pages
REM ===========================

REM Make sure we're on main branch
git checkout main
git pull origin main

REM Build the app
npm run build

REM Switch to a temporary branch for deployment
git branch -D temp-gh-deploy 2>nul
git checkout --orphan temp-gh-deploy

REM Remove all files from index (except .git)
git rm -rf .
xcopy /E /I /Y dist\* .

REM Commit and push to gh-pages
git add .
git commit -m "Deploy %date% %time%"
git push -f origin temp-gh-deploy:gh-pages

REM Return to main branch
git checkout main

REM Delete temporary branch
git branch -D temp-gh-deploy

echo Deployment complete!
pause