

import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import type { NavigationSettings, FooterSettings, ThemeSettings, ProjectType } from '@/lib/types';
import { defaultNavigation, defaultFooter, defaultTheme, defaultProjectTypes } from '@/lib/defaults';

// --- Helper Functions ---

function logDev(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[SettingsService] ${message}`, data || '');
    }
}

function warnDev(message: string, error?: any) {
    if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [SettingsService] ${message}`, error || '');
    }
}

// --- Normalizers ---

function normalizeNavigation(data: any): NavigationSettings {
    const normalized = { ...defaultNavigation, ...data };
    
    // Migration logic for old `cta` object.
    if (data.cta && typeof data.cta === 'object') {
        const ctaItem = {
            id: 'cta',
            label_ro: data.cta.label_ro || 'Cere Ofertă',
            label_en: data.cta.label_en || 'Request Quote',
            href: data.cta.href || '/cerere-oferta',
            order: 99,
            enabled: data.cta.active !== undefined ? data.cta.active : true,
            type: data.cta.external ? 'external' : 'internal',
            isCta: true,
        };
        // Ensure it's not duplicated if it already exists in items.
        if (!normalized.items.some((item: any) => item.id === 'cta')) {
            normalized.items.push(ctaItem);
        }
    }
    return normalized;
}


function normalizeTheme(data: any): ThemeSettings {
    const normalized = { ...defaultTheme };
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;

    // Handle migration from flat structure to nested light/dark structure
    if (data?.colors && !data.colors.light && !data.colors.dark) {
        logDev("Migrating flat theme structure to nested light/dark.");
        normalized.colors.light = {
            accent: hexRegex.test(data.colors.accent) ? data.colors.accent : defaultTheme.colors.light.accent,
            background: hexRegex.test(data.colors.background) ? data.colors.background : defaultTheme.colors.light.background,
            surface: hexRegex.test(data.colors.surface) ? data.colors.surface : defaultTheme.colors.light.surface,
            text: hexRegex.test(data.colors.text) ? data.colors.text : defaultTheme.colors.light.text,
        };
        // Use defaults for dark theme during migration
        normalized.colors.dark = defaultTheme.colors.dark;
    } else {
        // Handle nested structure, ensuring all fields are present
        normalized.colors.light = { ...defaultTheme.colors.light, ...data?.colors?.light };
        normalized.colors.dark = { ...defaultTheme.colors.dark, ...data?.colors?.dark };
    }

    // Validate all 8 colors
    (['light', 'dark'] as const).forEach(mode => {
        (['accent', 'background', 'surface', 'text'] as const).forEach(colorName => {
            if (!hexRegex.test(normalized.colors[mode][colorName])) {
                warnDev(`Invalid HEX color for ${mode}.${colorName}. Falling back to default.`);
                normalized.colors[mode][colorName] = defaultTheme.colors[mode][colorName];
            }
        });
    });

    if (data?.brand) {
         normalized.brand = { ...defaultTheme.brand, ...data.brand };
    }
    return normalized;
}


// --- Generic Fetcher and Subscriber ---

async function getSettings<T>(docId: string, fallback: T, normalizer?: (data: any) => T): Promise<T> {
    if (!isFirebaseConfigValid) {
        warnDev(`Firebase not configured. Returning default ${docId} settings.`);
        return fallback;
    }
    try {
        const docRef = doc(db, 'settings', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            logDev(`Loaded ${docId} settings from Firestore.`);
            return normalizer ? normalizer(data) : { ...fallback, ...data } as T;
        }
        logDev(`No ${docId} settings found, returning defaults.`);
        return fallback;
    } catch (error) {
        warnDev(`Error fetching ${docId} settings, returning defaults:`, error);
        return fallback;
    }
}

async function saveSettings<T>(docId: string, payload: T): Promise<void> {
    const docRef = doc(db, 'settings', docId);
    // When saving, we don't want to save the old `cta` property.
    // @ts-ignore
    delete payload.cta;
    await setDoc(docRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
}

function subscribeToSettings<T>(docId: string, callback: (data: T) => void, fallback: T, normalizer?: (data: any) => T): () => void {
    if (!isFirebaseConfigValid) {
        warnDev(`Firebase not configured. Subscription for ${docId} is not active.`);
        callback(fallback);
        return () => {}; // Return an empty unsubscribe function
    }

    const docRef = doc(db, 'settings', docId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            logDev(`Live update for ${docId} received.`);
            callback(normalizer ? normalizer(data) : { ...fallback, ...data } as T);
        } else {
            logDev(`Live update for ${docId}: document does not exist. Using fallback.`);
            callback(fallback);
        }
    }, (error) => {
        warnDev(`Subscription error for ${docId}, providing fallback:`, error);
        callback(fallback);
    });

    return unsubscribe;
}


// --- Specific Service Functions ---

// Navigation
export const getNavigationSettings = () => getSettings<NavigationSettings>('navigation', defaultNavigation, normalizeNavigation);
export const saveNavigationSettings = (payload: NavigationSettings) => saveSettings('navigation', payload);
export const subscribeNavigation = (cb: (data: NavigationSettings) => void) => subscribeToSettings('navigation', cb, defaultNavigation, normalizeNavigation);

// Footer
export const getFooterSettings = () => getSettings<FooterSettings>('footer', defaultFooter);
export const saveFooterSettings = (payload: FooterSettings) => saveSettings('footer', payload);
export const subscribeFooter = (cb: (data: FooterSettings) => void) => subscribeToSettings('footer', cb, defaultFooter);

// Theme
export const getThemeSettings = () => getSettings<ThemeSettings>('theme', defaultTheme, normalizeTheme);
export const saveThemeSettings = (payload: ThemeSettings) => saveSettings('theme', payload);
export const subscribeTheme = (cb: (data: ThemeSettings) => void) => subscribeToSettings('theme', cb, defaultTheme, normalizeTheme);


// Project Types (Taxonomy)
export async function getProjectTypes(): Promise<ProjectType[]> {
     if (!isFirebaseConfigValid) {
        warnDev("Firebase not configured. Returning default project types.");
        return defaultProjectTypes;
    }
    try {
        const docRef = doc(db, 'settings', 'taxonomies');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().projectTypes) {
            const types = docSnap.data().projectTypes as ProjectType[];
            logDev(`Loaded ${types.length} project types from Firestore.`);
            return types.sort((a,b) => a.order - b.order);
        }
        logDev(`No project types found, returning defaults.`);
        return defaultProjectTypes;
    } catch (error) {
        warnDev("Error fetching project types, returning defaults:", error);
        return defaultProjectTypes;
    }
}

export async function saveProjectTypes(projectTypes: ProjectType[]): Promise<void> {
    const docRef = doc(db, 'settings', 'taxonomies');
    await setDoc(docRef, { projectTypes, updatedAt: serverTimestamp() }, { merge: true });
}
