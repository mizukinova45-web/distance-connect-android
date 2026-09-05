import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "fr" | "en";

const translations = {
  fr: {
    // Nav
    discover: "Découvrir",
    chat: "Messages",
    games: "Jeux",
    favourites: "Favoris",
    profile: "Profil",
    // Discover
    appTitle: "GlowUp",
    yourPartner: "Ton partenaire",
    connectedWithLove: "Connecté avec amour",
    quickActions: "Actions rapides",
    sendMessage: "Envoyer un message",
    sendMessageDesc: "Dis quelque chose de doux",
    playAGame: "Jouer à un jeu",
    playAGameDesc: "Défie ton partenaire",
    favouritesDesc: "Moments sauvegardés",
    // Chat
    sayHello: "Dis bonjour à ton partenaire",
    startConversation: "Commence une conversation",
    typeMessage: "Écris un message...",
    online: "En ligne",
    uploading: "Envoi en cours...",
    // Games
    gamesTitle: "Jeux",
    playTogether: "Jouer ensemble avec",
    activeGames: "Jeux actifs",
    yourTurn: "Ton tour",
    partnersTurn: "le tour de",
    startNewGame: "Commencer un nouveau jeu",
    all: "Tous",
    classic: "Classique",
    couple: "Couple",
    puzzle: "Puzzle",
    completed: "Terminés",
    youWon: "Tu as gagné",
    partnerWon: "a gagné",
    draw: "Match nul",
    noGames: "Aucun jeu. Choisis un jeu ci-dessus !",
    play: "Jouer",
    creating: "Création...",
    // Settings
    settings: "Paramètres",
    language: "Langue",
    languageDesc: "Choisis la langue de l'application",
    notifications: "Notifications",
    notificationsDesc: "Reçois des alertes pour les nouveaux messages",
    darkMode: "Mode sombre",
    darkModeDesc: "Change l'apparence de l'application",
    soundEffects: "Sons",
    soundEffectsDesc: "Active les sons des notifications",
    privacy: "Confidentialité",
    privacyDesc: "Gère tes paramètres de confidentialité",
    about: "À propos",
    aboutDesc: "Version et informations de l'application",
    termsAndConditions: "Conditions d'utilisation",
    privacyPolicy: "Politique de confidentialité",
    aboutUs: "À propos de nous",
    logout: "Déconnexion",
    personalDetail: "Détails personnels",
    version: "Version",
    // Profile
    profileTitle: "Profil",
    momentsSaved: "Moments sauvegardés",
    noFavourites: "Aucun favori pour le moment",
    noFavouritesDesc: "Sauvegarde tes messages et moments préférés ici",
    // Auth
    connectWithPartner: "Connecte-toi avec ton partenaire",
    authDesc: "L'un crée un code. L'autre l'entre pour se connecter.",
    createPairingCode: "Créer un code de connexion",
    enterPairingCode: "Entrer un code de connexion",
    enterCode: "Entrer le code",
    askPartnerForCode: "Demande le code à ton partenaire",
    connect: "Connecter",
    back: "Retour",
    waitingForPartner: "En attente de ton partenaire",
    shareCode: "Partage ce code avec ton partenaire",
    yourPairingCode: "Ton code de connexion",
    copyCode: "Copier le code",
    copied: "Copié !",
    pairingInfo: "Une fois que ton partenaire entre ce code, le chat commencera automatiquement.",
    signIn: "Se connecter",
    // Landing
    heroTagline: "Application pour couples à distance",
    heroTitle1: "Même loin,",
    heroTitle2: "toujours ensemble.",
    heroDesc: "Un espace privé pour vous deux. Envoyez des messages, partagez vos plus beaux souvenirs et restez connectés, peu importe la distance.",
    heroCTA: "Créer notre espace",
    heroSecondary: "Découvrir",
    heroTrust: "couples déjà connectés",
    notifTitle: "Nouveau message !",
    notifDesc: "Ton partenaire pense à toi ❤️",
    featuresTagline: "Tout ce dont vous avez besoin",
    featuresTitle: "Restez proches, malgré la distance",
    featMessages: "Messages privés",
    featMessagesDesc: "Échangez des messages, photos et vidéos dans votre espace privé.",
    featPhotos: "Photos partagées",
    featPhotosDesc: "Capturez et partagez vos plus beaux moments en photo.",
    featVideos: "Vidéos souvenir",
    featVideosDesc: "Enregistrez et visionnez vos vidéos ensemble.",
    featGames: "Jeux de couple",
    featGamesDesc: "Jouez ensemble : échecs, tic-tac-toe, et bien plus.",
    featPrivate: "Espace sécurisé",
    featPrivateDesc: "Vos données sont privées et protégées. Juste vous deux.",
    featMemories: "Souvenirs",
    featMemoriesDesc: "Créez une galerie de vos plus beaux souvenirs partagés.",
    galleryTagline: "Votre histoire",
    galleryTitle: "Un album de vos meilleurs moments",
    galleryDesc: "Ajoutez photos et vidéos pour créer votre galerie de souvenirs en couple.",
    howTagline: "Comment ça marche",
    step1Title: "Créez votre compte",
    step1Desc: "Inscrivez-vous en quelques secondes.",
    step2Title: "Connectez-vous",
    step2Desc: "Partagez un code pour vous connecter à votre partenaire.",
    step3Title: "Partagez votre vie",
    step3Desc: "Discutez, jouez et créez des souvenirs ensemble.",
    ctaTitle: "Prêt à créer votre espace ?",
    ctaDesc: "Rejoignez des milliers de couples qui restent proches, un message à la fois.",
    ctaButton: "Commencer — c'est gratuit",
    // Memories
    memories: "Souvenirs",
    memoriesTitle: "Nos souvenirs",
    memoriesSubtitle: "Moments partagés en couple",
    memoriesEmpty: "Votre histoire commence ici.",
    memoriesEmptyDesc: "Ajoutez votre premier souvenir pour commencer votre galerie ❤️",
    addMemory: "Ajouter un souvenir",
    totalMemories: "Total",
    photos: "Photos",
    videos: "Vidéos",
    memoryCaptionPlaceholder: "Ajouter un titre (optionnel)...",
    saveMemory: "Sauvegarder",
    deleteMemoryTitle: "Supprimer ce souvenir ?",
    deleteMemoryDesc: "Cette action est irréversible.",
    cancel: "Annuler",
    delete: "Supprimer",
  },
  en: {
    // Nav
    discover: "Discover",
    chat: "Chat",
    games: "Games",
    favourites: "Favourites",
    profile: "Profile",
    // Discover
    appTitle: "GlowUp",
    yourPartner: "Your Partner",
    connectedWithLove: "Connected with love",
    quickActions: "Quick actions",
    sendMessage: "Send a message",
    sendMessageDesc: "Say something sweet",
    playAGame: "Play a game",
    playAGameDesc: "Challenge your partner",
    favouritesDesc: "Saved moments",
    // Chat
    sayHello: "Say hello to your partner",
    startConversation: "Start a conversation",
    typeMessage: "Type a message...",
    online: "Online",
    uploading: "Uploading...",
    // Games
    gamesTitle: "Games",
    playTogether: "Play together with",
    activeGames: "Active games",
    yourTurn: "Your turn",
    partnersTurn: "'s turn",
    startNewGame: "Start a new game",
    all: "All",
    classic: "Classic",
    couple: "Couple",
    puzzle: "Puzzle",
    completed: "Completed",
    youWon: "You won",
    partnerWon: "won",
    draw: "Draw",
    noGames: "No games yet. Choose a game above to start!",
    play: "Play",
    creating: "Creating...",
    // Settings
    settings: "Settings",
    language: "Language",
    languageDesc: "Choose the app language",
    notifications: "Notifications",
    notificationsDesc: "Get alerts for new messages",
    darkMode: "Dark Mode",
    darkModeDesc: "Change the app appearance",
    soundEffects: "Sounds",
    soundEffectsDesc: "Enable notification sounds",
    privacy: "Privacy",
    privacyDesc: "Manage your privacy settings",
    about: "About",
    aboutDesc: "App version and information",
    termsAndConditions: "Terms & Conditions",
    privacyPolicy: "Privacy Policy",
    aboutUs: "About Us",
    logout: "Logout",
    personalDetail: "Personal Detail",
    version: "Version",
    // Profile
    profileTitle: "Profile",
    momentsSaved: "Moments saved",
    noFavourites: "No favourites yet",
    noFavouritesDesc: "Save your favourite messages and moments here",
    // Auth
    connectWithPartner: "Connect with your partner",
    authDesc: "One of you creates a code. The other enters it to pair up.",
    createPairingCode: "Create a pairing code",
    enterPairingCode: "Enter a pairing code",
    enterCode: "Enter code",
    askPartnerForCode: "Ask your partner for their code",
    connect: "Connect",
    back: "Back",
    waitingForPartner: "Waiting for your partner",
    shareCode: "Share this code with your partner",
    yourPairingCode: "Your pairing code",
    copyCode: "Copy code",
    copied: "Copied!",
    pairingInfo: "Once your partner enters this code, your chat will begin automatically.",
    signIn: "Sign in",
    // Landing
    heroTagline: "App for long-distance couples",
    heroTitle1: "Always close,",
    heroTitle2: "always together.",
    heroDesc: "A private space for you two. Send messages, share your favorite memories, and stay connected no matter the distance.",
    heroCTA: "Create our space",
    heroSecondary: "Discover",
    heroTrust: "couples already connected",
    notifTitle: "New message!",
    notifDesc: "Your partner is thinking of you ❤️",
    featuresTagline: "Everything you need",
    featuresTitle: "Stay close, no matter the distance",
    featMessages: "Private Messages",
    featMessagesDesc: "Exchange messages, photos, and videos in your private space.",
    featPhotos: "Shared Photos",
    featPhotosDesc: "Capture and share your most beautiful moments in photos.",
    featVideos: "Video Memories",
    featVideosDesc: "Record and watch your videos together.",
    featGames: "Couple Games",
    featGamesDesc: "Play together: chess, tic-tac-toe, and more.",
    featPrivate: "Secure Space",
    featPrivateDesc: "Your data is private and protected. Just the two of you.",
    featMemories: "Memories",
    featMemoriesDesc: "Create a gallery of your most beautiful shared memories.",
    galleryTagline: "Your story",
    galleryTitle: "An album of your best moments",
    galleryDesc: "Add photos and videos to create your couple's memory gallery.",
    howTagline: "How it works",
    step1Title: "Create your account",
    step1Desc: "Sign up in just a few seconds.",
    step2Title: "Connect",
    step2Desc: "Share a code to connect with your partner.",
    step3Title: "Share your life",
    step3Desc: "Chat, play, and create memories together.",
    ctaTitle: "Ready to create your space?",
    ctaDesc: "Join thousands of couples staying close, one message at a time.",
    ctaButton: "Get started — it's free",
    // Memories
    memories: "Memories",
    memoriesTitle: "Our Memories",
    memoriesSubtitle: "Shared moments as a couple",
    memoriesEmpty: "Your story starts here.",
    memoriesEmptyDesc: "Add your first memory to start your gallery ❤️",
    addMemory: "Add a memory",
    totalMemories: "Total",
    photos: "Photos",
    videos: "Videos",
    memoryCaptionPlaceholder: "Add a title (optional)...",
    saveMemory: "Save",
    deleteMemoryTitle: "Delete this memory?",
    deleteMemoryDesc: "This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
  },
} as const;

type TranslationKey = keyof typeof translations.fr;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem("glowup-lang") as Language) || "fr";
    } catch {
      return "fr";
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("glowup-lang", lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if used outside provider (shouldn't happen)
    return {
      language: "fr" as Language,
      setLanguage: () => {},
      t: (key: TranslationKey) => translations.fr[key] || key,
    };
  }
  return ctx;
}
