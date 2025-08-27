// assets/js/main.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  document.documentElement.classList.add("js-enabled");

  // ===== Topnav 현재 페이지 표시 (있을 때)
  (() => {
    const here = location.pathname.replace(/\/+$/, "") || "/";
    $$(".topnav a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const path = href.replace(/\/+$/, "") || "/";
      if (path === here) a.setAttribute("aria-current", "page");
    });
  })();

  // ===== Advanced(접이식) 패널 토글 (있을 때)
  (() => {
    $$(".advanced-settings").forEach((section) => {
      const header = $(".advanced-settings-header", section);
      const content = $(".advanced-content", section);
      const icon = $(".toggle-icon", section);

      if (!header || !content) return;

      const toggle = () => {
        const expanded = header.getAttribute("aria-expanded") === "true";
        header.setAttribute("aria-expanded", String(!expanded));
        content.classList.toggle("expanded", !expanded);
        icon && icon.classList.toggle("rotated", !expanded);
      };

      header.addEventListener("click", toggle);
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  })();

  // ===== 패턴 버튼 active 토글 (있을 때)
  (() => {
    const group = $(".pattern-buttons");
    if (!group) return;
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".pattern-btn");
      if (!btn) return;
      $$(".pattern-btn", group).forEach((b) =>
        b.classList.toggle("active", b === btn)
      );
    });
  })();

  // ===== 내부 앵커 부드러운 스크롤 (선택)
  (() => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href") || "";
      const target = id && $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  })();

  // ===== 언어 토글 (버튼만 존재)
  (() => {
    const btn = $(".language-toggle");
    if (!btn) return;

    const KEY = "site.lang";
    const setLang = (lang) => {
      document.documentElement.setAttribute("lang", lang);
      try {
        localStorage.setItem(KEY, lang);
      } catch (_) {}
    };

    // 초기값
    const saved = (() => {
      try {
        return localStorage.getItem(KEY);
      } catch (_) {
        return null;
      }
    })();
    if (saved) setLang(saved);

    btn.addEventListener("click", () => {
      const curr = document.documentElement.getAttribute("lang") || "ko";
      setLang(curr === "ko" ? "en" : "ko");
    });
  })();

  // ===== 파일 미리보기(있을 때만 작동; 설명 페이지엔 없어도 안전)
  (() => {
    const input = $("#fileInput");
    const previewBox = $("#previewBox");
    const selectedCount = $("#selectedCount");
    const thumbGrid = $("#thumbGrid");
    const namePreview = $("#namePreview");
    const btnZip = $(".submit-button");
    const btnEach = $(".individual-download-button");

    if (!input) return;

    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      if (!files.length) {
        previewBox && (previewBox.style.display = "none");
        btnZip && (btnZip.disabled = true);
        btnEach && (btnEach.disabled = true);
        return;
      }
      previewBox && (previewBox.style.display = "block");
      selectedCount &&
        (selectedCount.textContent = `선택된 파일: ${files.length}개`);
      if (thumbGrid) thumbGrid.innerHTML = "";

      files.slice(0, 24).forEach((file) => {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        const item = document.createElement("div");
        item.className = "preview-item";

        if (/png|jpe?g|gif|webp|bmp|svg/.test(ext)) {
          const img = document.createElement("img");
          img.alt = file.name;
          img.src = URL.createObjectURL(file);
          item.appendChild(img);
        } else {
          const icon = document.createElement("div");
          icon.className = "file-icon";
          icon.textContent = "📄";
          item.appendChild(icon);

          const fe = document.createElement("div");
          fe.className = "file-ext";
          fe.textContent = (ext || "file").toUpperCase();
          item.appendChild(fe);
        }

        const fn = document.createElement("div");
        fn.className = "filename";
        fn.title = file.name;
        fn.textContent = file.name;
        item.appendChild(fn);

        thumbGrid && thumbGrid.appendChild(item);
      });

      if (namePreview) {
        namePreview.style.display = "block";
        namePreview.textContent = `예: prefix-0001 → ${files[0].name.replace(
          /^(.*?)(\.[^.]+)?$/,
          "prefix-0001$2"
        )}`;
      }

      btnZip && (btnZip.disabled = false);
      btnEach && (btnEach.disabled = false);
    });
  })();
})();

(function () {
  const t = document.querySelector(".nav-toggle");
  const m = document.getElementById("primary-menu");
  if (!t || !m) return;
  const set = (open) => {
    t.setAttribute("aria-expanded", String(open));
    m.classList.toggle("open", open);
  };
  t.addEventListener("click", () =>
    set(t.getAttribute("aria-expanded") !== "true")
  );
  document.addEventListener("click", (e) => {
    if (!m.contains(e.target) && !t.contains(e.target)) set(false);
  });
})();

// === Dropdown (How it Works) ===
(function () {
  // .nav-item.has-children / .dropdown-toggle 구조가 있을 때만 동작
  const dropdownButtons = document.querySelectorAll(".dropdown-toggle");
  if (!dropdownButtons.length) return;

  const closeAll = (exceptLi = null) => {
    document.querySelectorAll(".nav-item.has-children.open").forEach((li) => {
      if (exceptLi && li === exceptLi) return;
      li.classList.remove("open");
      li.querySelector(".dropdown-toggle")?.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  };

  // 클릭으로 열기/닫기 (다른 드롭다운은 자동으로 닫기)
  dropdownButtons.forEach((btn) => {
    // 초기 aria-expanded 기본값
    if (!btn.hasAttribute("aria-expanded"))
      btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", (e) => {
      const li = btn.closest(".nav-item.has-children");
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (!expanded) closeAll(li);
      btn.setAttribute("aria-expanded", String(!expanded));
      li.classList.toggle("open", !expanded);
      e.stopPropagation();
    });

    // 키보드 접근성 (Enter/Space)
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // 바깥을 클릭하면 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item.has-children")) closeAll();
  });

  // ESC로 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  (function () {
    const sync = () => {
      const hash = (location.hash || "").replace("#", "").toLowerCase();
      const q = new URLSearchParams(location.search).get("service");
      const target = (q || hash || "file-renamer").toLowerCase();

      document.querySelectorAll(".submenu-item").forEach((li) => {
        const a = li.querySelector("a");
        const id = (a && a.hash ? a.hash.replace("#", "") : "").toLowerCase();
        li.classList.toggle("active", id === target);
      });
    };

    // 초기 + 해시 변경에 반응
    document.readyState !== "loading"
      ? sync()
      : document.addEventListener("DOMContentLoaded", sync);
    window.addEventListener("hashchange", sync);

    // 드롭다운에서 클릭 시 닫기 + 싱크
    document.addEventListener("click", (e) => {
      const link = e.target.closest(".submenu-item a");
      if (!link) return;
      setTimeout(sync, 0); // 해시 적용 직후 싱크
      // 드롭다운 닫기
      const li = link.closest(".nav-item.has-children");
      li?.classList.remove("open");
      li?.querySelector(".dropdown-toggle")?.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  })();
})();
