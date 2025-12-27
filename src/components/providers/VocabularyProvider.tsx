"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface VocabularyContextType {
  savedWords: Set<string>;
  saveWord: (word: string) => void;
  removeWord: (word: string) => void;
  isSaved: (word: string) => boolean;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(
  undefined
);

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [savedWords, setSavedWords] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_vocabulary");
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load vocabulary", e);
        }
      }
    }
    return new Set();
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(
      "saved_vocabulary",
      JSON.stringify(Array.from(savedWords))
    );
  }, [savedWords]);

  const saveWord = (word: string) => {
    setSavedWords((prev) => {
      const next = new Set(prev);
      next.add(word);
      return next;
    });
  };

  const removeWord = (word: string) => {
    setSavedWords((prev) => {
      const next = new Set(prev);
      next.delete(word);
      return next;
    });
  };

  const isSaved = (word: string) => savedWords.has(word);

  return (
    <VocabularyContext.Provider
      value={{ savedWords, saveWord, removeWord, isSaved }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error("useVocabulary must be used within a VocabularyProvider");
  }
  return context;
}
