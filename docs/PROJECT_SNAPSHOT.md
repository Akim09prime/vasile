# PROJECT_SNAPSHOT.md - Stare Proiect CARVELLO

*Acest document este un audit "read-only" generat automat pentru a fotografia starea tehnică a proiectului la data curentă. Nu conține modificări de cod.*

---

## 1. Context Tehnic

*   **Node.js / npm:**
    *   `node -v`: `v20.x` (dedus din loguri)
    *   `npm -v`: `10.8.2` (dedus din `package.json`)
*   **Dependențe Cheie (`package.json`):**
    *   `next`: `"^14.2.5"`
    *   `react`: `"^18.3.1"`
    *   `react-dom`: `"^18.3.1"`
    *   `firebase`: `"^11.9.1"`
    *   `firebase-admin`: `"^12.2.0"`
    *   `genkit`: `"^1.20.0"`
*   **Stare Git:**
    *   `git status` / `git log`: Informații indisponibile în acest mediu de analiză.

---

## 2. Inventar Rute

*   **Lista Completă Fișiere de Rută (`page.tsx`, `route.ts`, `layout.tsx`):**
    ```
    src/app/[lang]/cerere-oferta/page.tsx
    src/app/[lang]/contact/page.tsx
    src/app/[lang]/despre/page.tsx
    src/app/[lang]/error.tsx
    src/app/[lang]/galerie-mobilier/page.tsx
    src/app/[lang]/layout.tsx
    src/app/[lang]/loading.tsx
    src/app/[lang]/p/[slug]/page.tsx
    src/app/[lang]/page.tsx
    src/app/[lang]/portofoliu/(overview)/error.tsx
    src/app/[lang]/portofoliu/(overview)/loading.tsx
    src/app/[lang]/portofoliu/(overview)/page.tsx
    src/app/[lang]/portofoliu/[id]/page.tsx
    src/app/[lang]/proces-garantii/page.tsx
    src/app/[lang]/recenzii/page.tsx
    src/app/[lang]/servicii/page.tsx
    src/app/admin/_components/AdminPermissionGate.tsx
    src/app/admin/contact-messages/page.tsx
    src/app/admin/layout.tsx
    src/app/admin/leads/page.tsx
    src/app/admin/loading.tsx
    src/app/admin/login/page.tsx
    src/app/admin/page.tsx
    src/app/admin/projects/page.tsx
    src/app/admin/settings/page.tsx
    src/app/admin/setup/page.tsx
    src/app/api/admin/migrations/sync-project-summaries/route.ts
    src/app/api/admin/projects/[id]/route.ts
    src/app/api/admin/projects/route.ts
    src/app/api/diag/firestore-admin-test/route.ts
    src/app/api/diag/firestore-admin/route.ts
    src/app/api/diag/firestore-public-test/route.ts
    src/app/api/diag/firestore/route.ts
    src/app/api/diag/portfolio-cover-audit/route.ts
    src/app/api/diag/portfolio-detail-test/route.ts
    src/app/api/diag/portfolio-images/route.ts
    src/app/api/diag/runtime/route.ts
    src/app/api/diag/status-lite/route.ts
    src/app/api/public/portfolio/[id]/route.ts
    src/app/layout.tsx
    ```

*   **A) Foldere Dinamice:**
    ```
    src/app/[lang]
    src/app/[lang]/p/[slug]
    src/app/[lang]/portofoliu/[id]
    src/app/api/admin/projects/[id]
    src/app/api/public/portfolio/[id]
    ```

*   **B) Potențiale Conflicte (Părinți cu >1 folder dinamic):**
    *   **NICIUNUL.** Structura de fișiere este acum corectă, folosind un Route Group `(overview)` pentru a separa ruta de listare de cea de detaliu.

---

## 3. Inventar Funcționalități

