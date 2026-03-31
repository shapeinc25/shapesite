document.documentElement.classList.add("js");

(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;
  var lastFocused = null;

  var backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  document.body.appendChild(backdrop);
  nav.setAttribute("aria-hidden", "true");

  function getFocusableElements() {
    return nav.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function setOpen(open) {
    var focusables;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-menu-open", open);
    backdrop.classList.toggle("is-visible", open);
    backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) {
      lastFocused = document.activeElement;
      focusables = getFocusableElements();
      if (focusables.length) {
        focusables[0].focus();
      }
    } else if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  toggle.addEventListener("click", function () {
    var expanded = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!expanded);
  });

  backdrop.addEventListener("click", function () {
    setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    var isOpen = nav.classList.contains("is-open");
    var focusables;
    var firstEl;
    var lastEl;

    if (!isOpen) return;

    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
      return;
    }

    if (e.key !== "Tab") return;

    focusables = getFocusableElements();
    if (!focusables.length) return;

    firstEl = focusables[0];
    lastEl = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setOpen(false);
      }
    });
  });

  window.addEventListener("resize", function () {
    if (!window.matchMedia("(max-width: 768px)").matches) {
      setOpen(false);
    }
  });
})();

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var nodes = document.querySelectorAll(".reveal-on-scroll");
  if (!nodes.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  nodes.forEach(function (el) {
    observer.observe(el);
  });
})();

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(max-width: 979px)").matches) return;

  var hero = document.querySelector(".hero--focus");
  var sections = document.querySelectorAll(".section--screens");
  if (!hero && !sections.length) return;

  var pointerX = 0;
  var pointerY = 0;
  var ticking = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateParallax() {
    ticking = false;
    var viewportH = window.innerHeight || 1;
    var pointerRatioX = clamp(pointerX, -1, 1);
    var pointerRatioY = clamp(pointerY, -1, 1);

    if (hero) {
      var hRect = hero.getBoundingClientRect();
      if (hRect.bottom > 0 && hRect.top < viewportH) {
        var hCenterY = hRect.top + hRect.height / 2;
        var hScroll = clamp((viewportH / 2 - hCenterY) / viewportH, -1, 1);
        var hx = pointerRatioX * 18;
        var hy = hScroll * 22 + pointerRatioY * 14;
        hero.style.setProperty("--parallax-x", hx.toFixed(2) + "px");
        hero.style.setProperty("--parallax-y", hy.toFixed(2) + "px");
      }
    }

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var visible = rect.bottom > 0 && rect.top < viewportH;
      if (!visible) return;

      var centerY = rect.top + rect.height / 2;
      var scrollRatio = clamp((viewportH / 2 - centerY) / viewportH, -1, 1);

      var x = pointerRatioX * 8;
      var y = scrollRatio * 12 + pointerRatioY * 6;
      var shotY = scrollRatio * 10 + pointerRatioY * 5;

      section.style.setProperty("--parallax-x", x.toFixed(2) + "px");
      section.style.setProperty("--parallax-y", y.toFixed(2) + "px");
      section.style.setProperty("--shot-parallax-y", shotY.toFixed(2) + "px");
    });
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  }

  window.addEventListener(
    "scroll",
    function () {
      requestTick();
    },
    { passive: true }
  );

  window.addEventListener(
    "mousemove",
    function (e) {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      pointerX = (e.clientX / w - 0.5) * 2;
      pointerY = (e.clientY / h - 0.5) * 2;
      requestTick();
    },
    { passive: true }
  );

  window.addEventListener("resize", requestTick, { passive: true });
  requestTick();
})();

(function () {
  var strips = document.querySelectorAll(".screenshot-strip--showcase, .screenshot-strip--row");
  if (!strips.length) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  strips.forEach(function (strip, stripIndex) {
    var cards = Array.prototype.slice.call(strip.querySelectorAll(".screenshot-frame"));
    if (cards.length < 2) return;

    var dots = document.createElement("div");
    dots.className = "carousel-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Screenshots navigation");

    var buttons = cards.map(function (_, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carousel-dot";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", "Go to screenshot " + (idx + 1));
      btn.setAttribute("aria-controls", "carousel-strip-" + stripIndex);
      btn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
      if (idx === 0) btn.classList.add("is-active");
      dots.appendChild(btn);
      return btn;
    });

    strip.id = "carousel-strip-" + stripIndex;
    strip.insertAdjacentElement("afterend", dots);

    function setActive(index) {
      buttons.forEach(function (btn, i) {
        var active = i === index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function getClosestIndex() {
      var stripRect = strip.getBoundingClientRect();
      var center = stripRect.left + stripRect.width / 2;
      var bestIdx = 0;
      var bestDist = Infinity;

      cards.forEach(function (card, idx) {
        var r = card.getBoundingClientRect();
        var cardCenter = r.left + r.width / 2;
        var dist = Math.abs(cardCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });

      return bestIdx;
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        setActive(getClosestIndex());
      });
    }

    strip.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    buttons.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        cards[idx].scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
        setActive(idx);
      });
    });
  });
})();

(function () {
  var imgs = document.querySelectorAll(".card-icon__img");
  if (!imgs.length) return;

  var pool = [
    "assests/shapes%20outline%20and%20fill.png",
    "assests/shapes%20outline%20and%20fill-2.png",
    "assests/shapes%20outline%20and%20fill-3.png",
    "assests/shapes%20outline%20and%20fill-4.png",
    "assests/shapes%20outline%20and%20fill-5.png",
    "assests/shapes%20outline%20and%20fill-7.png",
    "assests/shapes%20outline%20and%20fill-10.png",
    "assests/shapes%20outline%20and%20fill-11.png",
  ];

  var shuffled = pool.slice();
  var n = shuffled.length;
  var j;
  var t;
  while (n > 1) {
    n -= 1;
    j = Math.floor(Math.random() * (n + 1));
    t = shuffled[n];
    shuffled[n] = shuffled[j];
    shuffled[j] = t;
  }

  imgs.forEach(function (img, idx) {
    img.src = shuffled[idx % shuffled.length];
  });
})();
