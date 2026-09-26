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
├── index.html        → marcação da página: hero, serviços, segmentos, corporativo,
│                       diferenciais, números, clientes, depoimentos, sobre, processo,
│                       tipos de caixa, quando limpar, laudo técnico, antes/depois,
│                       área de atuação, CTA, FAQ, contato
├── styles.css        → design system (paleta navy/água/turquesa), tipografia e responsividade
├── script.js         → menu mobile, links de WhatsApp, scroll-reveal, contador animado,
│                       máscara de telefone, formulário de orçamento e banner de cookies
├── vercel.json        → cabeçalhos de segurança e CSP
├── sitemap.xml, robots.txt, site.webmanifest → SEO e PWA
├── api/lead.js        → função serverless (Vercel) que recebe o lead do formulário
├── assets/images/      → logo, fotos ilustrativas e imagem de área de atuação
└── README.md
```

## Paleta (design system)

Variáveis CSS no topo de `styles.css`:

| Variável | Uso |
| --- | --- |
| `--navy-900` (#070E24) | Fundo principal escuro |
| `--navy-800` (#0C1A3A) | Seções e cards escuros alternados |
| `--agua-500` (#0EA5E9) | Cor de destaque (links, ícones) |
| `--ciano-400` (#22D3EE) | Brilho, gradientes de texto |
| `--turquesa` (#14B8A6) | Ícones de check, selos, números |
| `--whatsapp` (#25D366) | Botões de WhatsApp/orçamento |
| `--branco-agua` (#F4FAFD) | Seções claras alternadas |
| `--texto-suave` (#94A3B8) | Texto secundário em fundo escuro |

## Pontos de edição rápida

- **Textos**: cada seção do `index.html` tem um `id` correspondente (`#servicos`, `#sobre`, `#processo`, `#area`, `#contato`).
- **Contatos**: número de WhatsApp e mensagem padrão ficam no topo de `script.js` (`WHATSAPP_NUMBER` e `DEFAULT_MESSAGE`); todos os botões de WhatsApp usam a classe `js-wa-link` e recebem o link automaticamente.
- **Avaliações do Google**: o link "Ver avaliações no Google" fica oculto até você preencher `GOOGLE_REVIEWS_URL` no topo de `script.js`.
- **Fotos ilustrativas** (serviços e clientes): `assets/images/fotos/`, vindas do Openverse com licença CC0/CC BY. Os créditos exigidos pela licença ficam no rodapé, dentro de "Créditos das fotos ilustrativas" (recolhido por padrão); ao trocar por fotos próprias, remova o crédito correspondente.
- **Redes sociais**: Instagram `https://www.instagram.com/limpezaeservicosmaximo` e Facebook `https://www.facebook.com/limpezaeservicosmaximo` — usados no header, bloco de contato, rodapé, botão flutuante e no `sameAs` do schema.org em `index.html`.
- **CNPJ**: ainda não exibido no site — quando disponível, adicione na seção "Sobre" (`#sobre`).
- **Serviços adicionais**: duplique um `.service-card-soon` dentro de `.services-grid` para adicionar mais serviços "em breve".

## Publicar

O site já está publicado no Vercel a partir deste repositório (`api/lead.js` como função serverless, `vercel.json` com os cabeçalhos de segurança). Um push para `main` já dispara o deploy.
