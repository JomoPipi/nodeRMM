@echo off
@REM replace server-windows.js with server-macos.js on the following line if needed.
start /b node "C:/nodeRMM/server-windows.js" >> "C:/nodeRMM/log.txt" 2>&1
exit