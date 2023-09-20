# Billed
![Logo](https://github.com/maxew33/OC-P9-Billed/blob/main/logo.png)

## Objectif

- Corriger des bugs existants puis implémenter des tests unitaires et d'intégration.

## Compétences cibles

- Débugger une application web avec le Chrome debugger
- Écrire des tests d'intégration en js
- Écrire des tests unitaires en js
- Rédiger un plan de test end-to-end

## Comment lancer l'appli en local

### Lancer le backend

- accéder au repertoire :
`cd Billed-app-FR-Back`

- installer les dépendances:
`npm install`

- lancer l'API
`npm run run:dev`

Accéder à l'API :

L'api est accessible sur le port `5678` en local, c'est à dire `http://localhost:5678`

### Lancer le frontend

- accéder au repertoire :
`cd Billed-app-FR-Front`

- installer les dépendances :
`npm install`

- installer live-server pour lancer un serveur local :
`npm install -g live-server`

- lancer l'application :
`live-server`

Puis allez à l'adresse : `http://127.0.0.1:8080/`

### Utilisateur par défaut

- administrateur
```
utilisateur : admin@test.tld 
mot de passe : admin
```

- employé.e
```
utilisateur : employee@test.tld
mot de passe : employee
```

## Tests

### lancer les tests en local avec Jest
`npm run test`

### résultats des tests

- rapport de tests Jest sur l’ensemble des fichiers.
![rapport de tests](https://github.com/maxew33/OC-P9-Billed/blob/main/OC-P9-Billed-tests.png)

- rapport de couverture Jest
![rapport de couverture](https://github.com/maxew33/OC-P9-Billed/blob/main/OC-P9-Billed-rapport-couv.png)

### test e2e
[test end to end](https://github.com/maxew33/OC-P9-Billed/blob/main/OC-P9-Billed-test-e2e.pdf)

## Author
- [Maxime Malfilâtre](https://www.github.com/maxew33)