| Pagină / Funcționalitate   | Status                                                                                                                              | Note                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **--- Public ---**         |                                                                                                                                     |                                                                                                        |
| Home (`/`)                 | ✅ Rută, ✅ UI, ❌ Date (mock `page-service`)                                                                                        | Datele statice provin din `deprecated-placeholder-db`. Nu sunt conectate la admin.                     |
| Despre (`/despre`)         | ✅ Rută, ✅ UI, ❌ Date (mock `page-service`)                                                                                        | La fel ca Home.                                                                                        |
| Servicii (`/servicii`)     | ✅ Rută, ✅ UI, ❌ Date (mock `page-service`)                                                                                        | La fel ca Home.                                                                                        |
| Portofoliu List (`/portofoliu`) | ✅ Rută, ✅ UI, ✅ Folosește API (`/api/public/portfolio`)                                                                        | Fetch pe client. Stabil.                                                                               |
| Portofoliu Detaliu (`/portofoliu/[id]`) | ✅ Rută, ✅ UI, ✅ Folosește API (`/api/public/portfolio/[id]`)                                                           | Fetch pe server (`RSC`). Stabil.                                                                       |
| Contact (`/contact`)       | ✅ Rută, ✅ UI, ✅ Formular funcțional                                                                                              | Scrie în colecția `contactMessages` folosind `contact-service`.                                          |
| Cerere Ofertă (`/cerere-oferta`) | ✅ Rută, ✅ UI, ✅ Formular funcțional                                                                                              | Scrie în colecția `leads` folosind `lead-service`.                                                      |
| Pagini Dinamice (`/p/[slug]`) | ✅ Rută, ⚠️ UI (placeholder)                                                                                                        | Ruta există, dar afișează conținut static. Nu există un sistem de management în admin.                |
| **--- Admin ---**          |                                                                                                                                     |                                                                                                        |
| Login (`/admin/login`)     | ✅ Rută, ✅ UI, ✅ Funcționalitate (Firebase Auth)                                                                                  | Stabil.                                                                                                |
| Dashboard (`/admin`)       | ✅ Rută, ✅ UI (static)                                                                                                              | Pagina principală a adminului, cu statistici statice.                                                  |
| CRUD Proiecte (`/admin/projects`) | ✅ Rută, ✅ UI, ✅ CRUD complet (client-side)                                                                                   | Operațiunile C/R/U/D se fac direct din client (`project-service`) către Firestore. NU folosește un API. |
| Setări (`/admin/settings`) | ✅ Rută, ⚠️ UI (parțial)                                                                                                            | **Categorii & Navigare** sunt funcționale. **Footer & Theme** sunt placeholder.                          |
| Leads (`/admin/leads`)     | ✅ Rută, ✅ UI, ✅ Funcționalitate (client-side)                                                                                   | Listează și permite schimbarea statusului lead-urilor direct din Firestore.                        |
| Mesaje Contact (`/admin/contact-messages`) | ✅ Rută, ✅ UI, ✅ Funcționalitate (client-side)                                                                      | Listează și permite ștergerea/marcarea ca citit a mesajelor.                                          |
| Setup Admin (`/admin/setup`) | ✅ Rută, ✅ UI, ✅ Funcționalitate (bootstrap)                                                                                     | Permite crearea primului admin. Stabil.                                                                |
| Media (`/admin/media`)     | ❌ **LIPSEȘTE**                                                                                                                     | Nu există o secțiune de management media. Proiectele folosesc imagini placeholder.                   |

---

## 4. Inventar Firebase

*   **Client SDK (Browser):**
    *   **Inițializare:** `src/lib/firebase.ts`
    *   **Exports:** `app`, `db`, `auth`, `storage` (instanțe Firebase client-side).
*   **Admin SDK (Server):**
    *   **Inițializare:** `src/lib/firebase-admin.server.ts`
    *   **Apelare:** Funcția `getAdminDb()` este apelată în rutele API server-side (ex: `sync-project-summaries`).
*   **Colecții Firestore Folosite (conform `grep`):**
    *   `admins`: Stochează utilizatorii cu drepturi de admin.
    *   `projects`: Sursa principală de adevăr pentru proiecte (administrată de admin).
    *   `project_summaries`: O copie publică, denormalizată a proiectelor, pentru performanță.
    *   `settings`: Documente single pentru configurări globale (`navigation`, `footer`, `theme`, `taxonomies`).
    *   `leads`: Stochează cererile de ofertă.
    *   `contactMessages`: Stochează mesajele din formularul de contact.
    *   `adminTests`: Colecție temporară pentru testarea permisiunilor.
*   **Conținut `firestore.rules`:**
    ```rules
    rules_version = '2';

    service cloud.firestore {
      match /databases/{database}/documents {
        
        function isAdmin() {
          return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid)) && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.allowed == true;
        }

        match /admins/{uid} {
          allow list: if request.auth != null;
          allow get: if request.auth != null;
          allow create: if request.auth.uid == uid && size(get(/databases/$(database)/documents/admins).data) == 0;
          allow update, delete: if isAdmin();
        }
        
        match /adminTests/{docId} {
            allow write, delete: if isAdmin();
        }

        match /projects/{projectId} {
          allow get: if resource.data.isPublished == true || isAdmin();
          allow list: if isAdmin();
          allow create, update, delete: if isAdmin();
        }

        match /project_summaries/{projectId} {
          allow read, list: if true;
          allow write: if isAdmin();
        }
        
        match /settings/{docId} {
          allow read: if true;
          allow write: if isAdmin();
        }

        match /leads/{leadId} {
          allow create: if true;
          allow read, list, update, delete: if isAdmin();
        }
        
        match /contactMessages/{messageId} {
          allow create: if true;
          allow read, list, update, delete: if isAdmin();
        }
      }
    }
    ```

