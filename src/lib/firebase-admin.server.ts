
import 'server-only';

import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';

type AdminInfo = {
  mode: 'cert_file' | 'cert_json' | 'cert_split' | 'adc' | 'none' | 'failed';
  projectId: string | null;
  source: 'file' | 'env_json' | 'env_split' | 'adc' | 'none';
  hasCreds: boolean;
  error?: string;
}

let adminApp: App | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminRuntimeInfo: AdminInfo = {
    mode: 'none',
    projectId: null,
    source: 'none',
    hasCreds: false,
};

function getPrivateKey() {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
    return key.replace(/\\n/g, '\n');
}

function initializeAdminApp() {
    if (adminApp) {
        return;
    }

    const appName = "firebase-admin-app-main";
    const existingApp = getApps().find(app => app.name === appName);
    if (existingApp) {
        adminApp = existingApp;
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
        // Do not return here, let the runtime info be checked/set below
    }
    
    // If the app was already initialized, we might have info. If not, re-evaluate.
    if (adminRuntimeInfo.mode !== 'none' && adminApp) {
        return;
    }

    // Attempt 0: Read service account from well-known file paths
    const serviceAccountPaths = [
        process.env.FIREBASE_ADMIN_SA_PATH,
        `${process.cwd()}/.secrets/firebase-admin.json`,
        '/mnt/data/studio-661171024-5cce6-firebase-adminsdk-fbsvc-9ebec02539.json'
    ].filter(Boolean) as string[];

    for (const path of serviceAccountPaths) {
        if (fs.existsSync(path)) {
            try {
                const raw = fs.readFileSync(path, "utf8");
                const serviceAccount = JSON.parse(raw);
                if (!adminApp) {
                    adminApp = initializeApp({ credential: cert(serviceAccount) }, appName);
                    adminDb = getFirestore(adminApp);
                    adminAuth = getAuth(adminApp);
                }
                adminRuntimeInfo = {
                    mode: "cert_file",
                    projectId: serviceAccount.project_id || adminApp.options.projectId || null,
                    source: "file",
                    hasCreds: true
                };
                console.log("[FIREBASE/ADMIN] Initialized via cert_file. Project ID:", adminRuntimeInfo.projectId);
                return;
            } catch (e: any) {
                adminRuntimeInfo = { 
                    mode: "failed", 
                    source: "file", 
                    projectId: null, 
                    hasCreds: true, 
                    error: "cert_file init failed: " + (e?.message || String(e)) 
                };
                console.error(`[FIREBASE/ADMIN] ${adminRuntimeInfo.error}`);
            }
        }
    }

    // Attempt 1: Read from single env var (JSON object)
    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON);
            if (!adminApp) {
                adminApp = initializeApp({ credential: cert(serviceAccount) }, appName);
                adminDb = getFirestore(adminApp);
                adminAuth = getAuth(adminApp);
            }
            adminRuntimeInfo = {
                mode: "cert_json",
                projectId: serviceAccount.project_id || null,
                source: "env_json",
                hasCreds: true
            };
            console.log("[FIREBASE/ADMIN] Initialized via cert_json. Project ID:", adminRuntimeInfo.projectId);
            return;
        } catch (e: any) {
             adminRuntimeInfo = { mode: "failed", source: "env_json", projectId: null, hasCreds: true, error: "cert_json init failed: " + (e?.message || String(e)) };
             console.error(`[FIREBASE/ADMIN] ${adminRuntimeInfo.error}`);
        }
    }

    // Attempt 2: Read from split env vars
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = getPrivateKey();
    if (projectId && clientEmail && privateKey && !privateKey.includes("PASTE")) {
        try {
            const credential = { projectId, clientEmail, privateKey };
            if (!adminApp) {
                adminApp = initializeApp({ credential: cert(credential) }, appName);
                adminDb = getFirestore(adminApp);
                adminAuth = getAuth(adminApp);
            }
            adminRuntimeInfo = {
                mode: "cert_split",
                projectId: projectId,
                source: "env_split",
                hasCreds: true
            };
            console.log("[FIREBASE/ADMIN] Initialized via cert_split. Project ID:", adminRuntimeInfo.projectId);
            return;
        } catch(e: any) {
             adminRuntimeInfo = { mode: "failed", source: "env_split", projectId: projectId, hasCreds: true, error: "cert_split init failed: " + (e?.message || String(e)) };
             console.error(`[FIREBASE/ADMIN] ${adminRuntimeInfo.error}`);
        }
    }
    
    // Attempt 3: Application Default Credentials (ADC) - last resort
    try {
        if (!adminApp) {
            adminApp = initializeApp({ appName });
            adminDb = getFirestore(adminApp);
            adminAuth = getAuth(adminApp);
        }
        adminRuntimeInfo = {
            mode: "adc",
            projectId: adminApp.options.projectId || null,
            source: "adc",
            hasCreds: true 
        };
        console.log("[FIREBASE/ADMIN] Initialized via ADC. Project ID:", adminRuntimeInfo.projectId);
        return;
    } catch (e: any) {
         const errorMessage = "All initialization methods failed. ADC init failed: " + (e?.message || String(e));
         adminRuntimeInfo = {
            mode: 'failed',
            source: 'none',
            projectId: null,
            hasCreds: false,
            error: errorMessage
         };
         console.error(`[FIREBASE/ADMIN] ${errorMessage}`);
    }
}

export function getAdminDb() {
    if (!adminApp) {
        initializeAdminApp();
    }
    return { db: adminDb, info: adminRuntimeInfo };
}

export function getAdminAuth() {
    if (!adminApp) {
        initializeAdminApp();
    }
    return adminAuth;
}
