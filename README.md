# AutoTest: legislație rutieră și chestionare auto

## Pornire

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --debug
```

Apoi deschide http://127.0.0.1:5000

## Structură

```
site-auto/
├── app.py              # rute pagini + API chestionare
├── requirements.txt
├── data/
│   ├── intrebari-B.json   # întrebări (acum: 5 de probă)
│   └── capitole.json      # capitolele de legislație
├── templates/          # pagini HTML (Jinja), toate extind base.html
└── static/             # css, js, img (servite direct)
```

## Cum adaugi lucruri

- **Întrebări noi**: adaugi obiecte în `data/intrebari-B.json` (același format, `id` unic).
  Pentru altă categorie creezi `data/intrebari-A.json` etc.
- **Imagini la întrebări**: le pui în `static/img/intrebari/` și scrii numele în câmpul `imagine`.
- **Capitole noi**: adaugi în `data/capitole.json`; `slug` trebuie să se potrivească cu `capitol` din întrebări.

## De verificat înainte de lansare

- Regulile examenului (număr de întrebări, timp, greșeli permise) sunt în `CONFIG` din `app.py`.
  Verifică-le pe site-ul oficial DRPCIV.
- Întrebările din `intrebari-B.json` sunt doar de probă.
- Condițiile de folosire a bazei oficiale de întrebări.
