# Parceiros, QR Codes e agendamento

## Links exclusivos por parceiro

Cada estabelecimento parceiro deve ter uma URL própria. O valor de `partner` e `utm_source` identifica de onde veio a pessoa:

```text
https://ct-vai-na-fita-rho.vercel.app/?partner=academia-exemplo&utm_source=academia-exemplo&utm_medium=qrcode&utm_campaign=aula_experimental
```

Para cada novo parceiro:

1. criar um código curto, sem espaços e sem acentos, como `barbearia-central`;
2. usar esse código em `partner` e `utm_source`;
3. gerar o QR Code usando a URL completa;
4. usar esse QR Code somente na arte daquele parceiro;
5. nunca reutilizar o código para estabelecimentos diferentes.

O nome/código do parceiro é preservado na página e salvo na planilha junto com o agendamento. Assim, o CT consegue comparar acessos, agendamentos, presença e matrícula por parceiro.

## Fluxo de agendamento do CT Vai na Fita

- calendário com datas futuras;
- janela inicial de agendamento: próximos 90 dias;
- capacidade: 4 vagas por data e horário;
- horários disponíveis: 06:00, 07:00, 08:00, 17:00, 18:00, 19:00 e 20:00;
- dados obrigatórios: nome, telefone, idade e se a pessoa já praticou futevôlei.

Ao clicar em **Agendar aula**, a página salva uma nova linha na planilha contendo:

- data e hora em que o agendamento foi criado;
- nome;
- telefone;
- idade;
- data escolhida;
- horário escolhido;
- se já praticou futevôlei;
- parceiro/origem do acesso.

O WhatsApp não abre automaticamente. Após o salvamento, a página mostra a confirmação para o aluno.

## Planilha dos instrutores

A planilha Google **CT Vai na Fita - Aulas Experimentais**, aba `Aulas`, é a
agenda operacional dos instrutores e tem as colunas:

`Registrado em | Nome | Telefone | Idade | Já praticou? | Data da aula | Horário | Parceiro / QR | Status | ID da reserva`

O Google Apps Script ligado à planilha deve contar as linhas da mesma data e horário antes de inserir. Ao chegar a 4 agendamentos ativos, ele retorna `HORARIO_ESGOTADO` e não cria uma quinta reserva.

No Vercel, a URL publicada pelo Apps Script deve ser cadastrada na variável:

`GOOGLE_APPS_SCRIPT_URL`

A implantação ativa está conectada ao ambiente de produção. Quando o Apps
Script for reimplantado com uma URL diferente, essa variável também deve ser
atualizada antes de publicar novamente o site.
