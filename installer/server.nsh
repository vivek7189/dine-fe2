; DineOpen POS Server (offline / local-server build) — NSIS installer hooks.
; ONLY referenced from electron-builder.unified.yml (nsis.include). The normal "DineOpen POS"
; app (electron-builder.yml) never loads this file, and it is deliberately NOT named
; build/installer.nsh (electron-builder would pick that name up for every build automatically).
;
; Why: the offline build runs its own PostgreSQL (postgres.exe from the bundled
; resources\backend\node_modules\@embedded-postgres\…). The standard uninstaller only closes
; "DineOpen POS Server.exe", so a database left running kept serving and locked files in the
; install folder. These hooks stop ONLY that bundled postgres.exe — matched by its install path —
; never any other PostgreSQL on the PC.
;
; The PowerShell is passed with -EncodedCommand (UTF-16LE Base64) so NSIS quoting cannot break it.
; DINE_PG_ALL     = stop every bundled postgres.exe (tree), used after the app has been closed.
; DINE_PG_ORPHANS = stop only bundled postgres.exe whose parent app process is gone (left over
;                   from a crash / forced close) — safe to run before the user has confirmed.
;   Decoded DINE_PG_ORPHANS:
;   $ErrorActionPreference='SilentlyContinue'; Get-CimInstance Win32_Process -Filter "Name='postgres.exe'" |
;   Where-Object { $_.ExecutablePath -like '*\resources\backend\node_modules\@embedded-postgres\*' } |
;   Where-Object { -not (Get-Process -Id $_.ParentProcessId -ErrorAction SilentlyContinue) } |
;   ForEach-Object { & taskkill.exe /PID $_.ProcessId /T /F | Out-Null }
;   (DINE_PG_ALL is the same without the parent-process filter.)

!define DINE_PG_ALL "JABFAHIAcgBvAHIAQQBjAHQAaQBvAG4AUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwBpAGwAZQBuAHQAbAB5AEMAbwBuAHQAaQBuAHUAZQAnADsAIABHAGUAdAAtAEMAaQBtAEkAbgBzAHQAYQBuAGMAZQAgAFcAaQBuADMAMgBfAFAAcgBvAGMAZQBzAHMAIAAtAEYAaQBsAHQAZQByACAAIgBOAGEAbQBlAD0AJwBwAG8AcwB0AGcAcgBlAHMALgBlAHgAZQAnACIAIAB8ACAAVwBoAGUAcgBlAC0ATwBiAGoAZQBjAHQAIAB7ACAAJABfAC4ARQB4AGUAYwB1AHQAYQBiAGwAZQBQAGEAdABoACAALQBsAGkAawBlACAAJwAqAFwAcgBlAHMAbwB1AHIAYwBlAHMAXABiAGEAYwBrAGUAbgBkAFwAbgBvAGQAZQBfAG0AbwBkAHUAbABlAHMAXABAAGUAbQBiAGUAZABkAGUAZAAtAHAAbwBzAHQAZwByAGUAcwBcACoAJwAgAH0AIAB8ACAARgBvAHIARQBhAGMAaAAtAE8AYgBqAGUAYwB0ACAAewAgACYAIAB0AGEAcwBrAGsAaQBsAGwALgBlAHgAZQAgAC8AUABJAEQAIAAkAF8ALgBQAHIAbwBjAGUAcwBzAEkAZAAgAC8AVAAgAC8ARgAgAHwAIABPAHUAdAAtAE4AdQBsAGwAIAB9AA=="
!define DINE_PG_ORPHANS "JABFAHIAcgBvAHIAQQBjAHQAaQBvAG4AUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwBpAGwAZQBuAHQAbAB5AEMAbwBuAHQAaQBuAHUAZQAnADsAIABHAGUAdAAtAEMAaQBtAEkAbgBzAHQAYQBuAGMAZQAgAFcAaQBuADMAMgBfAFAAcgBvAGMAZQBzAHMAIAAtAEYAaQBsAHQAZQByACAAIgBOAGEAbQBlAD0AJwBwAG8AcwB0AGcAcgBlAHMALgBlAHgAZQAnACIAIAB8ACAAVwBoAGUAcgBlAC0ATwBiAGoAZQBjAHQAIAB7ACAAJABfAC4ARQB4AGUAYwB1AHQAYQBiAGwAZQBQAGEAdABoACAALQBsAGkAawBlACAAJwAqAFwAcgBlAHMAbwB1AHIAYwBlAHMAXABiAGEAYwBrAGUAbgBkAFwAbgBvAGQAZQBfAG0AbwBkAHUAbABlAHMAXABAAGUAbQBiAGUAZABkAGUAZAAtAHAAbwBzAHQAZwByAGUAcwBcACoAJwAgAH0AIAB8ACAAVwBoAGUAcgBlAC0ATwBiAGoAZQBjAHQAIAB7ACAALQBuAG8AdAAgACgARwBlAHQALQBQAHIAbwBjAGUAcwBzACAALQBJAGQAIAAkAF8ALgBQAGEAcgBlAG4AdABQAHIAbwBjAGUAcwBzAEkAZAAgAC0ARQByAHIAbwByAEEAYwB0AGkAbwBuACAAUwBpAGwAZQBuAHQAbAB5AEMAbwBuAHQAaQBuAHUAZQApACAAfQAgAHwAIABGAG8AcgBFAGEAYwBoAC0ATwBiAGoAZQBjAHQAIAB7ACAAJgAgAHQAYQBzAGsAawBpAGwAbAAuAGUAeABlACAALwBQAEkARAAgACQAXwAuAFAAcgBvAGMAZQBzAHMASQBkACAALwBUACAALwBGACAAfAAgAE8AdQB0AC0ATgB1AGwAbAAgAH0A"

!macro dineStopBundledPostgres ENCODED
  Push $0
  nsExec::Exec `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ${ENCODED}`
  Pop $0
  Pop $0
!macroend

; Installer start (fresh install or update): clear a database left over from a crashed run, so its
; locked files don't block replacing the app.
!macro customInit
  !insertmacro dineStopBundledPostgres "${DINE_PG_ORPHANS}"
!macroend

; Uninstaller start (before the user confirms): same — only leftovers, never a running app's DB.
!macro customUnInit
  !insertmacro dineStopBundledPostgres "${DINE_PG_ORPHANS}"
!macroend

; End of a real uninstall (not the remove-old-version step of an update): the app has been closed
; by now, so stop any bundled database still running, then remove what its locked files left
; behind in the install folder. Restaurant data in %USERPROFILE%\DineOpenServer is NOT touched
; (it may hold orders that have not reached the cloud yet).
!macro customUnInstall
  ${ifNot} ${isUpdated}
    !insertmacro dineStopBundledPostgres "${DINE_PG_ALL}"
    Sleep 1000
    RMDir /r "$INSTDIR"
  ${endIf}
!macroend
