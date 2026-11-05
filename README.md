# provs-app
App de check-in verificado para torcedores

## Motion Simples (comece por aqui)
Abra `motion-simples/index.html`. Escolha o tipo (ícones com X/✓, chuva de ícone, texto), escreva as legendas e
clique em **Baixar com fundo transparente** (ou **verde**, plano B com chroma key) para usar no CapCut.
É um arquivo único, sem timeline nem camadas.

## MotionLab (editor completo de Motion Design)

Abra `motion-editor/index.html` no navegador (sem build, sem dependências). Para exportar vídeo e usar
fontes próprias, use o Chrome/Edge atual.

Arquivos: `glyphs.js` (ícones), `engine.js` (modelo, easing, renderização), `ui.js` (inspetor, palco, timeline, arquivos),
`compositions.js` (modelos e composições de exemplo), `boot.js` (inicialização).

### Composições de exemplo (menu **Modelos**)
- **★ Teaser cinematográfico** — 16 s, 4 cenas, letterbox, câmera, parallax, grão, tipografia serifada.
- **★ Vídeo de vendas** — 21,5 s, 6 cenas (gancho → problema → solução → benefícios → prova → CTA).
  Todo texto de conteúdo é um **campo entre colchetes** para preencher; nada é inventado.
- Ambas têm layouts próprios para **16:9, 9:16 e 1:1** (troque em *Projeto → Formato*).


### Gráficos sobre a sua fala (ícones, X, dinheiro aparecendo)
- Botão **Momentos prontos** (menu à esquerda): cria, no ponto onde está o playhead, uma **sequência de itens**
  (ícone que se desenha → **X vermelho** ou **✓ verde** → legenda) ou uma **chuva/explosão de ícones** (ex.: dinheiro).
  Cada parte vira uma camada separada e editável; o layout se adapta a 16:9, 9:16 e 1:1.
- **Biblioteca com 122 ícones profissionais** ([Phosphor Icons](https://phosphoricons.com), MIT — ver `THIRD_PARTY_LICENSES.md`):
  dinheiro, moedas, fábrica, bebidas, loja, gráficos, certo/errado, emoções… Botão **$** em *Adicionar* (com busca).
  No inspetor: *Estilo* (**Bicolor**, **Sólido** ou **Linha grossa**), *Cor 2 (tom)*, *Trocar ícone* e *Revelar (varredura)*.
- Modelo **★ Problemas: dinheiro, fábrica, bebida**: exemplo com a frase "não tenho dinheiro, fábrica e nem sei fazer uma bebida".
- Para usar **por cima do seu vídeo** em outro editor: *Projeto → Fundo do vídeo* → **Verde (chroma key)** (aplique o
  efeito chroma key no CapCut/Premiere/DaVinci) ou **Transparente** (PNG e WebM com alpha; a leitura do alpha em WebM
  depende do programa de edição).

### Como personalizar (tudo pela interface)
- **Texto e mídia:** selecione a camada → inspetor (texto, fonte, tamanho, peso, alinhamento, espaçamento, quebra automática).
  Imagens: *Substituir mídia* mantém enquadramento, zoom e animações.
- **Identidade visual:** nada selecionado → *Identidade visual* (cores e fontes da marca; camadas vinculadas mudam juntas).
  *Carregar fonte* aceita .ttf/.otf/.woff.
- **Animação:** seções *Entrada* e *Saída* (efeito, duração, atraso, curva, distância; texto por linha/palavra/caractere)
  ou keyframes com **◆**, com curvas nomeadas ou `cubic-bezier` personalizada.
- **Máscara de revelação**, **gradiente/vinheta**, **mistura**, **profundidade** (parallax) e **câmera** (camada "Câmera" na timeline).
- **Cenas:** *Projeto → Cenas* altera a duração de uma cena e reorganiza o resto.
- **Margens seguras:** botão no player (9:16 evita as áreas de interface de Reels/Stories).
- **Salvar:** `.json` (arquivo), *Projetos* (biblioteca no navegador, com duplicar) e autosave.
- **Exportar:** vídeo (WebM; MP4 se o navegador permitir) e PNG do frame.

### Limitações
- Sem camadas de vídeo e sem áudio (somente imagens, formas e texto).
- A exportação grava a prévia em tempo real: mantenha a aba visível. WebM do MediaRecorder não traz índice de busca.
- Fontes: as do sistema ou as que você carregar. Efeitos de blur/mistura dependem do navegador (Chrome/Edge/Firefox).
- Camadas de acabamento (grão, vinheta, letterbox) vêm **bloqueadas** para não atrapalhar o clique no palco;
  desbloqueie pelo cadeado na timeline.
