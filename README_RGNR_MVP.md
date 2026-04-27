# Pack MVP RGNR — base de modélisation

## Contenu
- `rgnr_questions_v1.json` : 49 questions normalisées
- `rgnr_profiles_v1.json` : 15 profils modélisés
- `rgnr_calibration_cases_v1.json` : 24 cas de test
- `rgnr_scoring_engine_v1.ts` : squelette TypeScript du moteur

## Q38 normalisée
La question `Q38` a été corrigée et normalisée comme question standard à scoring direct :

> Ressentez-vous souvent une sensation de froid ou une mauvaise régulation thermique ?

Réponses :
- A = Jamais
- B = Rarement
- C = Souvent
- D = Presque toujours

## Règle de prudence
Le questionnaire et les profils documentés sont source métier.
En revanche, le mapping décisionnel, les pondérations, les scores cibles, les cas tests et l’algorithme sont des hypothèses de modélisation destinées à un MVP calibrable.
