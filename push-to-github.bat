@echo off
title MediDesk - Push to GitHub
echo ======================================================================
echo   MediDesk Hospital Management - Pushing to GitHub
echo ======================================================================
echo.
echo Target Repository: https://github.com/anshbhardwajmrt2007-glitch/hospital-desk-managementt.git
echo Branch: main
echo.
git push -u origin main --force
echo.
if %errorlevel% equ 0 (
    echo ======================================================================
    echo   [SUCCESS] MediDesk has been successfully pushed to GitHub!
    echo ======================================================================
) else (
    echo ======================================================================
    echo   [ACTION REQUIRED] If a browser prompt appeared, complete GitHub sign-in.
    echo   Or run: git push -u origin main --force
    echo ======================================================================
)
echo.
pause
