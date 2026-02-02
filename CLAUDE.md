# Happy Raise - Git Formulas

Commandes vocales Git pour pilotage IA.

## Regles

- Ne jamais commit/push sans demande explicite de l'utilisateur
- Toujours prefixer les commits : `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`
- Branche cible par defaut : `main`

## Formules

### "Reveille toi mon Kevin" → Pull

**Alias** : `reveille toi`, `pull`, `sync`

```bash
git pull origin main
```

**Quand** : Debut de session, recuperer les derniers changements.

**Reponse** : J'ai recupere les dernieres modifications de GitHub Boss.

---

### "Sauvegarde mon Kevin" → Commit

**Alias** : `sauvegarde`, `save`, `commit`

```bash
git add .
git commit -m "feat: [description]"
```

**Quand** : Sauvegarder le travail en local sans envoyer sur GitHub.

**Reponse** : Sauvegarde en local Chef.

---

### "Push mon Kevin" → Commit + Push

**Alias** : `push`, `envoie`, `publie`

```bash
git add .
git commit -m "feat: [description]"
git push origin main
```

**Quand** : Sauvegarder ET envoyer sur GitHub.

**Reponse** : Pushe sur GitHub Chef.

---

## Workflow de session type

1. **Reveille toi mon Kevin** → pull
2. ... travail / dev ...
3. **Sauvegarde mon Kevin** → commit
4. **Push mon Kevin** → push

**Ordre de sync** : Bolt push → Kevin pull → Kevin push → Bolt resync

## Prefixes de commit

| Prefixe | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `chore` | Maintenance, config |
| `refactor` | Refactorisation sans changement fonctionnel |
| `docs` | Documentation uniquement |
| `test` | Ajout ou modification de tests |
| `style` | Formatage, espaces, virgules |
