(function () {
  // Meniu pe mobil
  var btn = document.getElementById("menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var deschis = nav.classList.toggle("deschis");
      btn.setAttribute("aria-expanded", deschis ? "true" : "false");
    });
  }

  // Temă luminoasă / întunecată
  var KEY = "autotest_tema";
  function seteaza(tema) {
    document.documentElement.setAttribute("data-theme", tema);
  }
  try {
    var salvata = localStorage.getItem(KEY);
    if (salvata) seteaza(salvata);
  } catch (e) { /* localStorage indisponibil */ }

  var temaBtn = document.getElementById("tema-btn");
  if (temaBtn) {
    temaBtn.addEventListener("click", function () {
      var curenta = document.documentElement.getAttribute("data-theme");
      if (!curenta) {
        curenta = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var noua = curenta === "dark" ? "light" : "dark";
      seteaza(noua);
      try { localStorage.setItem(KEY, noua); } catch (e) { /* ignorat */ }
    });
  }
})();
