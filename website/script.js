(() => {
  const examples = {
    integral: String.raw`\int_0^1 x^2\,dx = \frac{1}{3}`,
    identity: String.raw`e^{i\pi} + 1 = 0`,
    matrix: String.raw`\begin{bmatrix} a & b \\ c & d \end{bmatrix}`
  };

  const formulaInput = document.querySelector("#formula-input");
  const formulaOutput = document.querySelector("#playground-result");
  const heroFormula = document.querySelector("#hero-formula");
  const renderStatus = document.querySelector("#render-status");
  const copyButton = document.querySelector("#copy-formula");
  const sampleButtons = document.querySelectorAll(".sample-button");
  const katexReady = typeof window.katex !== "undefined";

  function renderFormula(source, target, displayMode) {
    if (!katexReady) {
      target.textContent = "Formula renderer is loading. Please try again in a moment.";
      return false;
    }

    try {
      window.katex.render(source, target, {
        displayMode,
        throwOnError: true,
        trust: false
      });
      return true;
    } catch (error) {
      target.textContent = error instanceof Error ? error.message : "Could not render this formula.";
      return false;
    }
  }

  function updatePreview() {
    const source = formulaInput.value;
    const rendered = renderFormula(source, formulaOutput, true);
    renderStatus.textContent = rendered ? "Rendered with KaTeX" : "Check the formula syntax above";
    renderStatus.classList.toggle("error", !rendered);
  }

  renderFormula(examples.integral, heroFormula, true);
  updatePreview();

  formulaInput.addEventListener("input", () => {
    sampleButtons.forEach((button) => button.classList.remove("is-active"));
    updatePreview();
  });

  sampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sample = examples[button.dataset.sample];
      if (sample === undefined) return;
      formulaInput.value = sample;
      sampleButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      updatePreview();
      formulaInput.focus();
    });
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(formulaInput.value);
      copyButton.textContent = "Copied";
      window.setTimeout(() => { copyButton.textContent = "Copy LaTeX"; }, 1400);
    } catch {
      renderStatus.textContent = "Clipboard access is unavailable in this browser.";
      renderStatus.classList.add("error");
    }
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
  });

  const progress = document.querySelector(".scroll-progress span");
  function updateScrollProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const editorCard = document.querySelector(".editor-card");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduceMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    editorCard.addEventListener("pointermove", (event) => {
      const bounds = editorCard.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      editorCard.style.transform = `perspective(1100px) rotateY(${-5 + x * 3}deg) rotateX(${2 - y * 3}deg)`;
    });
    editorCard.addEventListener("pointerleave", () => {
      editorCard.style.transform = "";
    });
  }
})();
