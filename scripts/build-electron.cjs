
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v1.1...\n');
console.log('📋 Funcionalidades implementadas:');
console.log('   ✅ Split automático de arquivos por tempo');
console.log('   ✅ Criação de subpastas por data');
console.log('   ✅ VU Meters funcionais em tempo real');
console.log('   ✅ Analisador de espectro com peak meter');
console.log('   ✅ Sistema de gravação contínua otimizado\n');

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

// Changelog v1.0.3
console.log('\n=== CHANGELOG v1.0.3 ===');
console.log('✅ Divisão automática de arquivos implementada (intervalo configurável 1-120min, padrão 5min)');
console.log('✅ Subpastas automáticas por data no formato dd-mm (padrão)');
console.log('✅ Novos formatos de nomeação: hh-mm-ss-seq e dd-mm-hh-mm-ss-seq');
console.log('✅ Fallback "SEM SINAL" no VU Meter e RTA quando sem entrada de áudio');
console.log('✅ Interface responsiva otimizada para 1/4 da tela');
console.log('✅ Botões redesenhados: retangulares com cantos arredondados');
console.log('✅ Ícones clássicos: círculo (gravar), quadrado (parar), II (pausar)');
console.log('✅ Comportamento visual dinâmico dos botões (vermelho/verde)');
console.log('✅ Data e hora em tempo real na interface principal');
console.log('✅ Layout otimizado para tela sem rolagem');
console.log('========================\n');
