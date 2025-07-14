
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v2.5.0...\n');
console.log('📋 Correções CRÍTICAS implementadas na v2.5.0:');
console.log('   🔧 ÁUDIO DETERIORADO CORRIGIDO - removido noiseSuppression dinâmico');
console.log('   🔧 SAMPLE RATE CORRIGIDO - fixado em 44100Hz para qualidade profissional');
console.log('   🔧 VU METERS CORRIGIDOS - cálculo em dB real com Math.log10');
console.log('   🔧 RTA/SPECTRUM CORRIGIDO - análise FFT real com 32 bins de frequência');
console.log('   🔧 AUDIOCONTEXT OTIMIZADO - configuração limpa sem feedback');
console.log('   🔧 NOMES DE ARQUIVO CORRIGIDOS - hífens no formato hh-mm-ss-seq');
console.log('   🔧 LOGS DETALHADOS - debug completo para monitoramento');
console.log('   ✅ Todas as funcionalidades principais restauradas e funcionais\n');

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
console.log('🚀 Gravador Real Time Pro v2.5.0 está pronto para distribuição!');

// Changelog v2.5.0
console.log('\n=== CHANGELOG v2.5.0 ===');
console.log('🔧 CORREÇÕES CRÍTICAS (baseadas na análise técnica da Manus IA):');
console.log('✅ ÁUDIO DETERIORADO CORRIGIDO - removido noiseSuppression dinâmico');
console.log('✅ SAMPLE RATE CORRIGIDO - alterado de 48kHz para 44100Hz profissional');
console.log('✅ VU METERS COMPLETAMENTE CORRIGIDOS - cálculo real em dB com Math.log10');
console.log('✅ RTA/SPECTRUM ANALYZER CORRIGIDO - análise FFT real com 32 bins');
console.log('✅ AUDIOCONTEXT OTIMIZADO - configuração limpa sem conexão ao destination');
console.log('✅ NOMES DE ARQUIVO CORRIGIDOS - hífens corretos no formato hh-mm-ss-seq');
console.log('✅ MEDIARECORDER LIMPO - configurações mínimas sem interferências');
console.log('✅ LOGS DETALHADOS - debug completo para monitoramento em tempo real');
console.log('');
console.log('🎯 MELHORIAS TÉCNICAS:');
console.log('✅ Análise de áudio independente com requestAnimationFrame');
console.log('✅ Processamento separado para VU Meters e Spectrum');
console.log('✅ Callbacks executados com tratamento de erro individual');
console.log('✅ Configurações de áudio profissionais para estúdio');
console.log('✅ Separação clara entre gravação e análise visual');
console.log('');
console.log('🚨 IMPORTANTE - VERSÃO DE CORREÇÃO CRÍTICA:');
console.log('✅ Todos os problemas de qualidade de áudio foram resolvidos');
console.log('✅ VU Meters e RTA agora funcionam em tempo real');
console.log('✅ Arquivos gravados mantêm qualidade profissional');
console.log('✅ Sistema compatível com equipamentos digitais USB');
console.log('========================\n');
