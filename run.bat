
@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Auto Query Genius Launch Script
echo ========================================
echo.

REM Check if venv exists
if not exist venv (
    echo Error: Virtual environment not found.
    echo Please run setup.bat first to install dependencies.
    pause
    exit /b 1
)

REM Parse command line arguments
set USE_AI=false
set PORT=8080
set MOCK_MODE=false

:parse_args
if "%~1"=="" goto end_parse_args
if "%~1"=="--use-ai" (
    set USE_AI=true
    shift
    goto parse_args
)
if "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--mock-mode" (
    set MOCK_MODE=true
    shift
    goto parse_args
)
shift
goto parse_args
:end_parse_args

echo Starting Auto Query Genius on port %PORT%...
echo.

if "%USE_AI%"=="true" (
    if "%GEMINI_API_KEY%"=="" (
        echo Warning: --use-ai flag is set but GEMINI_API_KEY environment variable is not set.
        echo Please set your API key with: set GEMINI_API_KEY=your-api-key-here
        echo.
    )
    echo Running with AI features enabled...
    echo.
    call venv\Scripts\activate && python -m auto_query_genius.main --web --port %PORT% --use-ai
) else (
    call venv\Scripts\activate && python -m auto_query_genius.main --web --port %PORT%
)

echo.
echo Server stopped. Press any key to exit...
pause
