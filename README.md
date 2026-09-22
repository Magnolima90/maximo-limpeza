# Máximo Limpeza & Serviço — Landing Page

Site institucional de uma página para a Máximo Limpeza & Serviço, focado em conversão via WhatsApp.

## Como abrir no VS Code

1. Extraia o arquivo `.zip` em uma pasta.
2. Abra a pasta no VS Code (`File > Open Folder...`).
3. Instale a extensão **Live Server** (Ritwick Dey) se ainda não tiver.
4. Clique com o botão direito em `index.html` e escolha **"Open with Live Server"**.
5. O navegador abrirá com recarregamento automático a cada alteração salva.

Ou, sem extensão, apenas abra `index.html` diretamente no navegador.

## Estrutura

```
maximo-site/
├── index.html   → marcação da página (seções: header, hero, serviços, diferenciais,
│                  como funciona, área de atuação, orçamento, footer)
├── styles.css   → estilos (cores, tipografia e responsividade)
├── script.js    → menu mobile, links de WhatsApp, scroll-reveal e formulário de orçamento
└── README.md
```

O layout e os textos seguem a landing page de referência do cliente ("Máximo Limpeza & Serviço"), recriados como HTML/CSS/JS estático — sem React, sem Node e sem passo de build.

## Pontos de edição rápida

- **Cores da marca**: variáveis CSS no topo de `styles.css` (`--navy-deep`, `--cyan`, `--orange`, etc.).
- **Textos**: cada seção do `index.html` tem um `id` correspondente (`#servicos`, `#sobre`, `#processo`, `#area`, `#contato`).
- **Contatos**: número de WhatsApp e mensagem padrão ficam no topo de `script.js` (`WHATSAPP_NUMBER` e `DEFAULT_MESSAGE`); todos os botões de WhatsApp usam a classe `js-wa-link` e recebem o link automaticamente.
- **Serviços adicionais**: duplique um `.service-card-soon` dentro de `.services-grid` para adicionar mais serviços "em breve".

## Publicar

Pode subir para Vercel, Netlify ou GitHub Pages como site estático — não precisa de build, são apenas três arquivos (HTML, CSS, JS).
