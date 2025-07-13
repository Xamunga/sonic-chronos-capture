
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v2.3.0...\n');
console.log('📋 Correções e melhorias implementadas na v2.3.0:');
console.log('   ✅ VU Meters e Spectrum Analyzer funcionais imediatamente');
console.log('   ✅ Sistema de logs inteligente (CPU/RAM warnings só após 2min)');
console.log('   ✅ Logs de configurações apenas quando botões são clicados');
console.log('   ✅ Organização automática por subpastas de data funcionando');
console.log('   ✅ Debug completo - arquivo único com todas as informações');
console.log('   ✅ Interface visual padronizada com tema azul studio-electric');
console.log('   ✅ Sistema global de logs entre componentes');
console.log('   ✅ Detecção de sinal de áudio melhorada\n');

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
console.log('🚀 Gravador Real Time Pro v2.3.0 está pronto para distribuição!');

// Changelog v2.3.0
console.log('\n=== CHANGELOG v2.3.0 ===');
console.log('🔧 CORREÇÕES CRÍTICAS:');
console.log('✅ VU Meters e Spectrum Analyzer respondem imediatamente ao áudio');
console.log('✅ Organização por subpastas de data funcionando corretamente');
console.log('✅ Detecção de sinal de áudio com melhor sensibilidade');
console.log('✅ Interface visual completamente padronizada');
console.log('');
console.log('🆕 NOVOS RECURSOS:');
console.log('✅ Sistema de logs inteligente (warnings CPU/RAM só após 2min)');
console.log('✅ Logs de configurações apenas quando botões são clicados');
console.log('✅ Debug Tab com exportação de arquivo completo');
console.log('✅ Sistema global de comunicação entre componentes');
console.log('✅ Logs detalhados para debugging de pastas e áudio');
console.log('✅ Interface com tema azul studio-electric consistente');
console.log('✅ Estados visuais inteligentes (Gravando/Sem Sinal/Com Áudio)');
console.log('========================\n');
