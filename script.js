(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5585986075663";
  var DEFAULT_MESSAGE = "Olá, gostaria de um orçamento para limpeza de caixa d'água";

  function waLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message || DEFAULT_MESSAGE);
  }

  /* ---------------------------------------------------------------------
     Analytics (GA4) helpers — every call is guarded so nothing errors or
     does anything when the user hasn't consented (gtag not loaded yet).
     --------------------------------------------------------------------- */
  function trackEvent(name, params) {
    if (typeof gtag === "function") {
      gtag("event", name, params || {});
    }
  }

  function getLinkLocation(el) {
    if (!el || !el.closest) return "unknown";
    if (el.closest(".floating-wa")) return "floating";
    if (el.closest(".show-me")) return "mostre-me";
    if (el.closest(".mobile-nav")) return "mobile_menu";
    if (el.closest(".site-header")) return "header";
    if (el.closest(".site-footer")) return "footer";
    var section = el.closest("section[id]");
    if (section) return section.id;
    return "unknown";
  }

  /* ---------------------------------------------------------------------
     Populate every WhatsApp link on the page. The href is already correct
     in the raw HTML (see index.html) — this just keeps it in sync and
     supports a per-element custom message via data-wa-message (used by
     the "Sob consulta" service cards and the condomínios/empresas CTA).
     Re-running this is harmless/idempotent.
     --------------------------------------------------------------------- */
  var defaultHref = waLink();
  document.querySelectorAll(".js-wa-link").forEach(function (el) {
    var customMessage = el.getAttribute("data-wa-message");
    el.setAttribute("href", customMessage ? waLink(customMessage) : defaultHref);
    el.addEventListener("click", function () {
      trackEvent("whatsapp_click", { link_location: getLinkLocation(el) });
    });
  });

  /* ---------------------------------------------------------------------
     Trust marquee: build the two duplicated rows from the same list used
     on the reference site so the loop is seamless.
     --------------------------------------------------------------------- */
  var MARQUEE_ITEMS = [
    "Limpeza de Caixa D'Água",
    "Compromisso",
    "Qualidade",
    "Total Segurança",
    "Laudo Técnico Pós-Serviço",
    "Produtos Certificados",
    "Fortaleza e Região Metropolitana"
  ];
  var dropletSvg =
    '<svg class="mq-dot" viewBox="0 0 40 40" aria-hidden="true">' +
    '<path d="M20 3C20 3 8 17.5 8 25a12 12 0 0 0 24 0C32 17.5 20 3 20 3Z" fill="#2ca8e0"/>' +
    '<path d="M14.5 24.5a5.5 5.5 0 0 0 4.2 6.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.85"/>' +
    "</svg>";

  function buildMarqueeRow(hidden) {
    return MARQUEE_ITEMS.map(function (item) {
      return '<span class="mq-item">' + item + dropletSvg + "</span>";
    }).join("");
  }
  var rowA = document.getElementById("marquee-row-a");
  var rowB = document.getElementById("marquee-row-b");
  if (rowA) rowA.innerHTML = buildMarqueeRow();
  if (rowB) rowB.innerHTML = buildMarqueeRow();

  /* ---------------------------------------------------------------------
     Header: scrolled state + mobile menu toggle
     --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var mobileNav = document.querySelector(".mobile-nav");
  var menuToggle = document.querySelector(".js-menu-toggle");
  var iconMenu = document.querySelector(".icon-menu");
  var iconClose = document.querySelector(".icon-close");

  function updateScrolled() {
    if (!header) return;
    var scrolled = window.scrollY > 24 || (mobileNav && mobileNav.classList.contains("is-open"));
    header.classList.toggle("is-scrolled", !!scrolled);
  }
  updateScrolled();
  window.addEventListener("scroll", updateScrolled, { passive: true });

  function setMenu(open) {
    if (!mobileNav) return;
    mobileNav.classList.toggle("is-open", open);
    if (iconMenu) iconMenu.hidden = open;
    if (iconClose) iconClose.hidden = !open;
    if (menuToggle) {
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    updateScrolled();
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!mobileNav.classList.contains("is-open"));
    });
  }

  /* ---------------------------------------------------------------------
     Smooth scrolling for in-page anchors (closes the mobile menu first)
     --------------------------------------------------------------------- */
  function scrollToId(id) {
    var target = document.querySelector(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.length < 2) return;
    a.addEventListener("click", function (e) {
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var wasOpen = mobileNav && mobileNav.classList.contains("is-open");
      if (wasOpen) setMenu(false);
      setTimeout(function () { scrollToId(href); }, wasOpen ? 250 : 0);
    });
  });

  document.querySelectorAll(".js-scroll-to").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-target");
      if (target) scrollToId(target);
    });
  });

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver) — approximates the framer-motion
     fade/slide-up used on the reference site.
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------------
     Números (stats) count-up animation: animates every .stat-value with a
     data-count-to attribute from 0 to that target once the #numeros section
     scrolls into view. Vanilla JS (IntersectionObserver + rAF), runs once,
     ~1.2s duration. The placeholder "—" stat card has no data-count-to and
     is left untouched by this code.
     --------------------------------------------------------------------- */
  var statEls = document.querySelectorAll(".stat-value[data-count-to]");
  if (statEls.length) {
    var statsAnimated = false;
    var animateStats = function () {
      if (statsAnimated) return;
      statsAnimated = true;
      statEls.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1200;
        var start = null;
        function step(timestamp) {
          if (start === null) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          el.textContent = Math.round(progress * target) + suffix;
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        }
        window.requestAnimationFrame(step);
      });
    };
    var statsSection = document.getElementById("numeros");
    if (statsSection && "IntersectionObserver" in window) {
      var statsIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateStats();
              statsIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      statsIo.observe(statsSection);
    } else {
      animateStats();
    }
  }

  /* ---------------------------------------------------------------------
     Phone mask for the quote form: formats as (85) 9XXXX-XXXX while the
     user types, stripping anything that isn't a digit first.
     --------------------------------------------------------------------- */
  var telefoneInput = document.getElementById("telefone");
  function maskPhone(value) {
    var v = value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 7) {
      return v.replace(/(\d{2})(\d{5})(\d{0,4})/, function (_, ddd, prefix, suffix) {
        return suffix ? "(" + ddd + ") " + prefix + "-" + suffix : "(" + ddd + ") " + prefix;
      });
    }
    if (v.length > 2) {
      return v.replace(/(\d{2})(\d{0,5})/, function (_, ddd, prefix) {
        return prefix ? "(" + ddd + ") " + prefix : "(" + ddd + ") ";
      });
    }
    if (v.length > 0) return "(" + v;
    return "";
  }
  if (telefoneInput) {
    telefoneInput.addEventListener("input", function () {
      var cursorFromEnd = telefoneInput.value.length - telefoneInput.selectionStart;
      telefoneInput.value = maskPhone(telefoneInput.value);
      var pos = Math.max(0, telefoneInput.value.length - cursorFromEnd);
      telefoneInput.setSelectionRange(pos, pos);
    });
  }

  /* ---------------------------------------------------------------------
     Quote form -> builds the WhatsApp message and opens wa.me
     --------------------------------------------------------------------- */
  var form = document.querySelector(".js-quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = (form.nome && form.nome.value.trim()) || "";
      var telefone = (form.telefone && form.telefone.value.trim()) || "";
      var endereco = (form.endereco && form.endereco.value.trim()) || "";
      var servico = (form.servico && form.servico.value) || "";
      var tipo = (form.tipo && form.tipo.value) || "";
      var capacidade = (form.capacidade && form.capacidade.value.trim()) || "";
      var honeypot = (form.website && form.website.value.trim()) || "";
      var msg =
        DEFAULT_MESSAGE +
        "\n\nNome: " + nome +
        "\nTelefone: " + telefone +
        "\nServiço: " + servico +
        "\nEndereço: " + endereco +
        "\nTipo de imóvel: " + tipo;
      if (capacidade) msg += "\nQuantidade/capacidade das caixas: " + capacidade;

      /* Fire-and-forget: send the lead to our serverless capture endpoint in
         parallel. This must NEVER block or delay the WhatsApp redirect below,
         which is the primary, always-working path — so no await, and any
         failure (network, 429, 500, endpoint missing) is silently ignored. */
      try {
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome,
            telefone: telefone,
            endereco: endereco,
            servico: servico,
            tipo: tipo,
            quantidade: capacidade,
            honeypot: honeypot
          })
        }).catch(function () {});
      } catch (err) {}

      trackEvent("form_submit", { form_id: "quote-form", link_location: "contato" });

      window.open(waLink(msg), "_blank", "noopener");
    });
  }

  /* ---------------------------------------------------------------------
     "Mostre-me como!" mini form -> opens WhatsApp with the visitor's name
     --------------------------------------------------------------------- */
  var miniForm = document.querySelector(".js-mini-form");
  if (miniForm) {
    miniForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = (miniForm.nome && miniForm.nome.value.trim()) || "";
      var msg = "Olá, meu nome é " + nome + ". Quero saber como manter a água da minha caixa d'água limpa e segura.";
      trackEvent("form_submit", { form_id: "show-me-form", link_location: "mostre-me" });
      window.open(waLink(msg), "_blank", "noopener");
    });
  }

  /* ---------------------------------------------------------------------
     Antes/depois gallery lightbox (vanilla JS, no dependencies). Clicking a
     gallery-shot opens a fixed overlay with the larger image; closes on the
     close button, click-outside (backdrop) or Escape.
     --------------------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxCloseBtn = document.getElementById("lightbox-close-btn");
  var lightboxLastFocused = null;

  function openLightbox(imgSrc, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxLastFocused = document.activeElement;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = caption || "";
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lightboxLastFocused && lightboxLastFocused.focus) lightboxLastFocused.focus();
  }

  document.querySelectorAll(".js-gallery-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      var caption = btn.getAttribute("data-caption") || "";
      if (img) openLightbox(img.src, caption);
    });
  });

  document.querySelectorAll(".js-lightbox-close").forEach(function (el) {
    el.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    /* Focus trap: while the lightbox is open, the close button is the only
       focusable element inside it, so keep Tab/Shift+Tab from leaking focus
       to elements behind the overlay. */
    if (e.key === "Tab" && lightbox && !lightbox.hidden) {
      e.preventDefault();
      if (lightboxCloseBtn) lightboxCloseBtn.focus();
    }
  });

  /* ---------------------------------------------------------------------
     FAQ accordion: native <details>/<summary> already toggles on click;
     this only adds the "close the others" behavior when one item opens.
     --------------------------------------------------------------------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  var yearEl = document.querySelector(".js-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Cookie / GA4 consent banner. Decision is remembered in localStorage
     ("maximo_consent": "accepted" | "declined") so the banner is shown at
     most once per browser. GA4's gtag.js is only ever injected after an
     explicit "Aceitar" click (or immediately, on a later page load, if the
     user had already accepted before) — never eagerly, and never at all if
     declined.
     --------------------------------------------------------------------- */
  var CONSENT_KEY = "maximo_consent";

  function loadGA4() {
    var id = window.GA_MEASUREMENT_ID;
    if (!id || document.getElementById("ga4-script")) return;
    var script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true });
  }

  function getConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (err) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (err) {}
  }

  var consentBanner = document.getElementById("consent-banner");
  var existingConsent = getConsent();

  if (existingConsent === "accepted") {
    loadGA4();
  } else if (existingConsent !== "declined" && consentBanner) {
    consentBanner.hidden = false;
  }

  if (consentBanner) {
    var acceptBtn = consentBanner.querySelector(".js-consent-accept");
    var declineBtn = consentBanner.querySelector(".js-consent-decline");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        setConsent("accepted");
        consentBanner.hidden = true;
        loadGA4();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener("click", function () {
        setConsent("declined");
        consentBanner.hidden = true;
      });
    }
  }
})();
