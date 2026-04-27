# RGNR MVP — React + TypeScript + Vite + Tailwind

Application MVP **strictement non médicale** pour explorer une modélisation RGNR locale:
- questionnaire de 49 questions,
- scoring côté navigateur,
- attribution profil principal / secondaire,
- sauvegarde locale (`localStorage`),
- tests de cohérence et de calcul.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir l'URL indiquée par Vite (souvent `http://localhost:5173`).

## Commandes utiles

```bash
npm run test
npm run lint:types
npm run build
npm run preview
```

## Données métier utilisées

- `data/rgnr_questions_v1.json`
- `data/rgnr_profiles_v1.json`
- `data/rgnr_calibration_cases_v1.json`
- `src/lib/rgnr_scoring_engine_v1.ts`

⚠️ Les IDs de questions/profils existants sont conservés tels quels (`Q01..Q49`, `P01..P15`).
