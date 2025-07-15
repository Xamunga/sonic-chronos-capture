const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Gravador Real Time Pro v2.7.0...\n');

console.log('📋 Correções CRÍTICAS implementadas na v2.7.0 (Análise Manus IA):');
console.log('   🔧 BUG DE MIXAGEM CORRIGIDO - MONO forçado, fonte única');
console.log('   🔧 ESCALA DB CORRIGIDA - VU Meters padrão profissional (-60dB a 0dB)');
console.log('   🔧 SUPRESSÃO DE RUÍDO FUNCIONAL - configurações aplicadas');
console.log('   🔧 RTA ESTABILIZADO - limpeza adequada de recursos');
console.log('   🔧 LOGS COMPLETOS - registro de todas operações');
console.log('   🔧 CONTEXTOS LIMPOS - prevenção de vazamentos de memória');
console.log('   🔧 MONITORAMENTO INDEPENDENTE - VU/RTA sempre ativos');
console.log('   ✅ TODOS os problemas críticos identificados pela Manus resolvidos\n');

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
console.log('🎯 Gravador Real Time Pro v2.7.0 está pronto para distribuição!\n');

// Changelog v2.7.0 - CORREÇÕES CRÍTICAS MANUS IA
console.log('\n=== CHANGELOG v2.7.0 - ANÁLISE MANUS IA ===');
console.log('🔧 PROBLEMAS CRÍTICOS CORRIGIDOS:');
console.log('   ✅ BUG DE MIXAGEM RESOLVIDO - channelCount: 1 (MONO) evita múltiplas fontes');
console.log('   ✅ ESCALA DB CORRIGIDA - VU Meters padrão profissional (-60dB a 0dB)');
console.log('   ✅ SUPRESSÃO DE RUÍDO FUNCIONAL - configurações aplicadas corretamente');
console.log('   ✅ RTA ESTABILIZADO - limpeza adequada, não trava mais');
console.log('   ✅ LOGS FUNCIONAIS - registro completo de todas operações');
console.log('   ✅ CONTEXTOS LIMPOS - método cleanupAllAudioContexts()');
console.log('');
console.log('🎯 MELHORIAS TÉCNICAS IMPLEMENTADAS:');
console.log('   ✅ cleanupAllAudioContexts() - limpeza completa de recursos');
console.log('   ✅ Constraints unificadas entre monitoramento e gravação');
console.log('   ✅ Cálculo RMS correto para VU Meters profissionais');
console.log('   ✅ Aplicação correta de echoCancellation/noiseSuppression');
console.log('   ✅ Logs detalhados em todos métodos principais');
console.log('   ✅ VU Meters independentes da gravação (sempre ativos)');
console.log('');
console.log('📊 RESULTADOS ALCANÇADOS:');
console.log('   🎵 GRAVAÇÕES PURAS - apenas fonte selecionada, zero contaminação');
console.log('   🎛️ VU METERS PROFISSIONAIS - escala -60dB a 0dB padrão indústria');
console.log('   🎧 RTA ESTÁVEL - funcionamento contínuo sem travamentos');
console.log('   🔧 SUPRESSOR FUNCIONAL - configuração pelo usuário aplicada');
console.log('   📁 LOGS COMPLETOS - debug total das operações');
console.log('   ✅ QUALIDADE PROFISSIONAL - pronto para uso em estúdios');
console.log('=========================\n');
