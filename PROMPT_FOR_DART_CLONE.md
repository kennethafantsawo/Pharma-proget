
# Prompt pour cloner une application web Next.js en application mobile Flutter/Dart

## **Objectif Principal**

Votre mission est de cloner une application web existante, développée en Next.js, en une application mobile multiplateforme (iOS et Android) en utilisant le framework Flutter et le langage Dart. L'application devra répliquer à l'identique le design, les fonctionnalités et l'expérience utilisateur de l'application web originale.

---

## **1. Stack Technique Cible**

*   **Framework :** Flutter
*   **Langage :** Dart
*   **Gestion d'état :** Provider ou Riverpod (choisissez le plus approprié pour la complexité de l'application).
*   **Base de données :** Supabase. L'application se connectera au **même** projet Supabase que l'application web. Utilisez le package `supabase_flutter`.
*   **Fonctionnalités IA :** Les fonctionnalités d'IA sont gérées par des "flows" Genkit sur le backend Next.js. L'application Flutter devra interagir avec ces flows via des appels réseau (HTTP POST) aux Server Actions Next.js qui les exposent.
*   **Styling :** Recréez le style de manière fidèle. L'application originale utilise TailwindCSS et des composants ShadCN UI. En Flutter, cela se traduit par une attention particulière au `ThemeData`, aux widgets personnalisés et à l'organisation du layout.

---

## **2. Design et Thème Global**

L'application doit avoir un design moderne, épuré et fonctionnel.

*   **Thème :** L'application doit supporter un thème clair et un thème sombre. Le changement de thème doit être possible via une option dans l'interface.
    *   **Couleurs (thème clair) :**
        *   `background`: `hsl(210, 40%, 97%)`
        *   `foreground`: `hsl(215, 25%, 27%)`
        *   `primary`: `hsl(16, 96%, 54%)`
        *   `accent`: `hsl(210, 90%, 55%)`
        *   `card`: `hsl(0, 0%, 100%)`
    *   **Couleurs (thème sombre) :**
        *   `background`: `hsl(222, 47%, 12%)`
        *   `foreground`: `hsl(210, 40%, 98%)`
        *   `primary`: `hsl(16, 96%, 60%)`
        *   `accent`: `hsl(210, 90%, 65%)`
        *   `card`: `hsl(222, 47%, 14%)`
*   **Typographie :**
    *   **Corps du texte :** Police "Inter".
    *   **Titres :** Police "Sora".
*   **Composants :**
    *   Les cartes (`Card`) ont des coins arrondis (`borderRadius: 0.5rem`) et une légère ombre portée (`shadow-sm`).
    *   Les boutons (`Button`) ont également des coins arrondis et des états visuels clairs pour "hover" (au survol sur le web, peut être ignoré sur mobile ou remplacé par un effet au toucher) et "disabled".
    *   Utilisez des icônes de la librairie `lucide_icons` pour correspondre à `lucide-react`.

---

## **3. Structure de l'Application et Navigation**

Utilisez une navigation par onglets en bas de l'écran (`BottomNavigationBar`) pour les sections principales.

*   **Layout de base :** Créez un `Scaffold` de base qui inclut un `AppBar` personnalisé et la `BottomNavigationBar`.
*   **AppBar :**
    *   Affiche le logo et le titre "PharmaGuard".
    *   Contient un bouton pour changer de thème (Clair/Sombre/Système).
*   **BottomNavigationBar (Onglets) :**
    1.  **Pharmacies** (`Icon(Icons.local_pharmacy)`) - Page d'accueil.
    2.  **Infos Médicaments** (`Icon(Icons.medication)`)
    3.  **Fiches Santé** (`Icon(Icons.article)`)
    4.  **Avis** (`Icon(Icons.star)`)
    5.  **Options** (`Icon(Icons.settings)`)

---

## **4. Description détaillée des Pages et Fonctionnalités**

### **Page 1 : Pharmacies (Accueil)**