---

## 5. SEO / Imagini / I18n

*   **Configurație Next.js (`next.config.mjs`):**
    ```javascript
    /** @type {import('next').NextConfig} */
    const nextConfig = {
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'images.unsplash.com',
                },
                 {
                    protocol: 'https',
                    hostname: 'firebasestorage.googleapis.com',
                },
                {
                    protocol: 'https',
                    hostname: 'storage.googleapis.com',
                }
            ]
        }
    };

    export default nextConfig;
    ```
    *   **DUBLURI:** Nu există fișiere `next.config` duplicate.

*   **Internaționalizare (i18n):**
    *   **Determinare `lang`:** Limba este determinată din URL (`/[lang]/...`). Dacă lipsește, se face un redirect pe baza cookie-ului `NEXT_LOCALE` sau a header-ului `Accept-Language` din request.
    *   **Rute Prefixate:** Toate rutele publice sunt prefixate cu `/ro` sau `/en`. Rutele de admin (`/admin/*`) sunt excluse.

---

## 6. TODO & Riscuri

*   **`grep -R "TODO"`:**
    ```
    src/app/[lang]/portofoliu/[id]/page.tsx:14: // TODO: The debug UI below should be removed once functionality is confirmed.
    ```
*   **Top 10 Riscuri de Regresie:**
    1.  **Sincronizare Eșuată `projects` -> `project_summaries`:** Un bug în funcțiile de scriere poate duce la un portofoliu public neactualizat.
    2.  **Hydration Mismatch (Theme/i18n):** Schimbarea temei/limbii pe client poate cauza nepotriviri. Momentan suprimat, dar poate reapărea.
    3.  **Lipsă Credențiale Admin SDK în Producție:** API-urile de admin și migrarea vor eșua complet.
    4.  **Reguli Firestore Incomplete:** Adăugarea de noi colecții FĂRĂ actualizarea `firestore.rules` va cauza erori de permisiuni.
    5.  **Management Media Inexistent:** Aplicația depinde de URL-uri statice. Fără upload, nu este scalabilă. **RISC MAJOR.**
    6.  **Date Mock în Pagini Statice:** Paginile Home/Despre/Servicii folosesc date hardcodate, neconectate la admin.
    7.  **Dependențe Instabile:** Revenirea la versiuni `-rc` sau `-canary` va reintroduce probleme de build.
    8.  **Lipsă Validare Slug Proiecte:** Două proiecte cu același nume pot genera același slug, creând confuzie.
    9.  **SEO Incomplet:** Lipsesc `sitemap.xml`, `robots.txt`, `hreflang` și `canonical URLs`.
    10. **Admin CRUD pe Client:** Faptul că operațiunile de scriere din admin se fac direct din client crește complexitatea regulilor de securitate și expune logica.

---

## 7. Rezumat Final

*   **Implementat ✅**
    *   Structură de rute stabilă, fără conflicte.
    *   Pornire `dev` și `build` fără erori.
    *   Navigare funcțională de la listă la detaliu portofoliu.
    *   Funcționalități de bază în admin (CRUD proiecte, leads, contact) sunt operaționale.
    *   Sistem de autentificare admin funcțional.
    *   Configurație de bază pentru imagini remote.

*   **Lipsește / Incomplet ❌**
    *   Sistem de upload și management media.
    *   Conectarea paginilor statice (Home, Despre, Servicii) la un CMS în admin.
    *   Finalizarea secțiunilor "Footer" și "Theme" din setările admin.
    *   Implementarea paginilor dinamice `/p/[slug]`.
    *   Implementare SEO avansat (sitemap, robots, etc.).
    *   Portfolio V2 (pus în așteptare conform cerinței).

*   **Următorii 5 Pași Recomandați (Fără Implementare):**
    1.  **TASK S-1 (PLAN.md):** Conectarea paginilor Home, Despre, Servicii la Firestore și crearea unui UI de editare în admin.
    2.  **TASK S-2 (PLAN.md):** Finalizarea UI-ului pentru setările de Footer și Theme din admin, pentru a permite control complet.
    3.  **TASK S-3 (PLAN.md):** Implementarea SEO de bază (`sitemap.xml`, `robots.txt`, `canonical`, `hreflang`).
    4.  **TASK M-1 (PLAN.md):** Crearea sistemului de upload de imagini în Firebase Storage și a unei colecții `media` în Firestore.
    5.  **TASK M-2 (PLAN.md):** Integrarea selectorului de imagini (din media library) în formularul de creare/editare proiecte.
