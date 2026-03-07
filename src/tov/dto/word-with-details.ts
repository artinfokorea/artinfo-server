export interface ExampleSentenceDetail {
  sentenceWithBlank: string;
  blankAnswer: string;
}

export interface WordWithDetails {
  masterWordId: string;
  englishWord: string;
  meanings: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentences: ExampleSentenceDetail[];
}
