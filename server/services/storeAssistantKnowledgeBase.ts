/**
 * Base de connaissances opérationnelle et guide d'orientation complet
 * pour le Copilote IA MAZIGHO Studio & Boutiques Marchandes.
 * 
 * Permet à l'assistant d'orienter l'utilisateur, de trouver des solutions
 * et d'expliquer pas-à-pas chaque procédure et paramètre de la boutique.
 */

export interface StoreOperationalFeatureGuide {
  category: string;
  featureName: string;
  locationInApp: string;
  summary: string;
  steps: string[];
  tips: string[];
}

export const STORE_FEATURES_GUIDE: StoreOperationalFeatureGuide[] = [
  {
    category: "Catalogue & Produits",
    featureName: "Ajout et gestion des images par glisser-déposer (Drag & Drop)",
    locationInApp: "Onglet « Catalogue » > Sélectionner un produit > Onglet « Photos & Médias »",
    summary: "Téléversement direct de photos depuis l'ordinateur par glisser-déposer, réorganisation visuelle des miniatures et attribution de la photo de couverture.",
    steps: [
      "1. Ouvrez l'onglet « Catalogue » dans votre panneau marchand.",
      "2. Cliquez sur « Nouveau produit » ou sur « Modifier » sur une fiche existante.",
      "3. Rendez-vous dans le sous-onglet « Photos & Médias ».",
      "4. Glissez-déposez vos fichiers images (PNG, JPG, WEBP) directement dans la zone pointillée, ou cliquez sur « Parcourir ».",
      "5. Pour changer l'ordre des photos, attrapez une miniature et glissez-la à l'emplacement souhaité.",
      "6. La première image devient automatiquement la « Couverture » affichée en tête de fiche et en grille vitrine (un bouton « Définir comme couverture » permet de le faire en 1 clic).",
      "7. Cliquez sur « Enregistrer la fiche » en bas du formulaire."
    ],
    tips: [
      "Formats recommandés : photos carrées ou verticales 1:1 ou 4:5 en haute résolution (ex. 1200x1200px).",
      "Vous pouvez également ajouter des visuels via une URL directe HTTPS."
    ]
  },
  {
    category: "Catalogue & Produits",
    featureName: "Gestion des Variantes (Couleurs, Tailles, Formats)",
    locationInApp: "Onglet « Catalogue » > Fiche produit > Onglet « Variantes »",
    summary: "Création de déclinaisons de produit avec ajustement de prix (CHF/EUR/DZD), stock propre et visuel dédié.",
    steps: [
      "1. Dans la fiche produit, définissez d'abord les options dans l'onglet « Variantes » (ex. Taille : S, M, L / Couleur : Noir, Blanc).",
      "2. Enregistrez la fiche produit.",
      "3. Cliquez sur « Gérer les variantes » pour ouvrir le générateur de matrice.",
      "4. Pour chaque combinaison active, fixez son stock individuel, son ajustement de prix (+/- CHF) et associez-y une image dédiée qui s'affichera lors de la sélection client.",
      "5. Validez pour enregistrer la matrice de variantes."
    ],
    tips: [
      "Dès qu'une variante est active, le client est obligé de choisir sa déclinaison avant d'ajouter au panier.",
      "Le stock global du produit prend le relais si aucune variante n'est configurée."
    ]
  },
  {
    category: "Thèmes & Vitrine",
    featureName: "Studio des Thèmes Shopify Premium & Formules d'abonnement",
    locationInApp: "Onglet « Thèmes & Vitrine » > Sous-onglet « Thèmes & Formules »",
    summary: "Sélection d'un univers visuel haute conversion débloqué selon la formule SaaS (Free, Basic, Pro, VIP).",
    steps: [
      "1. Rendez-vous dans l'onglet « Thèmes & Vitrine » de votre panneau d'administration.",
      "2. Filtrez les thèmes disponibles par formule (Inclus Free, Basic, PRO, VIP).",
      "3. Cliquez sur un thème pour voir sa palette, ses polices recommandées et ses points forts.",
      "4. Cliquez sur « Aperçu » pour tester son rendu visuel sans impacter vos données réelles.",
      "5. Pour installer le thème, cliquez sur « Choisir ce thème », confirmez le nom de votre boutique et validez.",
      "6. Vos produits, vos stocks et vos commandes sont conservés intacts, seuls les styles et la disposition d'accueil s'adaptent."
    ],
    tips: [
      "Chaque thème est conçu pour un positionnement précis (Artisanat Luxe, Streetwear énergique, Cosmétique naturel, Tech & Gadgets).",
      "Pour débloquer les thèmes VIP ou PRO, une demande d'upgrade en 1 clic peut être transmise à MAZIGHO Studio."
    ]
  },
  {
    category: "Thèmes & Vitrine",
    featureName: "Personnalisation de l'accueil par Glisser-Déposer & Aperçu Multi-Écrans",
    locationInApp: "Onglet « Thèmes & Vitrine » > Sous-onglets « Glisser-Déposer » et « Aperçu Multi-Écrans »",
    summary: "Réorganisation intuitive des sections de la page d'accueil, activation/désactivation des blocs et contrôle du rendu responsive.",
    steps: [
      "1. Cliquez sur le sous-onglet « Glisser-Déposer » du Studio Thèmes.",
      "2. Attrapez une section par sa poignée (icône de glissement) et déposez-la plus haut ou plus bas.",
      "3. Activez ou masquez les sections grâce à l'icône de l'œil (Hero, Ventes flash, Collections, Recommandations, Réassurance, Avis clients, WhatsApp chat).",
      "4. Cliquez sur « Enregistrer l'agencement » pour appliquer à la vitrine publique.",
      "5. Basculez sur le sous-onglet « Aperçu Multi-Écrans » pour vérifier le rendu en temps réel en mode Bureau (1440px), Tablette (768px) et Mobile (375px)."
    ],
    tips: [
      "Placez la barre d'urgence (Vente Flash ou Annonce) tout en haut pour maximiser le taux de clic.",
      "Le simulateur mobile permet de vérifier la lisibilité des boutons d'ajout au panier sur smartphone."
    ]
  },
  {
    category: "Thèmes & Vitrine",
    featureName: "Bannières & Carrousel de tête par Glisser-Déposer",
    locationInApp: "Onglet « Thèmes & Vitrine » > Section « Carrousel principal »",
    summary: "Création et modification des diapositives d'accueil avec support d'images en glisser-déposer ou vidéos MP4.",
    steps: [
      "1. Cliquez sur « Ajouter une diapositive » dans le module Carrousel.",
      "2. Saisissez le titre accrocheur et le texte secondaire.",
      "3. Glissez-déposez votre image directement dans la zone de dépôt dédiée (ou collez un lien vidéo .mp4).",
      "4. Définissez le lien du bouton (ex. `/boutique`, `/categorie/nouveautes`).",
      "5. Choisissez l'ordre d'affichage (0, 1, 2...) et activez la visibilité.",
      "6. Cliquez sur « Enregistrer la diapositive »."
    ],
    tips: [
      "Pour un résultat optimal, utilisez des bannières panoramiques en 16:9 ou 16:8 (ex. 1920x800px).",
      "Les vidéos MP4 se lancent automatiquement en sourdine pour garantir une expérience fluide."
    ]
  },
  {
    category: "Expéditions & Livraisons",
    featureName: "Livraison Algérie · 58 Wilayas & Paiement à la livraison (COD)",
    locationInApp: "Onglet « Paramètres » > Section « Livraison Algérie » ou « Expéditions »",
    summary: "Paramétrage des frais d'expédition pour les 58 wilayas d'Algérie avec distinction bureau (stop-desk) ou domicile, et encaissement en espèces à la livraison.",
    steps: [
      "1. Accédez aux réglages de livraison dans les paramètres de la boutique.",
      "2. Activez le module « Algérie & Wilayas ».",
      "3. Ajustez les tarifs par défaut : tarif Stop-Desk (bureau de livraison/agence) et tarif Domicile.",
      "4. Vous pouvez personnaliser le tarif pour des wilayas spécifiques (ex. Alger, Oran, Constantine, wilayas du Sud).",
      "5. Activez l'option « Paiement à la livraison (Cash on Delivery - COD) » pour permettre à vos clients de régler en dinars (DZD) à la réception du colis.",
      "6. Enregistrez les profils de livraison."
    ],
    tips: [
      "Le paiement à la livraison (COD) représente plus de 80% des conversions e-commerce en Algérie : il est indispensable pour maximiser vos ventes.",
      "Lorsqu'une commande COD arrive, un bouton d'appel direct ou WhatsApp permet de confirmer la commande avec le client avant envoi."
    ]
  },
  {
    category: "Paiements & Facturation",
    featureName: "Paiements par Carte Bancaire (Stripe Connect)",
    locationInApp: "Onglet « Paramètres » > Section « Stripe Connect »",
    summary: "Connexion sécurisée à Stripe pour accepter les paiements par carte bancaire (Visa, Mastercard, Apple Pay, Google Pay).",
    steps: [
      "1. Rendez-vous dans la section « Stripe Connect » des paramètres.",
      "2. Cliquez sur « Connecter mon compte Stripe ».",
      "3. Remplissez les informations de votre entreprise sur l'interface sécurisée Stripe.",
      "4. Une fois le compte vérifié, le statut passe automatiquement à « Connecté ».",
      "5. Les paiements de vos clients sont versés directement sur votre compte bancaire sans intermédiaire."
    ],
    tips: [
      "Compatible avec toutes les devises configurées dans la boutique (CHF, EUR, USD).",
      "Mode test / Bac à sable disponible pour simuler des paiements avant le lancement officiel."
    ]
  },
  {
    category: "Paiements & Facturation",
    featureName: "QR-Facture Suisse (Swiss QR-Bill)",
    locationInApp: "Onglet « Paramètres » > Section « QR-Facture Suisse »",
    summary: "Génération de factures officielles suisses conformes aux normes SIX avec QR-code de paiement, IBAN suisse et référence BVR.",
    steps: [
      "1. Accédez aux paramètres « QR-Facture Suisse ».",
      "2. Renseignez votre numéro IBAN suisse officiel (CH...) et le nom légal du créancier.",
      "3. Choisissez le type de référence (QR-Reference BVR ou sans référence / SCOR).",
      "4. Activez la génération automatique de la QR-Facture pour les commandes en CHF.",
      "5. Les clients reçoivent la QR-Facture PDF directement avec leur confirmation de commande pour payer via leur application bancaire (UBS, PostFinance, BCV, Raiffeisen, etc.)."
    ],
    tips: [
      "Idéal pour le marché suisse B2C et B2B privilégiant le virement bancaire sécurisé sans frais de carte.",
      "Le bon de paiement détachable est parfaitement aux dimensions normalisées SIX."
    ]
  },
  {
    category: "Marketing & Conversion",
    featureName: "Applications de Vente Shopify-Style (Ventes Flash, Bundles, Slide-out Cart)",
    locationInApp: "Onglet « Marketing & Apps » ou modules dédiés",
    summary: "Activation des leviers psychologiques de vente : urgence, réduction groupée, réassurance et panier tiroir.",
    steps: [
      "1. Ventes Flash : créez une campagne flash avec date/heure de fin, pourcentage de remise et badge d'urgence.",
      "2. Bundles Produits : configurez une offre « Achetez 2, obtenez 10% » ou « Fréquemment achetés ensemble » pour augmenter le panier moyen.",
      "3. Panier Tiroir (Slide-out Cart) : activez l'ouverture latérale instantanée au clic sur « Ajouter au panier », avec jauge de livraison offerte restante.",
      "4. Alertes Stock : activez les alertes « Plus que 3 exemplaires disponibles » pour déclencher l'action d'achat.",
      "5. Chat WhatsApp : renseignez votre numéro WhatsApp pour afficher la bulle flottante de discussion en direct."
    ],
    tips: [
      "Une jauge de livraison gratuite dynamique (ex. « Plus que 15 CHF pour la livraison offerte ! ») augmente le panier moyen de 20 à 30%.",
      "Les popups d'achats récents (preuve sociale) rassurent les nouveaux visiteurs sur la popularité de votre boutique."
    ]
  },
  {
    category: "Nom de Domaine & Mise en Ligne",
    featureName: "Connexion d'un Nom de Domaine Personnalisé",
    locationInApp: "Onglet « Paramètres » > Section « Domaine & Hébergement »",
    summary: "Liaison d'un domaine propre (ex. maboutique.ch ou maboutique.com) avec certificat SSL HTTPS automatique.",
    steps: [
      "1. Achetez votre nom de domaine chez votre registrar (ex. Infomaniak, OVH, GoDaddy, Namecheap).",
      "2. Dans MAZIGHO, saisissez votre nom de domaine dans la section « Nom de domaine personnalisé ».",
      "3. Rendez-vous sur la zone DNS de votre registrar et ajoutez les enregistrements indiqués (CNAME ou enregistrement A).",
      "4. Cliquez sur « Vérifier la configuration DNS » dans votre panneau MAZIGHO.",
      "5. Dès la propagation DNS (10 min à 24h), le certificat SSL HTTPS est automatiquement déployé."
    ],
    tips: [
      "Le domaine de test gratuit `maboutique.mazigho.store` reste toujours accessible pendant la transition."
    ]
  }
];

