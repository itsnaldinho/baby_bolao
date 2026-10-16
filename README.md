# 🍼 Baby Bolão - Qual é o nome?

Um sistema web interativo e responsivo desenvolvido em Google Apps Script (HTML, CSS, JS e Google Sheets) criado para engajar familiares e amigos na escolha do nome do bebê[cite: 6]. 

O sistema funciona como um bolão de apostas: os participantes pagam um valor fixo por cada palpite de nome[cite: 6]. Metade do valor arrecadado é destinado ao enxoval da criança, e a outra metade compõe um prêmio em dinheiro para quem acertar o nome[cite: 6].

## 🌟 Benefícios e Funcionalidades

* **Arrecadação e Entretenimento:** Transforma o tradicional chá de bebê em uma brincadeira online, gerando fundos para o enxoval enquanto diverte os convidados[cite: 6].
* **Nuvem de Palavras e Ranking Público:** O sistema gera automaticamente uma nuvem de palavras visual (`wordcloud2.js`) e uma tabela de ranking com os nomes mais votados e o prêmio estimado acumulado[cite: 6].
* **Cálculo Automático de Prêmio:** O backend calcula dinamicamente 50% do valor total arrecadado (apenas de apostas confirmadas) e divide pelo número de acertadores[cite: 6].
* **Upload Direto de Comprovantes:** Os participantes anexam o comprovante do PIX (imagem ou PDF) diretamente no formulário, e o sistema salva o arquivo em uma pasta segura no Google Drive[cite: 6].
* **Painel Administrativo ("Painel da Mamãe"):** Área restrita por senha onde os pais visualizam os comprovantes anexados e podem "Confirmar" ou "Recusar" os pagamentos[cite: 6]. Apenas palpites confirmados vão para o ranking público[cite: 6].
* **Controle de Prazo Estrito:** Um contador regressivo flutuante exibe o tempo restante na tela[cite: 6]. O backend possui uma trava de segurança que impede o envio de novos palpites após a data e hora configuradas para o sorteio[cite: 6].

---

## 🚀 Pré-work (Como colocar o código em funcionamento)

Para ativar este sistema na infraestrutura gratuita do Google, siga estes passos:

### 1. Preparar o Google Drive e Planilha
1. **Pasta de Comprovantes:** Crie uma pasta no Google Drive onde os comprovantes de PIX serão salvos[cite: 6]. Compartilhe a pasta como "Qualquer pessoa com o link pode editar" e copie o seu ID (código na URL)[cite: 6].
2. **Planilha de Banco de Dados:** Crie um novo Google Sheets[cite: 6].
3. Crie uma aba chamada exatamente **`Sugestoes`**[cite: 6].
   * Deixe a primeira linha para o cabeçalho. O script usará as colunas na seguinte ordem: Data/Hora (A), ID Transação (B), Participante (C), WhatsApp (D), Nome Sugerido (E), Status (F), Link do Comprovante (G)[cite: 6].
4. *(Opcional)* Crie uma aba chamada **`Logs`** para registrar o histórico de ações do sistema[cite: 6]. Se não criar, o script a criará automaticamente[cite: 6].

### 2. Configurar o Apps Script
1. Na sua planilha, clique em **Extensões > Apps Script**.
2. Crie dois arquivos:
   * **`Codigo.gs`**: Cole o código de backend neste arquivo[cite: 6].
   * **`Index.html`**: Crie um arquivo HTML e cole o código de frontend[cite: 6].
3. Execute a função `forcarPermissaoCriarArquivo` uma vez pelo editor do Apps Script para conceder as permissões de acesso ao Drive e à Planilha[cite: 6].

### 3. Publicar (Deploy)
1. Clique em **Implantar > Nova implantação**.
2. Selecione **App da Web**.
3. Configure para executar como "Eu" e acesso para "Qualquer pessoa"[cite: 6].
4. Copie a URL gerada e compartilhe com os participantes.

---

## 🛠️ Customização: Implementando no seu próprio Chá de Bebê

Para utilizar este sistema para o seu bebê, você **deve** alterar as seguintes informações no código:

### No arquivo `Codigo.gs` (Backend):
* **`SENHA_ADMIN`:** Altere `"babybolão2026"` para uma senha forte de sua preferência[cite: 6].
* **`VALOR_POR_NOME`:** Altere `10` caso o valor do seu palpite seja diferente de R$ 10,00[cite: 6].
* **`DATA_LIMITE_APOSTAS`:** Configure o limite exato no formato `"Ano-Mês-DiaTHora:Minuto:Segundo-Fuso"` (Ex: `"2026-09-15T19:00:00-03:00"`)[cite: 6].
* **`PASTA_COMPROVANTES_ID`:** Substitua `"1iIxsEnHYj8hA9BrfiXGtTrcMeoavvtoz"` pelo ID da pasta que você criou no Passo 1 do Pré-work[cite: 6].

### No arquivo `Index.html` (Frontend):
* **Sincronia de Data:** Na linha do JavaScript `const DATA_LIMITE_APOSTAS = "2026-09-15T19:00:00-03:00";`, coloque exatamente a mesma data configurada no `Codigo.gs` para que o cronômetro visual funcione corretamente[cite: 6].
* **Dicas do Nome:** Localize a seção de dicas `<h5 class="alert-heading text-pink fw-bold mb-2">Dica:</h5>` e altere o texto que diz "É uma Menina, começa com a letra M..." para as dicas reais do seu bebê[cite: 6].
* **Dados de Pagamento (PIX):** Localize a seção do Modal PIX (`modal-body`) e substitua a chave PIX de e-mail (`michelletondineli@hotmail.com`) e o nome do titular (`Michelle Tondineli Teruel`) pelos seus dados bancários reais[cite: 6].
* **Identidade Visual (Cores):** Se for um menino ou se preferir outra paleta de cores, altere as variáveis CSS no bloco `:root` no topo do arquivo (ex: `--baby-pink`, `--hot-pink`, `--dark-pink`) para tons de azul, verde, etc[cite: 6].
