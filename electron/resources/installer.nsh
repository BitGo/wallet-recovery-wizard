; Wallet Recovery Wizard requires Windows 10 or later.
;
; Electron 45 (like every Electron since 23) cannot run on Windows
; 7/8/8.1, and the recovery wizard is the tool people use on their
; worst day - so instead of letting the installer succeed and the app
; silently fail to launch, refuse the install with a clear message.
; macOS gets the equivalent gate via mac.minimumSystemVersion in
; electron-builder.json5.
;
; electron-builder auto-discovers this file from the build resources
; directory and invokes customInit inside the installer's .onInit.

!include 'LogicLib.nsh'
!include 'WinVer.nsh'

!macro customInit
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_OK|MB_ICONSTOP 'Wallet Recovery Wizard requires Windows 10 or later.'
    Abort
  ${EndIf}
!macroend
