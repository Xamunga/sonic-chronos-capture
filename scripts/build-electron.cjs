const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v2.6.0...\n');

console.log('📋 Correções CRÍTICAS implementadas na v2.6.0:');
console.log('   🔧 SELEÇÃO DE DISPOSITIVO USB CORRIGIDA - sync entre interface e audioService');
console.log('   🔧 VU METERS/RTA INDEPENDENTES - funciona sem gravação ativa');
console.log('   🔧 STREAM DE MONITORAMENTO SEPARADO - análise em tempo real');
console.log('   🔧 DETECÇÃO DE ELECTRON CORRIGIDA - isElectron funcional');
console.log('   🔧 LOGS COMPLETOS - sistema de log operacional');
console.log('   🔧 DISPOSITIVOS USB - reconhecimento e uso correto');
console.log('   🔧 ANÁLISE DE ÁUDIO - VU e RTA funcionais independentemente');
console.log('   ✅ Bug crítico dos VU Meters e RTA finalmente resolvido\n');

// 1. Build da aplicação React
console.log('📦 Fazendo build da aplicação React...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build React concluído\n');
} catch (error) {
  console.error('❌ Erro no build React:', error.message);
  process.exit(1);
}

// 2. CORREÇÃO: Copiar arquivos do build React para a pasta electron
console.log('📁 Copiando arquivos do build React para pasta electron...');
try {
  const distPath = path.join(__dirname, '..', 'dist');
  const electronDistPath = path.join(__dirname, '..', 'electron', 'dist');
  
  // Remover pasta dist anterior se existir
  if (fs.existsSync(electronDistPath)) {
    console.log('🗑️ Removendo build anterior...');
    fs.rmSync(electronDistPath, { recursive: true, force: true });
  }
  
  // Verificar se a pasta dist existe
  if (!fs.existsSync(distPath)) {
    throw new Error('Pasta dist não encontrada. Execute npm run build primeiro.');
  }
  
  // Copiar recursivamente
  console.log('📋 Copiando arquivos...');
  fs.cpSync(distPath, electronDistPath, { recursive: true });
  console.log('✅ Arquivos copiados com sucesso\n');
} catch (error) {
  console.error('❌ Erro ao copiar arquivos:', error.message);
  process.exit(1);
}

// 3. Verificar se os assets existem (opcional)
const assetsDir = path.join(__dirname, '..', 'electron', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.log('📁 Criando diretório de assets...');
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 4. Instalar dependências do Electron
console.log('📥 Instalando dependências do Electron...');
try {
  execSync('cd electron && npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas\n');
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

// 5. Build do Electron
console.log('🔨 Fazendo build do Electron...');
try {
  execSync('cd electron && npm run dist', { stdio: 'inherit' });
  console.log('✅ Build do Electron concluído\n');
} catch (error) {
  console.error('❌ Erro no build Electron:', error.message);
  process.exit(1);
}

// 6. Mensagem de sucesso
console.log('🎉 Build concluído com sucesso!');
console.log('📦 Instalador disponível em: electron/dist-electron/');
console.log('🎯 Gravador Real Time Pro v2.6.0 está pronto para distribuição!\n');

// Changelog v2.6.0
console.log('\n=== CHANGELOG v2.6.0 ===');
console.log('🔧 CORREÇÕES CRÍTICAS DE DISPOSITIVOS USB:');
console.log('   ✅ SELEÇÃO DE DISPOSITIVO USB CORRIGIDA - sync entre interface e audioService');
console.log('   ✅ BUG DOS VU METERS FINALMENTE RESOLVIDO - stream independente criado');
console.log('   ✅ RTA/SPECTRUM FUNCIONAIS - análise em tempo real sem gravação');
console.log('   ✅ DETECÇÃO DE ELECTRON CORRIGIDA - isElectron funcional');
console.log('   ✅ LOGS COMPLETOS OPERACIONAIS - sistema de debug funcional');
console.log('   ✅ DISPOSITIVOS USB RECONHECIDOS - placa de som USB funcional');
console.log('   ✅ MONITORAMENTO INDEPENDENTE - VU e RTA não dependem de gravação');
console.log('');
console.log('🎯 MELHORIAS TÉCNICAS:');
console.log('   ✅ Stream de monitoramento separado do stream de gravação');
console.log('   ✅ Sincronização correta entre seleção e uso de dispositivo');
console.log('   ✅ Análise de áudio funcional em tempo real');
console.log('   ✅ Sistema de logs completo e operacional');
console.log('   ✅ Detecção de ambiente Electron corrigida');
console.log('   ✅ Interface responsiva e funcional');
console.log('');
console.log('📊 IMPORTANTE - CORREÇÃO DO BUG CRÍTICO:');
console.log('   🎵 VU Meters e RTA agora funcionam independentemente');
console.log('   🎧 Dispositivos USB são corretamente utilizados');
console.log('   🎛️ Monitoramento em tempo real funcional');
console.log('   📁 Sistema de logs operacional para debug');
console.log('   🔧 Bug histórico dos VU Meters finalmente resolvido');
console.log('=========================\n');
