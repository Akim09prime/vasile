import 'server-only';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from './firebase-config';

// This file provides a server-side instance of the Firebase client SDK.
// It is intended for use in API routes that need to perform public,
// rule-respecting database operations without using admin privileges.

let serverApp: FirebaseApp;
let serverDb: Firestore;

const appName = 'firebase-server-client-app';

if (!getApps().some(app => app.name === appName)) {
  serverApp = initializeApp(firebaseConfig, appName);
} else {
  serverApp = getApp(appName);
}

serverDb = getFirestore(serverApp);

console.log(`[Firebase/ServerClient] Initialized for project: ${serverApp.options.projectId}`);

/**
 * Returns a server-side instance of the Firestore database,
 * initialized with the client SDK.
 * This respects all Firestore security rules.
 */
export function getServerDb(): Firestore {
    return serverDb;
}
