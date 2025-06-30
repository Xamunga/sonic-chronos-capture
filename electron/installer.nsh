
!macro customInit
  ; Verificar se Windows 10 ou superior
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_OK|MB_ICONSTOP "Este software requer Windows 10 ou superior."
    Quit
  ${EndIf}
!macroend

!macro customInstall
  ; Criar entrada no registro para associação de arquivos
  WriteRegStr HKLM "Software\Classes\.grtp" "" "GravadorRealtimePro"
  WriteRegStr HKLM "Software\Classes\GravadorRealtimePro" "" "Gravador Real Time Pro Project"
  WriteRegStr HKLM "Software\Classes\GravadorRealtimePro\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  
  ; Registrar no sistema como aplicativo de áudio
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXECUTABLE_FILENAME}" "Path" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Remover entradas do registro
  DeleteRegKey HKLM "Software\Classes\.grtp"
  DeleteRegKey HKLM "Software\Classes\GravadorRealtimePro"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXECUTABLE_FILENAME}"
!macroend
