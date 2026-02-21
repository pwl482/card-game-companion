@echo off
git checkout main
git pull origin main
npm run build
git --work-tree dist add --all
git --work-tree dist commit -m "Deploy %date% %time%"
git push -f origin HEAD:gh-pages
git --work-tree dist reset --hard
echo Deployed successfully!
pause