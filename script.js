(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5585986075663";
  var DEFAULT_MESSAGE = "Olá, gostaria de um orçamento para limpeza de caixa d'água";

  function waLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message || DEFAULT_MESSAGE);
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
      var tipo = (form.tipo && form.tipo.value) || "";
      var capacidade = (form.capacidade && form.capacidade.value.trim()) || "";
      var msg =
        DEFAULT_MESSAGE +
        "\n\nNome: " + nome +
        "\nTelefone: " + telefone +
        "\nEndereço: " + endereco +
        "\nTipo de imóvel: " + tipo;
      if (capacidade) msg += "\nQuantidade/capacidade das caixas: " + capacidade;
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
    if (e.key === "Escape") closeLightbox();
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
})();
