# Note personale: proiect Django (legislație rutieră + chestionare auto)

Fișa mea de lucru. Completez pe măsură ce învăț.

## 1. Comenzi (PowerShell, în folderul cu `manage.py`)

```powershell
venv\Scripts\activate                  # activez mediul virtual (apare (venv) în față)
python manage.py runserver             # pornesc serverul -> http://127.0.0.1:8000
python manage.py check                 # verific dacă setările sunt în regulă
python manage.py startapp nume         # creez o aplicație nouă
python manage.py makemigrations        # după ce schimb models.py
python manage.py migrate               # aplic schimbările în baza de date
python manage.py createsuperuser       # cont pentru panoul /admin
python manage.py shell                 # consolă Python cu proiectul încărcat
pip install nume_pachet                # instalez un pachet
pip freeze > requirements.txt          # salvez pachetele instalate
```

Oprit serverul: `Ctrl + C`.

## 2. Cum funcționează (ideea de bază)

```
browser cere o adresă
   -> urls.py găsește adresa și alege un view
   -> views.py (funcția) pregătește datele
   -> șablonul .html primește datele și devine pagină
   -> browserul primește HTML și cere CSS/JS/imagini din static/
```

Pentru **orice pagină nouă** am nevoie de 3 piese:

1. **Șablon** în `templates/` (ce se vede)
2. **View** în `views.py` (logica)
3. **URL** în `urls.py` (adresa)

Dacă pagina nu apare, una din cele 3 lipsește sau nu e legată bine.

## 3. Listă de verificare

### Aplicație nouă
- [ ] `python manage.py startapp nume`
- [ ] adaug `"nume"` în `INSTALLED_APPS` (`config/settings.py`)
- [ ] creez `nume/urls.py`
- [ ] îl leg în `config/urls.py` cu `include("nume.urls")`

### Pagină nouă
- [ ] șablon (extinde `base.html` cu `{% extends "base.html" %}`)
- [ ] view în `views.py`
- [ ] `path(...)` în `urls.py`, cu `name="..."`
- [ ] în șablon, link-urile se fac cu `{% url 'nume' %}`, nu cu adrese scrise de mână

### Model nou (date în baza de date)
- [ ] clasa în `models.py`
- [ ] `makemigrations`, apoi `migrate`
- [ ] o înregistrez în `admin.py` ca să o văd în `/admin`

### Fișiere statice
- [ ] `STATIC_URL` și `STATICFILES_DIRS = [BASE_DIR / "static"]` în `settings.py`
- [ ] în șablon: `{% load static %}` sus, apoi `{% static 'css/style.css' %}`
- [ ] imaginile încărcate din admin: `MEDIA_URL` și `MEDIA_ROOT` în `settings.py`, plus linia pentru media în `config/urls.py` (doar pentru dezvoltare)

### Șabloane comune
- [ ] `TEMPLATES` -> `DIRS` conține `BASE_DIR / "templates"`

## 4. Flask vs Django (ca să fac legătura cu ce am văzut)

| Flask | Django |
|---|---|
| `@app.route("/x")` | `path("x/", view)` în `urls.py` |
| `render_template(...)` | `render(request, ...)` |
| `url_for('nume')` | `{% url 'nume' %}` |
| `url_for('static', filename=...)` | `{% static '...' %}` |
| `jsonify(...)` | `JsonResponse(...)` |
| fișier JSON cu date | model + tabel în baza de date |

## 5. Erori frecvente

| Mesaj | Cauza probabilă |
|---|---|
| `TemplateDoesNotExist` | calea șablonului e greșită sau `DIRS` nu are folderul `templates` |
| `NoReverseMatch` | numele din `{% url %}` nu există în `urls.py` |
| `no such table` | am uitat `makemigrations` / `migrate` |
| `ModuleNotFoundError` | pachet neinstalat sau venv neactivat |
| pagina nu se schimbă | nu am salvat fișierul sau am modificat altul |
| CSS/imagini nu apar | `STATICFILES_DIRS` lipsește sau lipsește `{% load static %}` |
| `Page not found (404)` | adresa nu e în `urls.py` (sau aplicația nu e inclusă în `config/urls.py`) |

La orice eroare: citesc **ultima linie** a mesajului și numele fișierului și al liniei indicate.

## 6. Reguli de siguranță

- Nu urc pe GitHub: `venv/`, `db.sqlite3`, `__pycache__/`, parole și chei. Le pun în `.gitignore`.
- `SECRET_KEY` din `settings.py` nu se publică într-un proiect real.
- Înainte de lansare: `DEBUG = False` și `ALLOWED_HOSTS` completat.
- Nu folosesc surse (întrebări, SVG-uri) fără să verific licența.

## 7. Git, minimul necesar

```powershell
git init
git add .
git commit -m "mesaj scurt"
git push
```

## 8. Ordinea de învățare

- [ ] Pornit serverul și văzut pagina cu racheta
- [ ] Adăugat aplicațiile în `INSTALLED_APPS`
- [ ] Prima pagină: `index.html` (șablon + view + URL)
- [ ] `base.html` cu meniu; paginile îl extind
- [ ] Modelul `Indicator` + panoul de administrare
- [ ] Introdus primele indicatoare + SVG-uri
- [ ] Pagina de galerie a indicatoarelor
- [ ] Modelele `Intrebare` și `Raspuns`
- [ ] Import din JSON (script) pentru cele 1300 de întrebări
- [ ] Chestionarul (simulare, practică)
- [ ] Login și înregistrare
- [ ] Progres salvat pe utilizator

## 9. Ce am învățat / greșeli făcute

(completez aici, cu cuvintele mele)

-
