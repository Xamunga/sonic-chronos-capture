
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v2.1...\n');
console.log('📋 Correções e melhorias implementadas:');
console.log('   ✅ Contador de tempo corrigido (não reseta ao trocar abas)');
console.log('   ✅ VU Meter e RTA funcionais durante gravação');
console.log('   ✅ Múltiplas opções de bitrate MP3 (96, 128, 256, 320 kbps)');
console.log('   ✅ Persistência completa de configurações');
console.log('   ✅ Monitor de Recursos (CPU, RAM, Disco)');
console.log('   ✅ Tamanho inicial da janela reduzido');
console.log('   ✅ Tema claro por padrão');
console.log('   ✅ Versão corrigida no instalador\n');

// 1. Build da aplicação React
console.log('📦 Fazendo build da aplicação React...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build React concluído\n');
} catch (error) {
  console.error('❌ Erro no build React:', error.message);
  process.exit(1);
}

// 2. Verificar se os assets existem
const assetsDir = path.join(__dirname, '../electron/assets');
if (!fs.existsSync(assetsDir)) {
  console.log('📁 Criando diretório de assets...');
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 3. Instalar dependências do Electron
console.log('📥 Instalando dependências do Electron...');
try {
  execSync('cd electron && npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas\n');
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

// 4. Build do Electron
console.log('🔨 Fazendo build do Electron...');
try {
  execSync('cd electron && npm run dist', { stdio: 'inherit' });
  console.log('✅ Build do Electron concluído\n');
} catch (error) {
  console.error('❌ Erro no build Electron:', error.message);
  process.exit(1);
}

console.log('🎉 Build concluído com sucesso!');
console.log('📁 Instalador disponível em: electron/dist-electron/');
console.log('🚀 Gravador Real Time Pro está pronto para distribuição!');

// Changelog v2.1.0
console.log('\n=== CHANGELOG v2.1.0 ===');
console.log('🔧 CORREÇÕES:');
console.log('✅ Contador de tempo não reseta mais ao trocar abas');
console.log('✅ VU Meter e RTA funcionam corretamente durante gravação');
console.log('✅ hasAudioSignal() corrigida para detecção real de sinal');
console.log('✅ Tamanho inicial da janela reduzido para 800x600px');
console.log('✅ Tema claro aplicado por padrão');
console.log('✅ Versão corrigida no instalador (2.1.0)');
console.log('');
console.log('🆕 NOVOS RECURSOS:');
console.log('✅ Múltiplas opções de bitrate MP3: 96, 128, 256, 320 kbps');
console.log('✅ Persistência completa de configurações com localStorage');
console.log('✅ Monitor de Recursos substituindo Informações da Sessão');
console.log('✅ Monitor de CPU, RAM e Espaço em Disco');
console.log('✅ Botão "Salvar Configurações" em todas as seções');
console.log('✅ Interface reorganizada com monitor principal sempre visível');
console.log('========================\n');
