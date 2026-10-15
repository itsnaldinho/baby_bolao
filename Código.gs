var SENHA_ADMIN = "babybolão2026"; 
var VALOR_POR_NOME = 10;
var DATA_LIMITE_APOSTAS = "2026-09-15T19:00:00-03:00"; // Define a data limite para apostas (Ano-Mês-DiaTHora:Minuto:Segundo-Fuso)
var PASTA_COMPROVANTES_ID = "1iIxsEnHYj8hA9BrfiXGtTrcMeoavvtoz"; // ID da sua pasta no Drive

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('BabyBolão - Qual é o nome?')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function registrarLog(mensagem) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLogs = ss.getSheetByName('Logs');
  if (!sheetLogs) {
    sheetLogs = ss.insertSheet('Logs');
    sheetLogs.appendRow(["DataHora", "Mensagem"]);
  }
  sheetLogs.appendRow([new Date(), mensagem]);
}

// Salva as sugestões como PENDENTES e faz o Upload do Comprovante
function salvarSugestoes(participante, whatsapp, nomesSugeridos, fileData) {
  // Verificação de travamento de tempo
  var dataLimite = new Date(DATA_LIMITE_APOSTAS);
  var agora = new Date();
  
  if (agora >= dataLimite) {
    throw new Error("⚠️ O prazo para sugerir nomes foi encerrado! O sorteio já vai começar.");
  }

  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { throw new Error("Sistema ocupado. Tente novamente."); }

  try {
    var comprovanteUrl = "";
    
    // Processo de salvar o arquivo no Google Drive
    if (fileData && fileData.base64) {
      try {
        var pasta = DriveApp.getFolderById(PASTA_COMPROVANTES_ID);
        var blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), fileData.mimeType, fileData.fileName);
        var arquivo = pasta.createFile(blob);
        comprovanteUrl = arquivo.getUrl(); // Pega o link do arquivo salvo
      } catch(e) {
        throw new Error("Erro ao salvar comprovante no Drive: " + e.message);
      }
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sugestoes');
    var idTransacao = Utilities.getUuid(); // Agrupa todos os nomes da mesma pessoa
    
    for (var i = 0; i < nomesSugeridos.length; i++) {
      var nomeCapitalizado = nomesSugeridos[i].trim().toUpperCase();
      // Colunas: A(0), B(1), C(2), D(3), E(4), F(5), G(6) -> Comprovante URL
      sheet.appendRow([agora, idTransacao, participante, whatsapp, nomeCapitalizado, "Pendente", comprovanteUrl]);
    }
    
    registrarLog("📝 Novo palpite de " + participante + " (" + nomesSugeridos.length + " nomes). Comprovante anexado.");
    return "Palpites e comprovante enviados com sucesso! Aguardando conferência.";
  } finally {
    lock.releaseLock();
  }
}

// Puxa os dados para a Nuvem de Palavras e Ranking Público (Apenas Confirmados)
function getDadosPublicos() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sugestoes');
  var data = sheet.getDataRange().getValues();
  
  var totalArrecadado = 0;
  var contagemNomes = {};
  var detalhesNomes = {};

  for (var i = 1; i < data.length; i++) {
    var status = data[i][5];
    if (status === "Confirmado") {
      totalArrecadado += VALOR_POR_NOME;
      var participante = data[i][2];
      var nomeSugerido = data[i][4];

      if (!contagemNomes[nomeSugerido]) {
        contagemNomes[nomeSugerido] = 0;
        detalhesNomes[nomeSugerido] = [];
      }
      contagemNomes[nomeSugerido]++;
      detalhesNomes[nomeSugerido].push(participante);
    }
  }

  var premioTotal = totalArrecadado / 2;
  var ranking = [];

  for (var nome in contagemNomes) {
    var qtd = contagemNomes[nome];
    var premioPorPessoa = premioTotal / qtd;
    ranking.push({
      nome: nome,
      quantidade: qtd,
      participantes: detalhesNomes[nome].join(", "),
      premioEstimado: premioPorPessoa
    });
  }

  ranking.sort(function(a, b) { return b.quantidade - a.quantidade; });

  return {
    premioAtual: premioTotal,
    ranking: ranking
  };
}

