(function () {
  var root = document.getElementById("quiz");
  if (!root) return;

  var cat = root.dataset.cat;
  var mod = root.dataset.mod;
  var capitol = root.dataset.capitol;
  var minute = parseInt(root.dataset.minute, 10) || 30;

  function $(id) { return document.getElementById(id); }

  var intrebari = [];
  var idx = 0;
  var verificat = false;
  var terminat = false;
  var raspunsuriSim = {};
  var gresitePractica = [];
  var corectePractica = 0;
  var timerId = null;

  function post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error("Eroare " + r.status);
      return r.json();
    });
  }

  function arataMesaj(text) {
    var m = $("mesaj");
    m.textContent = text;
    m.hidden = false;
    $("intrebare-zona").hidden = true;
  }

  function ultima() { return idx === intrebari.length - 1; }

  function alese() {
    return Array.prototype.map.call(
      document.querySelectorAll("#raspunsuri input:checked"),
      function (x) { return parseInt(x.value, 10); }
    );
  }

  // ---------- Încărcare ----------

  function incarca() {
    var url = "/api/intrebari/" + cat + "?mod=" + (mod === "simulare" ? "simulare" : "practica");
    if (capitol) url += "&capitol=" + encodeURIComponent(capitol);
    if (mod === "gresite") {
      var ids = Progres.getGresite(cat);
      if (!ids.length) {
        arataMesaj("Nu ai întrebări greșite salvate. Rezolvă întâi câteva chestionare.");
        return;
      }
      url += "&ids=" + ids.join(",");
    }

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (date) {
        intrebari = date;
        if (!intrebari.length) {
          arataMesaj("Nu există întrebări pentru această selecție.");
          return;
        }
        $("mesaj").hidden = true;
        $("intrebare-zona").hidden = false;
        if (mod === "simulare") pornesteTimer();
        afiseaza();
      })
      .catch(function () { arataMesaj("Nu am putut încărca întrebările."); });
  }

  // ---------- Afișare întrebare ----------

  function afiseaza() {
    var q = intrebari[idx];
    verificat = false;
    $("progres").textContent = "Întrebarea " + (idx + 1) + " din " + intrebari.length;
    $("intrebare-text").textContent = q.intrebare;

    var img = $("intrebare-img");
    if (q.imagine) {
      img.src = "/static/img/intrebari/" + q.imagine;
      img.hidden = false;
    } else {
      img.hidden = true;
    }

    var ul = $("raspunsuri");
    ul.replaceChildren();
    q.raspunsuri.forEach(function (text, i) {
      var li = document.createElement("li");
      var label = document.createElement("label");
      var input = document.createElement("input");
      input.type = "checkbox";
      input.value = i;
      input.addEventListener("change", function () {
        li.classList.toggle("selectat", input.checked);
      });
      var litera = document.createElement("strong");
      litera.textContent = String.fromCharCode(65 + i) + ".";
      var span = document.createElement("span");
      span.textContent = text;
      label.append(input, litera, span);
      li.append(label);
      ul.append(li);
    });

    $("feedback").hidden = true;
    if (mod === "simulare") {
      $("btn-principal").textContent = ultima() ? "Termină" : "Următoarea";
    } else {
      $("btn-principal").textContent = "Verifică";
    }
  }

  // ---------- Buton principal ----------

  $("btn-principal").addEventListener("click", function () {
    var q = intrebari[idx];
    var selectate = alese();

    if (mod === "simulare") {
      raspunsuriSim[q.id] = selectate;
      if (ultima()) { terminaSimulare(); return; }
      idx++;
      afiseaza();
      return;
    }

    // Practică / întrebări greșite
    if (verificat) {
      if (ultima()) { terminaPractica(); return; }
      idx++;
      afiseaza();
      return;
    }
    if (!selectate.length) return;

    post("/api/raspunde", { cat: cat, id: q.id, alese: selectate })
      .then(function (r) {
        verificat = true;
        document.querySelectorAll("#raspunsuri li").forEach(function (li, i) {
          li.querySelector("input").disabled = true;
          if (r.corecte.indexOf(i) !== -1) li.classList.add("corect");
          else if (selectate.indexOf(i) !== -1) li.classList.add("gresit");
        });

        var fb = $("feedback");
        fb.className = "feedback " + (r.corect ? "ok" : "bad");
        fb.replaceChildren();
        var titlu = document.createElement("strong");
        titlu.textContent = r.corect ? "Corect!" : "Greșit.";
        fb.append(titlu);
        if (r.explicatie) {
          var p = document.createElement("p");
          p.textContent = r.explicatie;
          fb.append(p);
        }
        fb.hidden = false;

        if (r.corect) {
          corectePractica++;
          Progres.elimina(cat, q.id);
        } else {
          Progres.adauga(cat, q.id);
          gresitePractica.push({
            intrebare: q.intrebare,
            corecte: r.corecte.map(function (i) { return q.raspunsuri[i]; }),
            explicatie: r.explicatie
          });
        }
        $("btn-principal").textContent = ultima() ? "Vezi rezultatul" : "Următoarea";
      })
      .catch(function () { /* eroare de rețea: utilizatorul poate încerca din nou */ });
  });

  // ---------- Timer (simulare) ----------

  function pornesteTimer() {
    var ramas = minute * 60;
    var t = $("timer");
    t.hidden = false;
    function randeaza() {
      var m = Math.floor(ramas / 60);
      var s = ramas % 60;
      t.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      t.classList.toggle("urgent", ramas <= 60);
    }
    randeaza();
    timerId = setInterval(function () {
      ramas--;
      randeaza();
      if (ramas <= 0) {
        var q = intrebari[idx];
        if (q && !(q.id in raspunsuriSim)) raspunsuriSim[q.id] = alese();
        terminaSimulare();
      }
    }, 1000);
  }
  // ---------- Final ----------

  function arataRezultat(titlu, scor, clasa, greseli) {
    if (timerId) clearInterval(timerId);
    $("intrebare-zona").hidden = true;
    $("rezultat").hidden = false;
    var h = $("rez-titlu");
    h.textContent = titlu;
    h.className = clasa || "";
    $("rez-scor").textContent = scor;

    var ul = $("rez-greseli");
    ul.replaceChildren();
    greseli.forEach(function (g) {
      var li = document.createElement("li");
      var intr = document.createElement("strong");
      intr.textContent = g.intrebare;
      var corect = document.createElement("div");
      corect.textContent = "Răspuns corect: " + g.corecte.join("; ");
      li.append(intr, corect);
      if (g.explicatie) {
        var ex = document.createElement("em");
        ex.textContent = g.explicatie;
        li.append(ex);
      }
      ul.append(li);
    });
  }

  function terminaPractica() {
    arataRezultat(
      "Gata!",
      "Ai răspuns corect la " + corectePractica + " din " + intrebari.length + " întrebări.",
      "",
      gresitePractica
    );
  }

  function terminaSimulare() {
    if (terminat) return;
    terminat = true;
    if (timerId) clearInterval(timerId);

    intrebari.forEach(function (q) {
      if (!(q.id in raspunsuriSim)) raspunsuriSim[q.id] = [];
    });

    post("/api/verifica", { cat: cat, raspunsuri: raspunsuriSim })
      .then(function (r) {
        var greseli = [];
        r.detalii.forEach(function (d) {
          if (d.corect) {
            Progres.elimina(cat, d.id);
            return;
          }
          Progres.adauga(cat, d.id);
          var q = intrebari.filter(function (x) { return x.id === d.id; })[0];
          if (!q) return;
          greseli.push({
            intrebare: q.intrebare,
            corecte: d.corecte.map(function (i) { return q.raspunsuri[i]; }),
            explicatie: d.explicatie
          });
        });
        arataRezultat(
          r.admis ? "ADMIS" : "RESPINS",
          r.corecte + " corecte, " + r.gresite + " greșite (maximum permis: " + r.permise + ").",
          r.admis ? "admis" : "respins",
          greseli
        );
      })
      .catch(function () {
        terminat = false;
        arataMesaj("Nu am putut verifica răspunsurile. Reîncarcă pagina și încearcă din nou.");
      });
  }

  incarca();
})();
