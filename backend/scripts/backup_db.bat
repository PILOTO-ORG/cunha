@echo off
REM Backup automático do banco de dados PostgreSQL
REM Salva arquivo com data/hora no nome
setlocal
set PGUSER=postgres
set PGPASSWORD=postgres
set PGDATABASE=cunha
set PGHOST=localhost
set BACKUP_DIR=backups
set BACKUP_FILE=%BACKUP_DIR%\backup_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%.sql
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" -U %PGUSER% -h %PGHOST% -d %PGDATABASE% -F p -f "%BACKUP_FILE%"
echo Backup salvo em %BACKUP_FILE%
endlocal
