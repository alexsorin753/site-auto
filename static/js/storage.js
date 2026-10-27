// Progres salvat în browser: ID-urile întrebărilor greșite, pe categorie.
// Când vei avea conturi (Flask + bază de date), logica asta se mută pe server.
var Progres = (function () {
  var PREFIX = "autotest_gresite_";

  function citeste(cat) {
    try {
      var v = JSON.parse(localStorage.getItem(PREFIX + cat));
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function scrie(cat, ids) {
    try { localStorage.setItem(PREFIX + cat, JSON.stringify(ids)); } catch (e) { /* ignorat */ }
  }

  return {
    getGresite: citeste,
    adauga: function (cat, id) {
      var ids = citeste(cat);
      if (ids.indexOf(id) === -1) {
        ids.push(id);
        scrie(cat, ids);
      }
    },
    elimina: function (cat, id) {
      scrie(cat, citeste(cat).filter(function (x) { return x !== id; }));
    }
  };
})();
