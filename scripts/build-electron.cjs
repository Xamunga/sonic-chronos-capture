
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v2.4.0...\n');
console.log('📋 Correções e melhorias implementadas na v2.4.0:');
console.log('   ✅ Qualidade de áudio corrigida (desativado echo cancellation)');
console.log('   ✅ Formato de nomes de arquivo corrigido (hifens adicionados)');
console.log('   ✅ VU Meters e RTA funcionais com callbacks sempre executados');
console.log('   ✅ Debug automático salvando logs na pasta debug/');
console.log('   ✅ Sistema de logs completo com rotação automática');
console.log('   ✅ Configurações de áudio otimizadas para alta qualidade');
console.log('   ✅ Detecção de dispositivos de áudio melhorada');
console.log('   ✅ Interface visual refinada e responsiva\n');

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
console.log('🚀 Gravador Real Time Pro v2.4.0 está pronto para distribuição!');

// Changelog v2.4.0
console.log('\n=== CHANGELOG v2.4.0 ===');
console.log('🔧 CORREÇÕES CRÍTICAS:');
console.log('✅ Qualidade de áudio corrigida - desativado echo cancellation');
console.log('✅ Formato de nomes de arquivo corrigido - hifens adicionados');
console.log('✅ VU Meters e RTA funcionais - callbacks sempre executados');
console.log('✅ MediaRecorder configurado para alta qualidade');
console.log('✅ Sample rate fixado em 48kHz para melhor qualidade');
console.log('');
console.log('🆕 NOVOS RECURSOS:');
console.log('✅ Debug automático - logs salvos em pasta debug/');
console.log('✅ Sistema de rotação de logs (mantém últimos 10 arquivos)');
console.log('✅ Configurações de áudio otimizadas para profissionais');
console.log('✅ Detecção melhorada de dispositivos de áudio');
console.log('✅ Interface visual refinada e responsiva');
console.log('✅ Logs detalhados para análise completa do sistema');
console.log('');
console.log('🚨 IMPORTANTE:');
console.log('✅ Esta versão corrige problemas de qualidade de áudio');
console.log('✅ VU Meters e RTA agora funcionam corretamente');
console.log('✅ Nomes de arquivo seguem configurações exatas');
console.log('========================\n');
