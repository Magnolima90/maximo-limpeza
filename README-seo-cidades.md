# SEO local — páginas por cidade (RMF)

Plano para quando o cliente fornecer diferenciais reais por cidade (não criar as páginas antes disso, para evitar conteúdo duplicado/genérico):

- Uma página HTML estática por cidade (ex: `/limpeza-caixa-dagua-caucaia.html`, `/limpeza-caixa-dagua-maracanau.html`, `/limpeza-caixa-dagua-eusebio.html`), seguindo o mesmo design system (styles.css, tokens de cor/fonte) e componentes já existentes.
- Cada página precisa de pelo menos um parágrafo genuinamente específico da cidade — bairros atendidos, pontos de referência, particularidades locais — fornecido pelo cliente, nunca inventado.
- Cada página deve ter sua própria `<link rel="canonical">` apontando para a própria URL.
- Cada nova página deve ser adicionada como uma nova `<url>` em `sitemap.xml`.
- Reaproveitar header, footer, formulário de orçamento e CTAs de WhatsApp já existentes em `index.html`.
