import { type ReactNode, createContext, useState } from 'react';

import { NoteContextType, NoteTextNames, SupportedLanguages } from './types';

export const NoteContext = createContext<NoteContextType>({
  selectedLanguage: SupportedLanguages.EN,
  startTime: null,
  endTime: null,
  [NoteTextNames.NOTE]: '',
  [NoteTextNames.SOAP]: '',
  [NoteTextNames.HANDOUT]: '',
  updateStartTime: () => {},
  updateEndTime: () => {},
  updateSelectedLanguage: () => {},
  updateNoteText: () => {},
  addNoteText: () => {},
  updateSoapText: () => {},
  updateHandoutText: () => {},
  clearAllText: () => {},
});

export default function NoteContextProvider({
  children,
  defaultLanguage,
}: {
  children: ReactNode;
  defaultLanguage: string;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages>(() => {
    const defaultLangSupported = Object.values(SupportedLanguages).find((lang) => {
      if (defaultLanguage === lang) {
        return lang;
      }
    });
    const initialLang = defaultLangSupported ? defaultLangSupported : SupportedLanguages.EN;
    return initialLang;
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [noteText, setNoteText] = useState('');
  const [soapText, setSoapText] = useState('');
  const [handoutText, setHandoutText] = useState('');

  const updateSelectedLangauge = (newLanguage: SupportedLanguages) => {
    setSelectedLanguage(() => newLanguage);
  };

  const updateStartTime = (newDate: Date) => {
    setStartTime(() => newDate);
  };

  const updateEndTime = (newDate: Date) => {
    setEndTime(() => newDate);
  };

  const updateNoteText = (newNoteText: string) => {
    setNoteText(() => newNoteText);
  };

  const addNoteText = (newNoteText: string) => {
    setNoteText((oldText) => {
      return oldText + newNoteText;
    });
  };

  const updateSoapText = (newSoapText: string) => {
    setSoapText(() => newSoapText);
  };

  const updateHandoutText = (newHandoutText: string) => {
    setHandoutText(() => newHandoutText);
  };

  const clearAllText = () => {
    setNoteText('');
    setSoapText('');
    setHandoutText('');
  };

  const noteCtx = {
    selectedLanguage: selectedLanguage,
    startTime,
    endTime,
    [NoteTextNames.NOTE]: noteText,
    [NoteTextNames.SOAP]: soapText,
    [NoteTextNames.HANDOUT]: handoutText,
    updateSelectedLanguage: updateSelectedLangauge,
    updateStartTime: updateStartTime,
    updateEndTime: updateEndTime,
    updateNoteText: updateNoteText,
    addNoteText: addNoteText,
    updateSoapText: updateSoapText,
    updateHandoutText: updateHandoutText,
    clearAllText: clearAllText,
  };

  return <NoteContext.Provider value={noteCtx}>{children}</NoteContext.Provider>;
}
