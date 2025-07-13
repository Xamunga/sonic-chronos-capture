# Gravador Real Time Pro v2.2.0

🎵 **Suíte Profissional de Gravação de Áudio - ALES Sonorização**

## Visão Geral
Sistema avançado de gravação de áudio com interface otimizada para estúdios profissionais e uso doméstico.

## Novidades da Versão 2.2.0

### 🛠️ Correções Críticas
- ✅ **Botão "Salvar Configurações"** agora funciona corretamente na aba Arquivos
- ✅ **Persistência de dados** - Configurações mantêm-se salvas ao alternar entre abas
- ✅ **VU Meters e RTA** - Funcionamento correto ao iniciar gravação
- ✅ **Cores padronizadas** - Campo "dd-mm" agora usa a cor azul padrão
- ✅ **Codificação MP3** melhorada para compatibilidade total com VLC e outros players
- ✅ **Arquivos salvos em subpastas** - Organização por data agora funciona corretamente

### 🆕 Novos Recursos
- 📁 **Seletor de Diretório** - Interface gráfica para escolher pasta de gravação
- 🗂️ **Limpeza Automática** configurável com persistência de dados
- 🎛️ **Interface otimizada** para janela 1200x530 pixels (fixa)
- 🔧 **Sistema de configurações** robusto e confiável

### 🎯 Melhorias Técnicas
- **Análise de áudio** otimizada para inicialização imediata
- **Codificação MP3** com bitrate configurável (320kbps default)
- **Sistema de pastas** por data completamente funcional
- **Persistência** de todas as configurações entre sessões
- **Validação** robusta de tipos TypeScript

## Como Compilar

### Build Desktop (Electron)
```bash
# Instalar dependências
npm install
cd electron && npm install

# Build da aplicação web
npm run build

# Build do Electron
cd electron && npm run build
```

### Build Web
```bash
npm run build
```

## Configurações Disponíveis

### 📁 Gerenciamento de Arquivos
- **Diretório Principal**: Seleção visual de pasta
- **Organização por Data**: Subpastas automáticas (DD-MM, DD-MM-AAAA, etc.)
- **Nomenclatura**: Múltiplos padrões de nomes de arquivo
- **Limpeza Automática**: Exclusão programada de arquivos antigos

### 🎛️ Configurações de Áudio
- **Formatos**: WAV, MP3 (320kbps)
- **Sample Rate**: 44.1kHz padrão
- **Divisão Automática**: 1min a 2h configurável
- **VU Meters**: Monitoramento estéreo em tempo real
- **Analisador de Espectro**: 32 bandas, 20Hz-20kHz

### 🖥️ Interface
- **Resolução Fixa**: 1200x530 pixels
- **VU Meters** com peak hold
- **RTA em tempo real** com 32 barras
- **Controles intuitivos** de gravação

## Compatibilidade
- ✅ Windows 10/11 (otimizado)
- ✅ VLC Media Player
- ✅ Windows Media Player
- ✅ Reprodutores profissionais de áudio
- ✅ Editores como Audacity, Reaper, Pro Tools

## Tecnologias
- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/UI + Tailwind CSS
- **Desktop**: Electron 28.x
- **Audio**: Web Audio API + MediaRecorder

## ALES Sonorização
© 2024 ALES Sonorização - Todos os direitos reservados  
**Versão**: 2.2.0 Build 2024.12.13