// ------------------- ÁREA DO ADMIN -------------------
function validarSenhaAdmin(senhaDigitada) {
  return senhaDigitada === SENHA_ADMIN;
}

function getSugestoesPendentes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sugestoes');
  var data = sheet.getDataRange().getValues();
  var pendentesMap = {};

  for (var i = 1; i < data.length; i++) {
    var dataHora = data[i][0];
    var idTransacao = data[i][1];
    var participante = data[i][2];
    var whatsapp = data[i][3];
    var nomeSugerido = data[i][4];
    var status = data[i][5];
    var linkComprovante = data[i][6] || "";

    if (status === "Pendente") {
      if (!pendentesMap[idTransacao]) {
        pendentesMap[idTransacao] = {
          idTransacao: idTransacao,
          participante: participante,
          whatsapp: whatsapp,
          dataHora: Utilities.formatDate(new Date(dataHora), "GMT-3", "dd/MM/yyyy HH:mm"),
          nomes: [],
          comprovante: linkComprovante
        };
      }
      pendentesMap[idTransacao].nomes.push(nomeSugerido);
    }
  }
  return Object.values(pendentesMap);
}

// Busca o histórico de PIX já processados (Confirmados ou Rejeitados)
function getHistoricoSugestoes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sugestoes');
  var data = sheet.getDataRange().getValues();
  var historicoMap = {};

  for (var i = 1; i < data.length; i++) {
    var dataHora = data[i][0];
    var idTransacao = data[i][1];
    var participante = data[i][2];
    var whatsapp = data[i][3];
    var nomeSugerido = data[i][4];
    var status = data[i][5];
    var linkComprovante = data[i][6] || "";

    if (status !== "Pendente") {
      if (!historicoMap[idTransacao]) {
        historicoMap[idTransacao] = {
          idTransacao: idTransacao,
          participante: participante,
          whatsapp: whatsapp,
          dataHora: Utilities.formatDate(new Date(dataHora), "GMT-3", "dd/MM/yyyy HH:mm"),
          nomes: [],
          status: status,
          comprovante: linkComprovante
        };
      }
      historicoMap[idTransacao].nomes.push(nomeSugerido);
    }
  }
  
  return Object.values(historicoMap).reverse();
}

function confirmarPagamento(idTransacao, senha) {
  if (senha !== SENHA_ADMIN) throw new Error("Senha incorreta.");
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sugestoes');
  var data = sheet.getDataRange().getValues();
  var confirmadosCount = 0;
  var participanteNome = "";

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === idTransacao && data[i][5] === "Pendente") {
      sheet.getRange(i + 1, 6).setValue("Confirmado");
      participanteNome = data[i][2];
      confirmadosCount++;
    }
  }
  registrarLog("✅ Admin: Pagamento PIX confirmado para " + participanteNome + " (" + confirmadosCount + " palpites).");
  return "Pagamento confirmado. Os nomes já estão no ranking público!";
}

function rejeitarPagamento(idTransacao, senha) {
  if (senha !== SENHA_ADMIN) throw new Error("Senha incorreta.");
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sugestoes');
  var data = sheet.getDataRange().getValues();
  var participanteNome = "";

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === idTransacao && data[i][5] === "Pendente") {
      sheet.getRange(i + 1, 6).setValue("Rejeitado");
      participanteNome = data[i][2];
    }
  }
  registrarLog("❌ Admin: Pagamento PIX rejeitado/cancelado para " + participanteNome);
  return "Palpites cancelados com sucesso.";
}

function forcarPermissaoDrive() { DriveApp.getRootFolder(); }

function forcarPermissaoCriarArquivo() {
  var pasta = DriveApp.getFolderById(PASTA_COMPROVANTES_ID);
  var arquivoTeste = pasta.createFile("teste_permissao.txt", "teste");
  arquivoTeste.setTrashed(true);
}
