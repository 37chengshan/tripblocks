/* TripBlocks landing — deterministic reveals, scroll melt, editorial motion. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const recMode = new URLSearchParams(window.location.search).get("rec") === "1";

  if (recMode) body.classList.add("rec-mode");
  root.dataset.rec = recMode ? "1" : "0";
  root.dataset.reducedMotion = reducedMotion ? "1" : "0";

  const splitCache = new WeakMap();

  function splitElement(element) {
    if (!element || splitCache.has(element)) return;
    splitCache.set(element, true);

    const label = (element.getAttribute("aria-label") || element.innerText || element.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    if (label && !element.hasAttribute("aria-hidden")) element.setAttribute("aria-label", label);

    const visual = document.createElement("span");
    visual.className = "split-visual";
    visual.setAttribute("aria-hidden", "true");

    let index = 0;
    let word = null;
    let wordHasChar = false;

    const flushWord = () => {
      if (word && wordHasChar) visual.appendChild(word);
      word = null;
      wordHasChar = false;
    };

    const appendText = (text) => {
      for (const char of Array.from(text)) {
        if (char === "\n" || char === "\r") continue;
        if (char === " " || char === "\t") {
          flushWord();
          const space = document.createElement("span");
          space.className = "char char--space";
          space.style.setProperty("--i", String(index++));
          space.innerHTML = "&nbsp;";
          visual.appendChild(space);
          continue;
        }
        if (!word) {
          word = document.createElement("span");
          word.className = "word";
        }
        const span = document.createElement("span");
        span.className = "char";
        span.style.setProperty("--i", String(index++));
        span.textContent = char;
        word.appendChild(span);
        wordHasChar = true;
      }
    };

    const walk = (node) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          appendText(child.textContent || "");
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName === "BR") {
            flushWord();
            visual.appendChild(document.createElement("br"));
          } else {
            walk(child);
          }
        }
      }
    };

    walk(element);
    flushWord();
    element.replaceChildren(visual);
  }

  const splitTargets = document.querySelectorAll("[data-split]");
  splitTargets.forEach(splitElement);

  const revealTargets = document.querySelectorAll(".reveal, [data-split]:not(.title-line)");
  const heroLines = document.querySelectorAll(".hero-title [data-split]");

  if (reducedMotion) {
    revealTargets.forEach((element) => element.classList.add("is-in"));
    heroLines.forEach((element) => element.classList.add("is-in"));
    body.classList.add("is-loaded");
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );
    revealTargets.forEach((element) => observer.observe(element));

    window.setTimeout(() => {
      heroLines.forEach((element) => element.classList.add("is-in"));
    }, 140);
    window.setTimeout(() => body.classList.add("is-loaded"), 40);
  }

  const header = document.getElementById("siteHeader");
  const hero = document.querySelector(".hero");
  let frame = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function renderScroll() {
    frame = 0;
    if (!hero) return;
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    body.classList.toggle("is-scrolled", scrollTop > 20);
    const travel = Math.max(hero.offsetHeight * 0.78, window.innerHeight * 0.9);
    const melt = clamp(scrollTop / travel, 0, 1);
    root.style.setProperty("--melt", melt.toFixed(4));
    root.style.setProperty("--scroll", String(scrollTop));
  }

  function requestScroll() {
    if (frame) return;
    frame = window.requestAnimationFrame(renderScroll);
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  renderScroll();

  if (!reducedMotion && !recMode && hero) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const applyPointer = () => {
      pointerFrame = 0;
      root.style.setProperty("--mx", pointerX.toFixed(3));
      root.style.setProperty("--my", pointerY.toFixed(3));
    };

    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect = hero.getBoundingClientRect();
        pointerX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        pointerY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointer);
      },
      { passive: true },
    );

    hero.addEventListener(
      "pointerleave",
      () => {
        pointerX = 0;
        pointerY = 0;
        applyPointer();
      },
      { passive: true },
    );
  }

  // An editorial marque for the capture mode: deterministic, quiet, no pointer parallax.
  if (recMode && header) header.setAttribute("data-rec", "deterministic");

  window.__tripblocks = Object.freeze({
    mode: recMode ? "rec" : reducedMotion ? "reduced" : "motion",
    version: "2026.11",
  });
})();
