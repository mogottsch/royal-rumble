import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "de";

type TranslationValue = string | ((params: Record<string, string | number>) => string);

type TranslationDict = Record<string, TranslationValue>;

type I18nContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LANGUAGE_STORAGE_KEY = "language";

const translations: Record<Language, TranslationDict> = {
  en: {
    "common.language": "Language",
    "common.english": "English",
    "common.german": "German",
    "common.back": "Back",
    "common.cancel": "Cancel",
    "common.add": "Add",
    "common.confirm": "Confirm",
    "common.later": "Later",
    "common.loading": "Loading...",
    "common.switch": "Switch",
    "landing.ariaEdition": ({ currentYear, establishedYear }) => `${currentYear} edition, established ${establishedYear}`,
    "landing.edition": "Edition",
    "landing.established": ({ year }) => `Est. ${year}`,
    "landing.lobbyCode": "Lobby code",
    "landing.join": "Join",
    "landing.create": "Create",
    "landing.logoAlt": "Suff Royale",
    "createLobby.participantName": "Participant name",
    "createLobby.addParticipant": "Add participant",
    "createLobby.drinkRules": "Drink rules",
    "createLobby.sipsPerElimination": "Sips per elimination",
    "createLobby.shotsPerElimination": "Shots per elimination",
    "createLobby.sipsNpcElim": "Sips (NPC elim)",
    "createLobby.shotsNpcElim": "Shots (NPC elim)",
    "createLobby.continue": "Continue with entrance order",
    "createLobby.errorEmpty": "Participant name cannot be empty",
    "createLobby.errorDuplicate": "Participant name must be unique",
    "createLobby.errorMinParticipants": "Must have at least 2 participants",
    "createLobby.errorFailed": ({ statusText }) => `Failed to create lobby: ${statusText}`,
    "assignEntrance.errorIncomplete": "Not all participants have been assigned entrance numbers",
    "assignEntrance.start": "Start Royal Rumble",
    "assignEntrance.errorFailed": ({ statusText }) => `Failed to post entrance numbers: ${statusText}`,
    "viewGame.npc": "NPC",
    "viewGame.wrestlerAlt": "wrestler",
    "viewGame.nextEntrance": ({ number }) => `Next: #${number}`,
    "viewGame.nextEntranceButton": "Next entrance",
    "viewGame.nextEliminationButton": "Next elimination",
    "viewGame.pendingEntranceNumbers": "Wait while the host assigns entrance numbers",
    "viewGame.handOutDrinks": ({ count }) => `Hand out drinks (${count})`,
    "claimGate.title": "Who are you?",
    "claimGate.body": "Pick your name so the app knows whose drinks to track.",
    "bar.playingAs": ({ name }) => `Playing as ${name}`,
    "bar.copyUnsupported": "Your browser does not support copying to clipboard",
    "bar.copied": "Copied to clipboard",
    "history.none": "No actions yet",
    "history.entered": ({ name }) => `${name} entered`,
    "history.eliminated": ({ offenders, victims }) => `${offenders} eliminated ${victims}`,
    "history.and": " and ",
    "stats.title": "Drink stats",
    "stats.name": "Name",
    "stats.sipsIn": "Sips in",
    "stats.sipsOut": "Sips out",
    "stats.shotsIn": "Shots in",
    "stats.shotsOut": "Shots out",
    "stats.chugs": "Chugs",
    "pending.title": "Drinks to hand out",
    "pending.body": ({ count }) => `You still need to distribute drinks for ${count} elimination${count === 1 ? "" : "s"}.`,
    "pending.pool": ({ sips, shots }) => `Open pool: ${sips} sips${Number(shots) > 0 ? `, ${shots} shots` : ""}`,
    "pending.now": "Hand out now",
    "addEntrance.loading": "Loading...",
    "addEntrance.selectWrestler": "Please select a wrestler",
    "addEntrance.addedWrestler": ({ name }) => `Added ${name}`,
    "addEntrance.createOption": ({ name }) => `Add \"${name}\"`,
    "addEntrance.label": "Wrestler",
    "addEntrance.noResults": "No wrestlers found.",
    "addEntrance.submit": "Add entrance",
    "addEntrance.dialogTitle": "Add a new wrestler",
    "addEntrance.dialogLabel": "Name",
    "addEntrance.errorMissingId": "Wrestler id is undefined",
    "addElimination.offenders": "Who is/are the eliminator(s)?",
    "addElimination.victims": "Who is/are the victim(s)?",
    "addElimination.submit": "Add elimination",
    "addElimination.errorFailed": ({ statusText }) => `Failed to post entrance: ${statusText}`,
    "assignEntrance.errorFailedPrefix": "Failed to post entrance numbers",
    "addElimination.errorFailedPrefix": "Failed to post elimination",
    "distribute.failedPrefix": "Distribution failed",
    "distribute.loading": "Loading drink pools...",
    "distribute.none": "No pending drink distributions.",
    "distribute.aggregateTitle": "Distribute stacked drinks",
    "distribute.aggregateTotal": ({ sips, shots }) => `Total: ${sips} sips${Number(shots) > 0 ? ` and ${shots} shots` : ""}`,
    "distribute.aggregateElimination": ({ id, offender, victim }) => `Elim #${id}: ${offender} eliminated ${victim}`,
    "distribute.header": ({ offender, victim }) => `${offender} eliminated ${victim}`,
    "distribute.subheader": ({ sips, shots }) => `Distribute ${sips} sips${Number(shots) > 0 ? ` and ${shots} shots` : ""}`,
    "distribute.sips": ({ current, total }) => `Sips: ${current} / ${total}`,
    "distribute.shots": ({ current, total }) => `Shots: ${current} / ${total}`,
    "distribute.sipsShort": "Sips",
    "distribute.shotsShort": "Shots",
    "distribute.skip": "Skip for now",
    "distribute.failed": ({ text }) => `Distribution failed: ${text}`,
    "error.title": "Oops!",
    "error.body": "Sorry, an unexpected error has occurred.",
    "error.unknown": "Unknown error",
    "lobby.errorMissingCode": "No lobby code provided",
    "lobby.errorNotFound": "Lobby not found",
    "lobby.errorFetchFailed": "Failed to fetch lobby",
  },
  de: {
    "common.language": "Sprache",
    "common.english": "Englisch",
    "common.german": "Deutsch",
    "common.back": "Zurück",
    "common.cancel": "Abbrechen",
    "common.add": "Hinzufügen",
    "common.confirm": "Bestätigen",
    "common.later": "Später",
    "common.loading": "Lade...",
    "common.switch": "Wechseln",
    "landing.ariaEdition": ({ currentYear, establishedYear }) => `${currentYear} Edition, gegründet ${establishedYear}`,
    "landing.edition": "Edition",
    "landing.established": ({ year }) => `Seit ${year}`,
    "landing.lobbyCode": "Lobby-Code",
    "landing.join": "Beitreten",
    "landing.create": "Erstellen",
    "landing.logoAlt": "Suff Royale",
    "createLobby.participantName": "Teilnehmername",
    "createLobby.addParticipant": "Teilnehmer hinzufügen",
    "createLobby.drinkRules": "Trinkregeln",
    "createLobby.sipsPerElimination": "Schlücke pro Eliminierung",
    "createLobby.shotsPerElimination": "Shots pro Eliminierung",
    "createLobby.sipsNpcElim": "Schlücke (NPC-Elim.)",
    "createLobby.shotsNpcElim": "Shots (NPC-Elim.)",
    "createLobby.continue": "Weiter mit der Reihenfolge",
    "createLobby.errorEmpty": "Der Teilnehmername darf nicht leer sein",
    "createLobby.errorDuplicate": "Der Teilnehmername muss eindeutig sein",
    "createLobby.errorMinParticipants": "Mindestens 2 Teilnehmer sind erforderlich",
    "createLobby.errorFailed": ({ statusText }) => `Lobby konnte nicht erstellt werden: ${statusText}`,
    "assignEntrance.errorIncomplete": "Nicht allen Teilnehmern wurden Startnummern zugewiesen",
    "assignEntrance.start": "Royal Rumble starten",
    "assignEntrance.errorFailed": ({ statusText }) => `Startnummern konnten nicht gespeichert werden: ${statusText}`,
    "viewGame.npc": "NPC",
    "viewGame.wrestlerAlt": "Wrestler",
    "viewGame.nextEntrance": ({ number }) => `Als Nächstes: #${number}`,
    "viewGame.nextEntranceButton": "Nächster Wrestler",
    "viewGame.nextEliminationButton": "Nächste Eliminierung",
    "viewGame.pendingEntranceNumbers": "Warte, bis der Host die Startnummern zuweist",
    "viewGame.handOutDrinks": ({ count }) => `Drinks verteilen (${count})`,
    "claimGate.title": "Wer bist du?",
    "claimGate.body": "Wähle deinen Namen, damit die App weiß, wessen Drinks verfolgt werden sollen.",
    "bar.playingAs": ({ name }) => `Du spielst als ${name}`,
    "bar.copyUnsupported": "Dein Browser unterstützt das Kopieren in die Zwischenablage nicht",
    "bar.copied": "In die Zwischenablage kopiert",
    "history.none": "Noch keine Aktionen",
    "history.entered": ({ name }) => `${name} ist hereingekommen`,
    "history.eliminated": ({ offenders, victims }) => `${offenders} haben ${victims} eliminiert`,
    "history.and": " und ",
    "stats.title": "Trinkstatistik",
    "stats.name": "Name",
    "stats.sipsIn": "Schlücke getrunken",
    "stats.sipsOut": "Schlücke verteilt",
    "stats.shotsIn": "Shots getrunken",
    "stats.shotsOut": "Shots verteilt",
    "stats.chugs": "Exen",
    "pending.title": "Zu verteilende Drinks",
    "pending.body": ({ count }) => `Du musst noch Drinks für ${count} Eliminierung${count === 1 ? "" : "en"} verteilen.`,
    "pending.pool": ({ sips, shots }) => `Offen: ${sips} Schlücke${Number(shots) > 0 ? `, ${shots} Shots` : ""}`,
    "pending.now": "Jetzt verteilen",
    "addEntrance.loading": "Lade...",
    "addEntrance.selectWrestler": "Bitte wähle einen Wrestler aus",
    "addEntrance.addedWrestler": ({ name }) => `${name} hinzugefügt`,
    "addEntrance.createOption": ({ name }) => `\"${name}\" hinzufügen`,
    "addEntrance.label": "Wrestler",
    "addEntrance.noResults": "Keine Wrestler gefunden.",
    "addEntrance.submit": "Wrestler hinzufügen",
    "addEntrance.dialogTitle": "Neuen Wrestler hinzufügen",
    "addEntrance.dialogLabel": "Name",
    "addEntrance.errorMissingId": "Wrestler-ID ist nicht gesetzt",
    "addElimination.offenders": "Wer hat eliminiert?",
    "addElimination.victims": "Wer wurde eliminiert?",
    "addElimination.submit": "Eliminierung hinzufügen",
    "addElimination.errorFailed": ({ statusText }) => `Eliminierung konnte nicht gespeichert werden: ${statusText}`,
    "assignEntrance.errorFailedPrefix": "Startnummern konnten nicht gespeichert werden",
    "addElimination.errorFailedPrefix": "Eliminierung konnte nicht gespeichert werden",
    "distribute.failedPrefix": "Verteilung fehlgeschlagen",
    "distribute.loading": "Lade Drink-Verteilungen...",
    "distribute.none": "Keine offenen Drink-Verteilungen.",
    "distribute.aggregateTitle": "Gesammelte Drinks verteilen",
    "distribute.aggregateTotal": ({ sips, shots }) => `Gesamt: ${sips} Schlücke${Number(shots) > 0 ? ` und ${shots} Shots` : ""}`,
    "distribute.aggregateElimination": ({ id, offender, victim }) => `Elim. #${id}: ${offender} hat ${victim} eliminiert`,
    "distribute.header": ({ offender, victim }) => `${offender} hat ${victim} eliminiert`,
    "distribute.subheader": ({ sips, shots }) => `${sips} Schlücke${Number(shots) > 0 ? ` und ${shots} Shots` : ""} verteilen`,
    "distribute.sips": ({ current, total }) => `Schlücke: ${current} / ${total}`,
    "distribute.shots": ({ current, total }) => `Shots: ${current} / ${total}`,
    "distribute.sipsShort": "Schl.",
    "distribute.shotsShort": "Shots",
    "distribute.skip": "Später",
    "distribute.failed": ({ text }) => `Verteilung fehlgeschlagen: ${text}`,
    "error.title": "Hoppla!",
    "error.body": "Entschuldigung, ein unerwarteter Fehler ist aufgetreten.",
    "error.unknown": "Unbekannter Fehler",
    "lobby.errorMissingCode": "Kein Lobby-Code angegeben",
    "lobby.errorNotFound": "Lobby nicht gefunden",
    "lobby.errorFetchFailed": "Lobby konnte nicht geladen werden",
  },
};

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "en" || stored === "de") {
    return stored;
  }
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<I18nContextType>(() => {
    const t = (key: string, params: Record<string, string | number> = {}) => {
      const entry = translations[language][key] ?? translations.en[key] ?? key;
      if (typeof entry === "function") {
        return entry(params);
      }
      return entry;
    };

    return { language, setLanguage, t };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
