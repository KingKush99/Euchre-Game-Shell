// Permanent asset storage in localStorage for custom card decks, card backs, and table themes

const CARD_BACK_KEY = 'euchre_custom_card_back_v1';
const CARD_FRONT_KEY = 'euchre_custom_card_front_v1';
const TABLE_THEME_KEY = 'euchre_custom_table_theme_v1';

export interface CustomAssetsState {
  cardBackUrl: string | null;
  cardFrontUrl: string | null;
  tableThemeUrl: string | null;
}

export function getCustomAssets(): CustomAssetsState {
  try {
    return {
      cardBackUrl: localStorage.getItem(CARD_BACK_KEY),
      cardFrontUrl: localStorage.getItem(CARD_FRONT_KEY),
      tableThemeUrl: localStorage.getItem(TABLE_THEME_KEY),
    };
  } catch (err) {
    console.warn('Failed to read custom assets from localStorage:', err);
    return { cardBackUrl: null, cardFrontUrl: null, tableThemeUrl: null };
  }
}

export function saveCustomCardBack(dataUrl: string): boolean {
  try {
    localStorage.setItem(CARD_BACK_KEY, dataUrl);
    window.dispatchEvent(new Event('euchre-custom-assets-changed'));
    return true;
  } catch (err) {
    console.error('Failed to save custom card back:', err);
    return false;
  }
}

export function saveCustomCardFront(dataUrl: string): boolean {
  try {
    localStorage.setItem(CARD_FRONT_KEY, dataUrl);
    window.dispatchEvent(new Event('euchre-custom-assets-changed'));
    return true;
  } catch (err) {
    console.error('Failed to save custom card front:', err);
    return false;
  }
}

export function saveCustomTableTheme(dataUrl: string): boolean {
  try {
    localStorage.setItem(TABLE_THEME_KEY, dataUrl);
    window.dispatchEvent(new Event('euchre-custom-assets-changed'));
    return true;
  } catch (err) {
    console.error('Failed to save custom table theme:', err);
    return false;
  }
}

export function clearCustomAsset(type: 'cardBack' | 'cardFront' | 'tableTheme'): void {
  try {
    if (type === 'cardBack') localStorage.removeItem(CARD_BACK_KEY);
    if (type === 'cardFront') localStorage.removeItem(CARD_FRONT_KEY);
    if (type === 'tableTheme') localStorage.removeItem(TABLE_THEME_KEY);
    window.dispatchEvent(new Event('euchre-custom-assets-changed'));
  } catch (err) {
    console.warn('Failed to clear custom asset:', err);
  }
}