/**
 * Construit un prompt système exhaustif et structuré pour le Copilote IA.
 */
export function buildStoreAssistantSystemPrompt(options: {
  storeName: string;
  isStudioAdmin?: boolean;
  storeContextJson?: string;
  documentContext?: string;
}): string {
  const { storeName, isStudioAdmin, storeContextJson, documentContext } = options;

  const roleIntroduction = isStudioAdmin
    ? [
        "Tu es le Copilote Opérateur & Expert Technique de MAZIGHO Studio.",
        "Tu assistes l'opérateur de la console d'administration MAZIGHO Studio dans la supervision, le diagnostic, l'assistance aux marchands et les réglages de la plateforme.",
        "Tu maîtrises à la fois la gestion des boutiques marchandes et les outils studio (revue manuelle, déblocage de thèmes selon abonnement, diagnostics DNS, gestion des quotas).",
      ]
    : [
        `Tu es le Copilote Expert E-Commerce et Conseiller Opérateur de la boutique « ${storeName} » sur MAZIGHO (plateforme e-commerce haute conversion style Shopify Premium).`,
        "Ton rôle est d'orienter le commerçant, de répondre à toutes ses questions, de résoudre ses blocages et de lui expliquer pas-à-pas exactement QUOI FAIRE pour chaque fonctionnalité et paramètre de sa boutique.",
      ];

  const guideSummary = STORE_FEATURES_GUIDE.map(guide => {
    return `### ${guide.featureName} (${guide.category})
- Emplacement dans l'application : ${guide.locationInApp}
- Rôle : ${guide.summary}
- Procédure détaillée :
${guide.steps.join("\n")}
- Astuces & Bonnes pratiques :
${guide.tips.map(t => `  * ${t}`).join("\n")}`;
  }).join("\n\n");

  const behavioralInstructions = [
    "DIRECTIVES DE RÉPONSE OBLIGATOIRES :",
    "1. STRUCTURE ET CLARTÉ : Réponds en français de façon chaleureuse, professionnelle, précise et structurée (utilise des titres, des étapes numérotées 1, 2, 3... et des puces).",
    "2. ORIENTATION EXACTE : Indique toujours précisément à l'utilisateur OÙ CLIQUER dans son tableau de bord (nom de l'onglet, du sous-onglet, et intitulé du bouton).",
    "3. EXPLICATION DU « QUOI FAIRE » ET DU « COMMENT » : Détaille la raison d'être de chaque étape pour que l'opérateur comprenne le bénéfice commercial (taux de conversion, panier moyen, confiance client).",
    "4. RÉSOLUTION DE PROBLÈMES : Si l'utilisateur exprime un blocage ou une incompréhension (ex. images, livraisons, devises, paiement), donne-lui immédiatement la solution pas-à-pas et les vérifications à effectuer.",
    "5. DRAG & DROP D'IMAGES : Rappelle qu'il peut faire glisser des images directement depuis son bureau d'ordinateur ou son explorateur de fichiers, réordonner les vignettes par glisser-déposer, et que la première image devient la couverture du produit.",
    "6. THÈMES & VITRINE : Rappelle que le Studio des Thèmes permet de réorganiser les sections de l'accueil par glisser-déposer, de tester en simulation multi-écrans (bureau, tablette, mobile) et que les thèmes premium sont attribués selon la formule d'abonnement sans impacter les données du catalogue.",
    "7. SÉCURITÉ & LIMITES : Ne donne pas de faux conseils fiscaux ou juridiques stricts. Ne prétends pas avoir exécuté une action à la place de l'utilisateur.",
  ];

  return [
    ...roleIntroduction,
    "",
    ...behavioralInstructions,
    "",
    "--- BASE DE CONNAISSANCES OPÉRATIONNELLE DE LA BOUTIQUE & DE LA PLATEFORME ---",
    guideSummary,
    "",
    storeContextJson ? `--- CONTEXTE SPÉCIFIQUE DE LA BOUTIQUE COURANTE ---\n${storeContextJson}` : "",
    documentContext ? `--- DOCUMENTS PRIVÉS & BASE DOCUMENTAIRE DU MARCHAND ---\n${documentContext}` : "",
  ].filter(Boolean).join("\n");
}
