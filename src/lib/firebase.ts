import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase-config";


// Check for missing configuration and export status for diagnostics.
export const isFirebaseConfigValid = 
    !!firebaseConfig.apiKey && 
    !!firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('your-project-id');

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;
let firebaseInitializationError: Error | null = null;


if (isFirebaseConfigValid) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Detailed runtime configuration logging for debugging
            const key = app.options.apiKey || '';
            console.log(
              `[FirebaseRuntime] projectId=${app.options.projectId}, authDomain=${app.options.authDomain}`
            );
             console.log(
              `[FirebaseRuntime] apiKey prefix/suffix: ${key.slice(0,6)}...${key.slice(-4)} (length: ${key.length})`
            );
        }

        // Emulator ONLY if explicitly enabled with the exact string 'true'
        if (process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === "true") {
            const hostPort = (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
            const host = hostPort[0];
            const port = Number(hostPort[1] || 8080);
        
            console.warn(`[FirebaseRuntime] emulator=true, host=${host}, port=${port}. Ensure this is not a production build.`);
            connectFirestoreEmulator(db, host, port);
        } else {
             if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.log("[FirebaseRuntime] emulator=false");
             }
        }

    } catch (e) {
        firebaseInitializationError = e as Error;
        console.error("Firebase initialization failed:", firebaseInitializationError);
    }
} else {
    const errorMessage = "Firebase config is missing or invalid. Please set NEXT_PUBLIC_FIREBASE_* environment variables in your .env file and ensure they are not placeholders.";
    if (typeof window !== 'undefined') { // Only log error in browser
        console.error(`[FirebaseRuntime] ${errorMessage}`);
    }
    firebaseInitializationError = new Error(errorMessage);
}


// @ts-ignore
export { app, db, auth, storage, firebaseInitializationError };
