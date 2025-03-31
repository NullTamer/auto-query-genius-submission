
@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Auto Query Genius Setup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)

echo Step 1: Creating Python virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create virtual environment
    echo This could be due to missing Python venv module or permissions.
    echo Try running as administrator or install the venv module.
    pause
    exit /b 1
)

echo Step 2: Activating virtual environment...
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to activate virtual environment
    echo This could be due to execution policy restrictions.
    pause
    exit /b 1
)

echo Step 3: Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install Python dependencies
    echo This could be due to network issues or package conflicts.
    echo Check your connection and try again.
    pause
    exit /b 1
)

echo Step 4: Downloading spaCy language model...
echo This step might take some time, please be patient...
pip install spacy
python -m spacy download en_core_web_sm
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Failed to download spaCy language model
    echo Attempting alternate installation method...
    pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl
    if %ERRORLEVEL% NEQ 0 (
        echo Error: All attempts to install spaCy model failed
        echo Please try manually with: python -m spacy download en_core_web_sm
        pause
        exit /b 1
    )
)

echo Step 5: Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo Error: Failed to install Node.js dependencies
    echo This may be due to network issues or package conflicts.
    echo ========================================
    echo.
    echo Auto Query Genius can still run with limited functionality.
    echo Press any key to continue...
    pause
    goto skip_frontend_build
)

echo Step 6: Building React frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo Error: Failed to build React frontend
    echo This may be due to JavaScript errors in the codebase.
    echo ========================================
    echo.
    echo Auto Query Genius can still run with limited functionality.
    echo Press any key to continue...
    pause
)

:skip_frontend_build
echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo You can now run Auto Query Genius using run.bat
echo.
pause
