/**
 * Assembled translation bundles for all supported locales.
 *
 * Separated from index.ts and config.ts to avoid circular dependencies:
 *   config.ts ← translations.ts → individual TS modules
 *   index.ts re-exports from translations.ts
 */
import { commonEnUS, commonIdID, commonArSA } from './common';
import { stageEnUS, stageIdID, stageArSA } from './stage';
import { chatEnUS, chatIdID, chatArSA } from './chat';
import { generationEnUS, generationIdID, generationArSA } from './generation';
import { settingsEnUS, settingsIdID, settingsArSA } from './settings';

export const translations = {
  'id-ID': {
    ...commonIdID,
    ...stageIdID,
    ...chatIdID,
    ...generationIdID,
    ...settingsIdID,
  },
  'en-US': {
    ...commonEnUS,
    ...stageEnUS,
    ...chatEnUS,
    ...generationEnUS,
    ...settingsEnUS,
  },
  'ar-SA': {
    ...commonArSA,
    ...stageArSA,
    ...chatArSA,
    ...generationArSA,
    ...settingsArSA,
  },
} as const;