*   **Objectif :** Afficher les pharmacies de garde pour une semaine donnée.
*   **Données :** Fetcher les données depuis la table `weeks` de Supabase, en joignant les `pharmacies` associées. La requête doit ressembler à : `supabase.from('weeks').select('semaine, pharmacies(nom, localisation, contact1, contact2)')`.
*   **UI :**
    1.  **Navigateur de semaine :** En haut, un composant permettant de changer de semaine.
        *   Affiche la semaine actuelle (ex: "Du 20/05/24 au 26/05/24").
        *   Deux boutons fléchés (`<`, `>`) pour passer à la semaine précédente/suivante.
        *   Un menu déroulant (`DropdownButton`) pour sélectionner directement une semaine dans la liste.
        *   L'application doit automatiquement sélectionner la semaine qui contient la date du jour.
    2.  **Barre de recherche :** Un champ de texte (`TextField`) pour filtrer les pharmacies par nom ou par localisation.
    3.  **Liste des pharmacies :**
        *   Un `ListView.builder` pour afficher la liste des pharmacies filtrées.
        *   Chaque item est une `PharmacyCard`.
    4.  **PharmacyCard :**
        *   Affiche le nom de la pharmacie (en couleur `accent`).
        *   Affiche la localisation avec une icône `MapPin`.
        *   Deux boutons d'action :
            *   "Appeler" (`Icon(Icons.phone)`) qui lance un appel au `contact1`. Utilisez le package `url_launcher`.
            *   "WhatsApp" (`Icon(Icons.chat)`) qui ouvre une discussion WhatsApp avec le `contact2`.
*   **Logique :**
    *   Gérer les états de chargement (`CircularProgressIndicator`) et d'erreur (`Text` avec message d'erreur).
    *   Le filtrage par recherche doit se faire en temps réel.

### **Page 2 : Infos Médicaments**

*   **Objectif :** Permettre à l'utilisateur de rechercher des informations sur un médicament via une IA.
*   **UI :**
    1.  Un en-tête avec un titre "Informations Médicaments" et une icône `Pill`.
    2.  Une barre de recherche (`TextField`) et un bouton "Rechercher".
    3.  Une section pour afficher les résultats.
*   **Logique :**
    1.  Lorsque l'utilisateur soumet une recherche :
        *   Afficher un indicateur de chargement.
        *   Faire un appel **HTTP POST** au backend Next.js qui expose la `medicationInfoAction`.
        *   **Endpoint (à créer côté Next.js si besoin) :** `/api/ai/medication-info`
        *   **Payload (JSON) :** `{ "medicationName": "nom_du_medicament" }`
        *   **Réponse attendue (JSON) :**
            ```json
            {
              "name": "...",
              "description": "...",
              "dosage": "...",
              "sideEffects": "...",
              "contraindications": "..."
            }
            ```
    2.  **Affichage des résultats :**
        *   Une fois la réponse reçue, afficher les informations dans des cartes séparées, chacune avec un titre et une icône :
            *   Description (`Pill`)
            *   Posologie (`HeartPulse`)
            *   Effets secondaires (`AlertTriangle`)
            *   Contre-indications (`ShieldAlert`)
        *   Gérer les cas d'erreur en affichant un message clair.

### **Page 3 : Fiches Santé (Health Library)**

*   **Objectif :** Afficher un fil d'actualités de fiches santé.
*   **Données :** Fetcher les données depuis la table `health_posts` de Supabase. N'afficher que les fiches où `publish_at` est dans le passé ou est `null`. Ordonner par `created_at` descendant.
*   **UI :**
    *   Un `ListView` affichant une série de `HealthPostCard`.
    *   **HealthPostCard :**
        *   Affiche le titre et le contenu du post.
        *   Affiche l'image (`Image.network`) si `image_url` n'est pas nul. L'image doit être cliquable pour s'afficher en plein écran dans une modale.
        *   Affiche la date de publication relative (ex: "il y a 2 jours"). Utilisez le package `timeago`.
        *   **Barre d'actions :**
            *   **Commentaires** (`MessageCircle`) : Affiche le nombre de commentaires. Au clic, ouvre une section de commentaires sous le post.
            *   **Like** (`Heart`) : Affiche le nombre de likes. L'icône est remplie si l'utilisateur a déjà liké.
            *   **Partager** (`Share2`) : Partage le lien vers le post. Utilisez le package `share_plus`.
    *   **Section Commentaires (extensible) :**
        *   Un champ de texte pour ajouter un nouveau commentaire.
        *   Une liste des commentaires existants.
*   **Logique :**
    *   **Like :**
        *   L'état "liké" doit être sauvegardé localement (`shared_preferences`) pour persister.
        *   Au clic, faire une mise à jour optimiste de l'UI (incrémenter/décrémenter le compteur et changer l'état de l'icône).
        *   Appeler en arrière-plan une Edge Function Supabase (ou une API) pour mettre à jour le compteur `likes` dans la base de données.
    *   **Ajout de commentaire :**
        *   Mise à jour optimiste : ajouter le commentaire à la liste dans l'UI immédiatement.
        *   Insérer le commentaire dans la table `health_post_comments` de Supabase.

