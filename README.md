# StudyFlow — Organizador de Estudos

## 1. Sobre o projeto

O StudyFlow é uma aplicação web simples para organizar tarefas de estudo, acompanhar progresso e manter o foco.
Foi desenvolvido com HTML, CSS e JavaScript puro, sem bibliotecas externas ou processo de compilação.

## 2. Tecnologias utilizadas

- HTML5 para estruturar o conteúdo.
- CSS3 para layout, cores, responsividade e animações.
- JavaScript para interações e regras da aplicação.
- `localStorage` para persistência de dados no navegador.
- Git para versionamento do código.
- GitHub para hospedar o repositório remoto.

## 3. Arquivos do projeto

- `index.html`: estrutura semântica, formulários, painéis e áreas da interface.
- `style.css`: identidade visual, componentes, estados e media queries.
- `script.js`: eventos, manipulação do DOM, armazenamento e funcionalidades.
- `README.md`: documentação, instruções de uso e publicação.

## 4. Funcionalidades implementadas

### 4.1 Cadastro de tarefas

O formulário permite adicionar tarefas com título, matéria, prioridade e prazo opcional.
O título é validado e limitado a 100 caracteres antes de ser salvo.

### 4.2 Conclusão e edição

Cada tarefa pode ser marcada como concluída ou voltar para o estado pendente.
O botão de edição permite alterar o título e o botão de exclusão remove a tarefa após confirmação.

### 4.3 Pesquisa de tarefas

O campo de busca filtra os itens conforme o título ou a matéria.
A busca ignora diferenças entre letras maiúsculas e minúsculas.

### 4.4 Filtros

Os filtros mostram todas as tarefas, apenas as pendentes ou apenas as concluídas.
A contagem de itens visíveis acompanha o filtro selecionado.

### 4.5 Estatísticas e progresso

O painel calcula tarefas concluídas, tarefas totais e porcentagem de conclusão.
Um indicador circular e barras por matéria representam o progresso atual.

### 4.6 Timer de foco

O timer oferece durações de 25, 15 e 5 minutos.
É possível iniciar, pausar, continuar e reiniciar a contagem.
A conclusão de um bloco soma seus minutos ao total de foco armazenado.

### 4.7 Anotações rápidas

O bloco de notas salva o texto automaticamente no navegador.
Um contador mostra a quantidade de caracteres e existe uma ação para limpar as notas.

### 4.8 Tema claro e escuro

O botão no cabeçalho alterna entre os temas claro e escuro.
A escolha fica salva e é aplicada quando a página é aberta novamente.

### 4.9 Exportação de dados

O botão Exportar dados cria um arquivo JSON com tarefas, anotações, tema e minutos de foco.
Esse arquivo pode servir como cópia de segurança pessoal.

### 4.10 Dicas de estudo

A aplicação exibe uma dica inicial e permite sortear outras sugestões.
As dicas incentivam revisão espaçada, prática ativa e redução de distrações.

### 4.11 Persistência local

As tarefas, anotações, tema e minutos de foco usam `localStorage`.
Os dados permanecem no navegador, mas não são sincronizados automaticamente entre dispositivos.
Limpar os dados do site no navegador pode apagar as informações armazenadas.

### 4.12 Acessibilidade e responsividade

A interface usa rótulos em campos, textos alternativos para controles e estados de foco visíveis.
O layout adapta colunas e formulários para telas menores.
A preferência do sistema por movimento reduzido é respeitada nas animações.

## 5. Como executar

1. Baixe ou clone o repositório.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` no navegador.
4. Opcionalmente, instale a extensão Live Server no VS Code.
5. Clique em **Go Live** para servir a página localmente.

Não é necessário instalar dependências nem executar comandos de compilação.

## 6. Estrutura esperada

```text
organizador-estudos/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 7. Publicar no GitHub pelo VS Code

