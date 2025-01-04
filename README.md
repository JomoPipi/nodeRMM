# nodeRMM
A simple RMM for viewing activity of computers on your local network. Created with NodeJS.

It allows a remote entity to view an ffmpeg stream of the monitored computer's screen over the local network.

# Configuration

Look for `const ip = ""; // INSERT YOUR LOCAL IP` in index.html and put in your machine's local ip.
You can find it with `ifconfig` on Mac and `ipconfig` on Windows.

`start_RMM.bat`: the default platform is windows. You can open it and replace `server-windows.js` with `server-macos.js` if needed.

# MacOS

run `node server.js` in the project folder to stream. 

## TODO: 
make it run on the background and/or on startup if needed.

# Windows

2 scripts are included: `start_RMM.bat` and `run_RMM.vbs`. `run_RMM.vbs` makes a call to `start_RMM.bat`.
These exist so the program can run without the terminal opening.

## To make it launch on startup:
1. Drag the folder to the directory `C:\`.
2. Create a shortcut in the Startup folder (to get there, press Windows key + R and then type in `shell:startup`).
3. Set the `target` of the shortcut to `C:\Windows\System2\cscript.exe //NoLogo run_RMM.vbs`.
4. Set the shortcut's `start in` property to `C:\nodeRMM`.



