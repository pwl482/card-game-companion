@echo off
REM ===========================
REM Safe deploy to gh-pages using --work-tree
REM ===========================

REM Make sure we are on main branch and up to date
git checkout main
git pull origin main

REM Build the app
npm run build

REM Add all files from dist to gh-pages branch (force push)
git --work-tree dist add --all
git --work-tree dist commit -m "Deploy %date% %time%" 2>nul

git push -f origin HEAD:gh-pages

REM Reset work-tree so main is clean
git --work-tree dist reset --hard

echo Deployment complete!
pause