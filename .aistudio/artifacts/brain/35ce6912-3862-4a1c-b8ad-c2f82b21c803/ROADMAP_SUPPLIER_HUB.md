# Roadmap : Hub Fournisseurs Multi-Tenant (MAZIGHO)

## 1. Vision & Architecture Globale

Chaque boutique autorisée au module Dropshipping disposera de son propre **Hub Fournisseurs** directement intégré dans son espace d'administration privé.

### Principes Fondamentaux :
- **Isolation stricte (Multi-Tenant) :** Chaque commerçant renseigne et gère ses propres clés d'API et jetons (CJdropshipping, AliExpress, Printful, Printify). Aucun accès ni aucune donnée n'est partagée entre boutiques ni avec la boutique mère.
- **Chiffrement & Sécurité :** Clés stockées de manière chiffrée côté serveur, jamais exposées en clair sur le frontend.
- **Contrôle Studio (SuperAdmin) :** Dans MAZIGHO Studio, la plateforme conserve le contrôle d'attribution du module (activé, suspendu, bridé ou offert) boutique par boutique.

---

## 2. Organisation du Hub Fournisseurs (3 Piliers)

### Étape 1 : Connexions Fournisseurs
Panneau de gestion des intégrations par boutique :
- **CJdropshipping** (API / Access Key)
- **AliExpress** (Open Platform / API Key)
- **Printful** (OAuth / Token API)
- **Printify** (API Token)
- **Statuts en temps réel :** `Non connecté` | `À vérifier` | `Connecté`

### Étape 2 : Moteur de Recherche & Import Intelligent
- **Recherche globale :** Par mots-clés, catégories ou collage direct d'URL produit.
- **Filtres de qualification :**
  - Pays d'expédition et pays de livraison cible
  - Délais de livraison
  - Prix d'achat maximum
  - Stock garanti
- **File de travail (Draft Queue) :** Aucun produit n'est injecté automatiquement dans le catalogue public. Le système crée uniquement des brouillons qualifiés.

### Étape 3 : Atelier d'Édition & Publication
Pour chaque produit en brouillon :
- **Calculateur de marge dynamique :** Coût d'achat + expédition vs Prix de vente cible = Marge nette & Pourcentage.
- **Gestionnaire multimédia :** Sélection, recadrage, suppression des visuels inutiles.
- **Optimisation SEO & Fiche produit :** Titre commercial, description optimisée, tags, variantes (tailles, coloris).
- **Publication contrôlée :** Revue manuelle obligatoire avant mise en ligne définitive.

---

## 3. Plan d'Implémentation pour la Prochaine Session

1. **Modèle de données & multi-tenant :**
   - Tables pour les identifiants fournisseurs isolés par boutique.
   - File d'attente des brouillons produits qualifiés.
2. **Backend & Connecteurs API :**
   - Services d'appels chiffrés et modules d'import normalisés.
3. **UI Admin Commerçant :**
   - Nouveau sous-menu `Hub Fournisseurs` dans le dashboard vendeur.
   - Interface intuitive en 3 volets (Connexions ➔ Sourcing ➔ Validation).
4. **Administration MAZIGHO Studio :**
   - Gestion fine des autorisations et activation du module par boutique.
