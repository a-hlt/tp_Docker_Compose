# Ynov M1 Full Stack - TP Docker Compose & Registries

Ce projet contient les livrables requis pour le TP Docker Compose & Registries. Il s'agit d'un monorepo contenant une application conteneurisée constituée d'un frontend en React, d'un backend en NodeJS/Express et d'une base de données PostgreSQL.

---

## 🛠️ Architecture du projet

Le projet est structuré en monorepo de la façon suivante :

* **`/frontend`** : Application SPA React (Vite) servie par **Nginx** (Reverse Proxy). Nginx redirige automatiquement les appels d'API `/api/*` vers le service backend Docker sur le port `3000`.
* **`/backend`** : Serveur NodeJS Express exposant des endpoints d'API REST. Il gère l'initialisation automatique du schéma de la base de données et implémente une logique de reconnexion robuste avec retries.
* **PostgreSQL (`db`)** : Base de données relationnelle persistée via un volume Docker nommé (`postgres_data`).
* **`.github/workflows/ci.yml`** : Pipeline d'intégration continue utilisant GitHub Actions pour builder et pousser automatiquement les images multi-stage sur Docker Hub.

---

## 🚀 Lancement local (Docker Compose)

### 1. Prérequis
Assurez-vous que **Docker** et **Docker Compose** (ou Docker Desktop) sont installés et démarrés sur votre machine.

### 2. Configuration
Copiez le fichier de configuration des variables d'environnement à la racine du projet :
```bash
cp .env.example .env
```
*(Sur Windows PowerShell : `Copy-Item .env.example .env`)*

Vous pouvez ajuster les identifiants ou les ports si nécessaire dans le fichier `.env`.

### 3. Démarrage de l'application
Exécutez la commande suivante à la racine du monorepo pour construire les images multi-stage et lancer les conteneurs en tâche de fond :
```bash
docker compose up --build -d
```

### 4. Accès aux services
Une fois démarré, vous pouvez accéder à l'application via :
* 🌐 **Frontend** : [http://localhost:8080](http://localhost:8080)
* ⚙️ **Backend (API)** : [http://localhost:3000/api/health](http://localhost:3000/api/health)
* 🗄️ **Base de données (PostgreSQL)** : Accessible sur l'hôte au port `5432`

---

## 🐋 Dockerfiles Multi-stage

Les fichiers Docker de ce projet sont optimisés pour la production :

* **Backend (`/backend/Dockerfile`)** :
  * **Stage 1 (Builder)** : Installe toutes les dépendances de développement.
  * **Stage 2 (Runner)** : Installe uniquement les dépendances de production (`npm ci --only=production`), copie les fichiers requis et exécute l'application avec un utilisateur système non privilégié (`node`) pour des raisons de sécurité.
* **Frontend (`/frontend/Dockerfile`)** :
  * **Stage 1 (Builder)** : Utilise Node pour compiler l'application React en fichiers statiques dans le dossier `dist/`.
  * **Stage 2 (Runner)** : Déploie une image Nginx légère, supprime les fichiers par défaut, intègre les fichiers construits par le builder et utilise une configuration Nginx personnalisée (`nginx.conf`) pour gérer le SPA routing et le reverse proxy vers l'API.

---

## 🌐 Pipeline CI/CD (GitHub Actions)

Le fichier `.github/workflows/ci.yml` est préconfiguré pour exécuter la pipeline d'intégration continue suivante :
1. Déclenchement automatique lors de chaque push sur `main`/`master` ou push d'un tag de version (`v*`).
2. Log à **Docker Hub**.
3. Extraction automatique des tags et métadonnées (génère `latest` sur la branche principale, un tag court basé sur le commit SHA `sha-xxxxxxx` et un tag de release si applicable).
4. Build des Dockerfiles frontend et backend à l'aide de **Buildx** avec gestion du cache GitHub Actions pour accélérer les futurs builds.
5. Push des images sur Docker Hub.

### 🔑 Configuration requise sur GitHub
Pour faire fonctionner le pipeline sur votre dépôt personnel, vous devez ajouter deux **Secrets de dépôt** dans l'interface GitHub (`Settings > Secrets and variables > Actions`) :
* `DOCKERHUB_USERNAME` : Votre identifiant de compte Docker Hub.
* `DOCKERHUB_TOKEN` : Un token d'accès Docker Hub généré dans les paramètres de votre compte Docker Hub.

---

## 📧 Modalités de rendu du TP

Comme spécifié dans le cours :
* **Objet de l'email** : `NOM PRENOM - TP Docker Compose`
* **Destinataire** : `thomas.fourties31@ynov.com`
* **Contenu** :
  * Lien vers votre profil Docker Hub (ex: `https://hub.docker.com/u/username`)
  * Lien vers votre dépôt GitHub (public) contenant ce code et l'historique Git.
