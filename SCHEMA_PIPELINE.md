# Schéma Visuel du Pipeline CI/CD

## 🎬 Vue d'ensemble : Ce qui se passe quand vous faites un push

```
┌─────────────────────────────────────────────────────────────┐
│  Vous faites : git push eboutique main                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub détecte le push sur la branche "main"               │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions lit .github/workflows/run_tests.yml          │
│  "Ah ! Il y a un workflow qui se déclenche sur 'push'"      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  🚀 DÉMARRAGE DU WORKFLOW                                    │
│  "Tests d'automatisation Selenium"                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  📦 JOB : test                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Machine : ubuntu-latest (Ubuntu 22.04)                 │ │
│  │                                                         │ │
│  │ STEP 1: Checkout du code                                │ │
│  │   → Télécharge tout le code du repository              │ │
│  │   → Place dans /home/runner/work/.../                   │ │
│  │                                                         │ │
│  │ STEP 2: Configuration Python                           │ │
│  │   → Installe Python 3.11                                │ │
│  │   → Configure pip                                        │ │
│  │                                                         │ │
│  │ STEP 3: Installation Chrome                            │ │
│  │   → Ajoute le repository Google                        │ │
│  │   → Installe google-chrome-stable                       │ │
│  │                                                         │ │
│  │ STEP 4: Installation dépendances                        │ │
│  │   → pip install selenium                                │ │
│  │   → pip install python-dotenv                          │ │
│  │   → pip install webdriver-manager                       │ │
│  │                                                         │ │
│  │ STEP 5: Test TC001                                      │ │
│  │   → Définit CI=true, PYTHONPATH, secrets                │ │
│  │   → python TC001/TC001.py                              │ │
│  │   → Chrome headless s'ouvre                             │ │
│  │   → Test d'inscription                                  │ │
│  │   → ✅ Succès ou ❌ Échec                               │ │
│  │                                                         │ │
│  │ STEP 6: Test TC002                                      │ │
│  │   → python TC002/TC002.py                              │ │
│  │   → Test de connexion valide                           │ │
│  │                                                         │ │
│  │ STEP 7: Test TC003                                      │ │
│  │   → python TC003/TC003.py                              │ │
│  │   → Test de connexion invalide                         │ │
│  │                                                         │ │
│  │ STEP 8: Upload logs (si échec)                         │ │
│  │   → Sauvegarde les logs et screenshots                 │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 RÉSULTAT                                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ✅ Tous les tests passent                              │ │
│  │    → Badge vert dans GitHub                            │ │
│  │    → Vous pouvez merger la PR                          │ │
│  │                                                         │ │
│  │ ❌ Un test échoue                                       │ │
│  │    → Badge rouge dans GitHub                           │ │
│  │    → Logs disponibles                                  │ │
│  │    → Vous devez corriger avant de merger               │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Comparaison : Local vs CI

### Exécution LOCALE (sur votre machine)

```
Vous tapez : python TC001/TC001.py
    │
    ▼
Python exécute le script
    │
    ▼
Selenium ouvre Chrome (visible)
    │
    ▼
Test s'exécute
    │
    ▼
input() → Vous appuyez sur Entrée
    │
    ▼
Chrome se ferme
```

### Exécution CI (GitHub Actions)

```
Push sur GitHub
    │
    ▼
GitHub Actions démarre une machine Ubuntu
    │
    ▼
Machine télécharge le code
    │
    ▼
Machine installe Python, Chrome, dépendances
    │
    ▼
Machine exécute : python TC001/TC001.py
    │
    ▼
Selenium ouvre Chrome (headless, invisible)
    │
    ▼
Test s'exécute automatiquement
    │
    ▼
Pas de input() → Continue automatiquement
    │
    ▼
Chrome se ferme
    │
    ▼
Résultat affiché dans GitHub
```

## 📁 Structure des fichiers

```
eboutique_reconcil_beauty_afro/
│
├── .github/                          ← Dossier spécial GitHub
│   └── workflows/                    ← Contient les workflows
│       └── run_tests.yml             ← VOTRE PIPELINE (le workflow)
│
├── TC001/
│   └── TC001.py                      ← Test 1
│
├── TC002/
│   └── TC002.py                      ← Test 2
│
├── TC003/
│   └── TC003.py                      ← Test 3
│
├── utils/
│   ├── driver.py                     ← Crée le driver Selenium
│   ├── wait_element.py               ← Attend les éléments
│   ├── click_element.py              ← Clique sur éléments
│   ├── fill_input.py                 ← Remplit les champs
│   ├── fill_login_form.py            ← Remplit le formulaire login
│   ├── fill_register_form.py         ← Remplit le formulaire inscription
│   └── get_env_var.py                ← Lit les variables d'environnement
│
├── requirements.txt                  ← Liste des packages Python
│
└── README.md                         ← Documentation
```

## 🔐 Flux des secrets

```
┌─────────────────────────────────────┐
│  GitHub Secrets (Settings)            │
│  ┌─────────────────────────────────┐ │
│  │ LASTNAME: "Dupont"              │ │
│  │ FIRSTNAME: "Jean"               │ │
│  │ LOGIN_USERNAME: "user@..."      │ │
│  │ LOGIN_PASSWORD: "pass123"       │ │
│  │ ...                             │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
            │
            │ (injection)
            ▼
┌─────────────────────────────────────┐
│  Workflow YAML                      │
│  env:                               │
│    LASTNAME: ${{ secrets.LASTNAME }}│
│    FIRSTNAME: ${{ secrets.FIRSTNAME }}│
└─────────────────────────────────────┘
            │
            │ (variables d'environnement)
            ▼
┌─────────────────────────────────────┐
│  Python Script                      │
│  value = os.getenv("LASTNAME")      │
│  # value = "Dupont"                 │
└─────────────────────────────────────┘
```

## ⏱️ Timeline d'une exécution

```
00:00 ── Workflow démarre
00:05 ── Checkout terminé
00:10 ── Python installé
00:30 ── Chrome installé
00:45 ── Dépendances installées
01:00 ── Test TC001 démarre
01:30 ── Test TC001 terminé ✅
01:35 ── Test TC002 démarre
02:00 ── Test TC002 terminé ✅
02:05 ── Test TC003 démarre
02:30 ── Test TC003 terminé ✅
02:35 ── Workflow terminé ✅
```

**Durée totale : ~2-3 minutes**

## 🎯 Concepts clés résumés

### Workflow = Recette complète
```
Workflow = Fichier YAML qui dit "comment faire"
```

### Job = Plat principal
```
Job = Une tâche majeure (ex: "faire les tests")
```

### Step = Étape de la recette
```
Step = Une action précise (ex: "installer Python")
```

### Pipeline = Tout le processus
```
Pipeline = Workflow + Jobs + Steps = Tout de A à Z
```

---

**Ce schéma vous aide à visualiser le flux complet ! 🎨**

