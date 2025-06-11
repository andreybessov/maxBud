document.addEventListener("DOMContentLoaded", () => {
  const mainContainer = document.querySelector("main");

  function initModalTriggers() {
    // Обробник відкриття модалки (каталог / про нас)
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("#catalogLink, #aboutUsBtn");
      if (btn) {
        e.preventDefault();
        const modal = document.getElementById("callbackModal");
        if (modal) modal.classList.add("modal--active");
      }
    });
  }

  function initModal() {
    const modal = document.getElementById("callbackModal");
    const modalClose = document.getElementById("modalClose");
    const form = document.getElementById("feedbackForm");

    const successModal = document.getElementById("successModal");
    const successModalClose = document.getElementById("successModalClose");

    if (!modal || !modalClose || !form) return;

    modalClose.addEventListener("click", () => {
      modal.classList.remove("modal--active");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal__overlay")) {
        modal.classList.remove("modal--active");
      }
    });

    form.onsubmit = function (e) {
      e.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const phone = form.querySelector('[name="phone"]').value.trim();
      const messageText = form.querySelector('[name="message"]').value.trim();

      if (!name || !phone || !messageText) {
        alert("❗️Будь ласка, заповніть усі поля!");
        return;
      }

      const token = "8160535999:AAHIn1oMKYV6jLHTFfplnohtOpN6znMzcjM";
      const chatId = "-1002306691101";
      const url = 'https://api.telegram.org/bot${token}/sendMessage';

      const message = `
📥 <b>Нова заявка з сайту</b>\n
👤 Ім’я: <b>${name}</b>
📞 Телефон: <b>${phone}</b>
📝 Повідомлення: <b>${messageText}</b>`

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML"
        })
      })
        .then((res) => {
          if (res.ok) {
            form.reset();
            modal.classList.remove("modal--active");

            if (successModal) {
              successModal.classList.add("modal--active");
            }
          } else {
            alert("❌ Помилка при надсиланні!");
          }
        })
        .catch((err) => {
          console.error("Telegram Error:", err);
          alert("🚫 Сталася помилка при надсиланні.");
        });
    };

    if (successModal && successModalClose) {
      successModalClose.addEventListener("click", () => {
        successModal.classList.remove("modal--active");
      });

      successModal.addEventListener("click", (e) => {
        if (e.target === successModal || e.target.classList.contains("modal__overlay")) {
          successModal.classList.remove("modal--active");
        }
      });
    }
  }

  function scrollToHash(hash) {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }

  function loadPage(url, addToHistory = true) {
    const [path, hash] = url.split("#");

    fetch(path)
      .then(r => {
        if (!r.ok) throw new Error("Page load error");
        return r.text();
      })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const newMain = doc.querySelector("main");
        if (!newMain) return;

        mainContainer.innerHTML = newMain.innerHTML;

        if (addToHistory) {
          history.pushState({ html: newMain.innerHTML, url }, "", url);
        }

        requestAnimationFrame(() => {
          if (hash) scrollToHash("#" + hash);
          else window.scrollTo({ top: 0 });
        });

        initModal();         // повторна ініціалізація форм
        initModalTriggers(); // повторна ініціалізація кнопок
      })
      .catch(err => {
        console.error(err);
        alert("Не вдалося завантажити сторінку.");
      });
  }

  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    const linkURL = new URL(href, location.origin);
    if (linkURL.origin !== location.origin) return;

    if (href.startsWith("#")) {
      requestAnimationFrame(() => scrollToHash(href));
      return;
    }

    if (href.endsWith(".html") || href.includes(".html#")) {
      e.preventDefault();
      loadPage(href);
    }
  });

  window.addEventListener("popstate", (e) => {
    if (e.state?.html) {
      mainContainer.innerHTML = e.state.html;
      const hash = location.hash;
      if (hash) requestAnimationFrame(() => scrollToHash(hash));
      else window.scrollTo({ top: 0 });

      initModal();
      initModalTriggers();
    } else {
      loadPage(location.pathname + location.hash, false);
    }
  });

  history.replaceState(
    { html: mainContainer.innerHTML, url: location.href },
    "",
    location.href
  );

  initModal();         // перший запуск
  initModalTriggers(); // перший запуск
});