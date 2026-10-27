"""Site de legislație rutieră și chestionare auto (Flask)."""
import json
import random
from pathlib import Path

from flask import Flask, abort, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Reguli examen: verifică valorile actuale pe site-ul oficial DRPCIV
CONFIG = {
    "categorii": {"A": "Motociclete", "B": "Autoturisme", "C": "Camioane", "D": "Autobuze"},
    "nr_intrebari": 26,
    "max_greseli": 4,
    "minute": 30,
}

app = Flask(__name__)


@app.context_processor
def global_ctx():
    return {"site_name": "AutoTest", "config": CONFIG}


# ---------- Acces la date ----------

def _citeste(nume):
    cale = DATA_DIR / nume
    if not cale.exists():
        return []
    with open(cale, encoding="utf-8") as f:
        return json.load(f)


def intrebari(cat):
    if cat not in CONFIG["categorii"]:
        return []
    return _citeste(f"intrebari-{cat}.json")


def capitole():
    return _citeste("capitole.json")


def gaseste_intrebare(cat, qid):
    return next((q for q in intrebari(cat) if q["id"] == qid), None)


def corecte(q):
    return [i for i, r in enumerate(q["raspunsuri"]) if r["corect"]]


def public(q):
    """Întrebarea trimisă în browser: fără răspunsuri corecte și fără explicație."""
    return {
        "id": q["id"],
        "capitol": q.get("capitol"),
        "intrebare": q["intrebare"],
        "imagine": q.get("imagine"),
        "raspunsuri": [r["text"] for r in q["raspunsuri"]],
    }


def indici_valizi(valori):
    if not isinstance(valori, list):
        return []
    return sorted({v for v in valori if isinstance(v, int)})


# ---------- Pagini ----------

@app.route("/")
def acasa():
    nr_total = sum(len(intrebari(c)) for c in CONFIG["categorii"])
    return render_template("index.html", nr_intrebari=nr_total, nr_capitole=len(capitole()))


@app.route("/chestionare")
def chestionare():
    cat = request.args.get("cat", "B")
    if cat not in CONFIG["categorii"]:
        cat = "B"
    cats = [(cod, nume, len(intrebari(cod))) for cod, nume in CONFIG["categorii"].items()]
    return render_template("chestionare/index.html", cat=cat, cats=cats, capitole=capitole())


@app.route("/chestionare/<cat>/<mod>")
def chestionar(cat, mod):
    if cat not in CONFIG["categorii"] or mod not in ("simulare", "practica", "gresite"):
        abort(404)
    return render_template(
        "chestionare/quiz.html", cat=cat, mod=mod, capitol=request.args.get("capitol", "")
    )


@app.route("/legislatie")
def legislatie():
    return render_template("legislatie/index.html", capitole=capitole())


@app.route("/legislatie/<slug>")
def capitol(slug):
    toate = capitole()
    curent = next((c for c in toate if c["slug"] == slug), None)
    if curent is None:
        abort(404)
    return render_template("legislatie/capitol.html", capitol=curent)


@app.route("/indicatoare")
def indicatoare():
    return render_template("indicatoare.html")


@app.route("/blog")
def blog():
    return render_template("blog.html")


@app.route("/despre")
def despre():
    return render_template("despre.html")


@app.errorhandler(404)
def nu_exista(_):
    return render_template("404.html"), 404


# ---------- API ----------

@app.get("/api/intrebari/<cat>")
def api_intrebari(cat):
    if cat not in CONFIG["categorii"]:
        abort(404)
    toate = intrebari(cat)
    mod = request.args.get("mod", "practica")
    capitol_slug = request.args.get("capitol")
    ids = request.args.get("ids")

    if ids:
        dorite = {int(i) for i in ids.split(",") if i.strip().isdigit()}
        selectie = [q for q in toate if q["id"] in dorite]
    elif capitol_slug:
        selectie = [q for q in toate if q.get("capitol") == capitol_slug]
    else:
        selectie = list(toate)

    random.shuffle(selectie)
    if mod == "simulare":
        selectie = selectie[: CONFIG["nr_intrebari"]]
    return jsonify([public(q) for q in selectie])


@app.post("/api/raspunde")
def api_raspunde():
    """Practică: verifică un singur răspuns pe server."""
    d = request.get_json(silent=True) or {}
    q = gaseste_intrebare(d.get("cat"), d.get("id"))
    if q is None:
        abort(404)
    ok = indici_valizi(d.get("alese")) == corecte(q)
    return jsonify({"corect": ok, "corecte": corecte(q), "explicatie": q.get("explicatie", "")})


@app.post("/api/verifica")
def api_verifica():
    """Simulare: verifică toate răspunsurile la final."""
    d = request.get_json(silent=True) or {}
    cat = d.get("cat")
    raspunsuri = d.get("raspunsuri")
    if cat not in CONFIG["categorii"] or not isinstance(raspunsuri, dict):
        abort(400)

    detalii = []
    for qid_str, alese in raspunsuri.items():
        try:
            qid = int(qid_str)
        except ValueError:
            continue
        q = gaseste_intrebare(cat, qid)
        if q is None:
            continue
        detalii.append(
            {
                "id": qid,
                "corect": indici_valizi(alese) == corecte(q),
                "corecte": corecte(q),
                "explicatie": q.get("explicatie", ""),
            }
        )

    total = len(detalii)
    nr_corecte = sum(1 for x in detalii if x["corect"])
    gresite = total - nr_corecte
    # Pragul se scalează proporțional când sunt mai puține întrebări decât la examen
    permise = CONFIG["max_greseli"] * total // CONFIG["nr_intrebari"]
    return jsonify(
        {
            "total": total,
            "corecte": nr_corecte,
            "gresite": gresite,
            "permise": permise,
            "admis": total > 0 and gresite <= permise,
            "detalii": detalii,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