### **Page 4 : Avis (Feedback)**

*   **Objectif :** Recueillir les avis et suggestions des utilisateurs.
*   **UI :**
    *   Un formulaire avec :
        *   Un groupe de `Radio` pour choisir le type : "Avis" ou "Suggestion".
        *   Un `TextField` multiligne pour le message.
        *   Un bouton "Envoyer".
*   **Logique :**
    *   Validation du formulaire (type sélectionné, message non vide, longueur min/max).
    *   À la soumission, insérer les données dans la table `user_feedback` de Supabase.
    *   Afficher une `SnackBar` (ou un toast) de succès ou d'erreur.

### **Page 5 : Options (Admin)**

*   **Objectif :** Panneau d'administration protégé par mot de passe.
*   **UI :**
    1.  **Écran de connexion :** Un `TextField` pour le mot de passe.
    2.  **Panneau principal (si connecté) :**
        *   Utilise des `TabBar` et `TabBarView` pour deux sections : "Pharmacies" et "Fiches Santé".
        *   **Onglet Pharmacies :** Un bouton "Charger un JSON" qui ouvre un sélecteur de fichier (`file_picker`).
        *   **Onglet Fiches Santé :**
            *   Un formulaire pour créer une nouvelle fiche (titre, contenu, image, date de publication).
            *   Une liste des fiches existantes, chacune avec des boutons pour "Modifier" et "Supprimer".
*   **Logique :**
    *   Le mot de passe est `kenneth18`.
    *   Toutes les actions (créer, mettre à jour, supprimer) doivent appeler les **Server Actions Next.js** correspondantes via HTTP POST, en incluant le mot de passe dans le corps de la requête pour validation côté serveur.
    *   **Mise à jour des pharmacies :** Le fichier JSON sélectionné est lu, son contenu est envoyé au backend qui se charge de vider et de remplir les tables `weeks` et `pharmacies`.
    *   Les formulaires de création/modification de fiches santé doivent gérer l'upload d'images vers Supabase Storage.

### **Fonctionnalité Globale : Chatbot**

*   **Objectif :** Fournir un assistant IA accessible depuis toute l'application.
*   **UI :**
    1.  Un `FloatingActionButton` (FAB) personnalisé avec une icône "Sparkle" est visible en bas à droite sur toutes les pages.
    2.  Au clic, une modale ou une nouvelle page (`showModalBottomSheet` ou `Navigator.push`) s'ouvre.
    3.  L'interface du chat affiche une liste de messages. Les messages de l'utilisateur et de l'assistant doivent être stylisés différemment (alignement, couleur de fond).
    4.  En bas, un `TextField` et un bouton "Envoyer".
*   **Logique :**
    1.  Quand l'utilisateur envoie un message :
        *   Afficher le message de l'utilisateur dans la liste.
        *   Afficher un indicateur de chargement.
        *   Faire un appel **HTTP POST** à l'endpoint `/api/ai/pharmacy-chatbot`.
        *   **Payload :** `{ "query": "question de l'utilisateur" }`
        *   **Réponse attendue :** `{ "response": "réponse de l'IA" }`
    2.  Afficher la réponse de l'IA dans la liste. La conversation doit pouvoir défiler.

---

## **5. Connexion au Backend**

*   **Supabase :** Initialisez le client Supabase dans votre `main.dart` avec les clés `SUPABASE_URL` et `SUPABASE_ANON_KEY`. Toutes les requêtes aux tables (`health_posts`, `weeks`, etc.) se font directement via ce client.
*   **Fonctions IA et Admin :** Créez une classe de service `ApiService` qui gère les appels HTTP (avec le package `http`).
    *   Cette classe contiendra des méthodes comme `getMedicationInfo(String name)`, `postFeedback(...)`, `updatePharmacies(String password, File jsonFile)`, etc.
    *   Ces méthodes construiront et enverront les requêtes POST aux endpoints de l'application Next.js, qui agira comme une API pour l'application Flutter. Assurez-vous que l'URL de base de l'API Next.js est configurable.

En suivant ce guide détaillé, vous devriez être en mesure de recréer l'application de manière fidèle et fonctionnelle en Flutter. Bonne chance !
