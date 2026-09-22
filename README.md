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
├── index.html   → site completo (HTML + CSS + JS em um único arquivo)
└── README.md
```

## Pontos de edição rápida

- **Cores da marca**: variáveis CSS no topo do `<style>` (`--navy`, `--cyan`, `--orange`).
- **Textos**: procure pelas seções marcadas com `id="servicos"`, `id="diferenciais"`, `id="como-funciona"`, `id="contato"`.
- **Contatos**: números de WhatsApp/telefone/e-mail aparecem em 3 lugares — botão do header, botão flutuante e bloco de contato final. Buscar por `5585986075663` para achar todos os links do WhatsApp de uma vez.
- **Serviços adicionais**: duplique um `.svc-card` dentro de `.services-grid` para adicionar mais serviços além da limpeza de caixa d'água.

## Publicar

Pode subir para Vercel, Netlify ou GitHub Pages como site estático — não precisa de build, é um único arquivo HTML.
