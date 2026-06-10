import { lazy } from "react";
import type { LazyExoticComponent, ReactElement } from "react";

type ToolComponent = LazyExoticComponent<() => ReactElement>;

const toolComponentMap: Record<string, ToolComponent> = {
  "language/synonym-finder": lazy(() => import("@/tools/language/SynonymFinder")),
  "language/antonym-finder": lazy(() => import("@/tools/language/AntonymFinder")),
  "language/rhyme-finder": lazy(() => import("@/tools/language/RhymeFinder")),
  "language/anagram-solver": lazy(() => import("@/tools/language/AnagramSolver")),
  "language/word-association-finder": lazy(() => import("@/tools/language/WordAssociationFinder")),
  "language/collocation-finder": lazy(() => import("@/tools/language/CollocationFinder")),
  "language/phrasal-verb-finder": lazy(() => import("@/tools/language/PhrasalVerbFinder")),
  "language/idiom-explainer": lazy(() => import("@/tools/language/IdiomExplainer")),
  "language/cefr-level-estimator": lazy(() => import("@/tools/language/CefrLevelEstimator")),
  "language/vocabulary-dna-engine": lazy(() => import("@/tools/language/VocabularyDnaEngine")),
  "language/word-unscrambler": lazy(() => import("@/tools/language/WordUnscrambler")),
  "language/word-finder": lazy(() => import("@/tools/language/WordFinder")),
  "language/scrabble-word-checker": lazy(() => import("@/tools/language/ScrabbleWordChecker")),
  "language/hangman-solver": lazy(() => import("@/tools/language/HangmanSolver")),
  "language/word-root-analyzer": lazy(() => import("@/tools/language/WordRootAnalyzer")),
  "language/irregular-verb-finder": lazy(() => import("@/tools/language/IrregularVerbFinder")),
  "language/word-family-explorer": lazy(() => import("@/tools/language/WordFamilyExplorer")),
  "language/homophone-finder": lazy(() => import("@/tools/language/HomophoneFinder")),
  "language/ielts-vocabulary-analyzer": lazy(() => import("@/tools/language/IeltsVocabularyAnalyzer")),
  "language/toeic-score-estimator": lazy(() => import("@/tools/language/ToeicScoreEstimator")),
};

export default function LanguageToolLoader({ toolKey }: { toolKey: string }) {
  const ToolComponent = toolComponentMap[toolKey];
  if (!ToolComponent) return null;
  return <ToolComponent />;
}
