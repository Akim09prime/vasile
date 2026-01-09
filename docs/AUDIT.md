# AUDIT.md - CARVELLO Project Status

*Acest document reprezintă o analiză a stării tehnice a proiectului la data curentă. Scopul este de a identifica punctele forte, slăbiciunile și riscurile pentru a ghida dezvoltarea viitoare.*

---

## A.1 Sitemap & Routes

| Ruta                               | Stare | Sursa de Date                                | Auth      | Risc                                                                 | Note                                                      |
| ---------------------------------- | :---: | -------------------------------------------- | --------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| **Public**                         |       |                                              |           |                                                                      |                                                           |
| `/`                                |   ✅   | `page-service.ts` (mock)                     | Public    | Scăzut                                                                 | Depinde de date statice, neconectate la admin.            |
| `/[lang]/despre`                   |   ✅   | `page-service.ts` (mock)                     | Public    | Scăzut                                                                 | La fel ca Home.                                           |
| `/[lang]/servicii`                 |   ✅   | `page-service.ts` (mock)                     | Public    | Scăzut                                                                 | La fel ca Home.                                           |
| `/[lang]/portofoliu`               |   ✅   | `/api/public/portfolio` (`project_summaries`) | Public    | Mediu                                                                | Depinde de API; sincronizarea `summaries` e critică.     |
| `/[lang]/portofoliu/[slug]`        |   ✅   | `project-service.ts` (`projects`)           | Public    | Mediu                                                                | Citește documentul complet, inclusiv câmpul `content`. |
| `/[lang]/galerie-mobilier`         |   ✅   | `project-service.ts` (API public)            | Public    | Scăzut                                                                 | Funcțional.                                               |
| `/[lang]/contact`                  |   ✅   | `page-service.ts` (mock) + `contact-service` | Public    | Scăzut                                                                 | Formularul scrie în colecția `contactMessages`.           |
| `/[lang]/cerere-oferta`            |   ✅   | `lead-service.ts`                            | Public    | Scăzut                                                                 | Formularul scrie în colecția `leads`.                     |
| `/[lang]/p/[slug]`                 |   ⚠️   | Placeholder                                  | Public    | Scăzut                                                                 | Pagină dinamică, dar cu conținut static (placeholder).    |
| **Admin**                          |       |                                              |           |                                                                      |                                                           |
| `/admin`                           |   ✅   | N/A (doar UI)                                | Admin     | Scăzut                                                                 | Dashboard principal.                                      |
| `/admin/login`                     |   ✅   | Firebase Auth                                | Public    | Scăzut                                                                 | Pagina de autentificare.                                  |
| `/admin/setup`                     |   ✅   | `admin-service.ts`                           | Admin     | Mediu                                                                | Logică critică pentru bootstrap, dar folosită rar.        |
| `/admin/projects`                  |   ✅   | `project-service.ts` (`projects`)           | Admin     | Mediu                                                                | CRUD pe proiecte.                                         |
| `/admin/settings`                  |   ⚠️   | `settings-service.ts` (`settings`)          | Admin     | Mediu                                                                | UI parțial implementat (Footer/Theme e placeholder).    |
| `/admin/leads`                     |   ✅   | `lead-service.ts` (`leads`)                 | Admin     | Scăzut                                                                 | Management lead-uri.                                      |
| `/admin/contact-messages`          |   ✅   | `contact-service.ts` (`contactMessages`)    | Admin     | Scăzut                                                                 | Management mesaje.                                        |
| **API**                            |       |                                              |           |                                                                      |                                                           |
| `/api/public/portfolio`            |   ✅   | `project-service.ts` (`project_summaries`)  | Public    | Mediu                                                                | Punct central pentru portofoliu. Esențial să rămână stabil. |
| `/api/admin/migrations/*`          |   ✅   | Admin SDK (`projects`, `project_summaries`) | Admin     | **Ridicat**                                                          | Poate modifica masiv date. Trebuie rulat cu atenție.   |
| `/api/diag/*`                      |   ✅   | Diverse (Admin SDK, Client SDK)              | Public    | Scăzut                                                                 | Esențial pentru diagnosticare.                            |

---

## A.2 Firestore Schema & Collections

| Colecție          | Sursa Adevărului? | Tip Acces      | Sincronizat cu      | Câmpuri Principale                                             |
| ----------------- | :---------------: | -------------- | ------------------- | -------------------------------------------------------------- |
| `admins`          |        ✅         | Admin-only     | -                   | `allowed`, `email`, `createdAt`                                |
| `projects`        |        ✅         | Admin-only     | `project_summaries` | `name`, `content`, `isPublished`, `coverMediaId`, `mediaIds`   |
| `project_summaries` |         ❌        | Public (Read)  | `projects`          | `name`, `summary`, `isPublished`, `image` (copie `coverMedia`) |
| `settings`        |        ✅         | Public (Read)  | -                   | Documente: `navigation`, `footer`, `theme`, `taxonomies`       |
| `leads`           |        ✅         | Admin (Read/Write) | -               | `name`, `email`, `phone`, `status`, `message`                  |
| `contactMessages` |        ✅         | Admin (Read/Write) | -               | `name`, `email`, `subject`, `isRead`                           |
| `adminTests`      |         -         | Admin-only     | -                   | Colecție temporară pentru testarea permisiunilor.            |

---

## A.3 Admin Capabilities

-   **Autentificare & Setup:** ✅ (Funcțional)
-   **CRUD Proiecte:** ⚠️ (Parțial)
    -   Create/Update/Delete: ✅
    -   Publish/Unpublish Toggle: ✅
    -   Image Management (Upload/Select): ❌ (Folosește placeholder-uri, nu există upload real)
    -   Validare Slug: ❌ (Slug-ul nu este gestionat activ)
-   **Settings:** ⚠️ (Parțial)
    -   Navigare (Header): ✅
    -   Categorii Proiecte (Taxonomies): ✅
    -   Footer: ❌ (UI nefuncțional)
    -   Theme (Culori): ❌ (UI nefuncțional)
-   **Leads Management:** ✅ (Funcțional)
-   **Contact Messages Management:** ✅ (Funcțional)

---

## A.4 Public Website Capabilities

-   **Home / Despre / Servicii:** ⚠️ (Parțial) - Funcționale, dar depind de date mock (`page-service.ts`) neconectate la admin.
-   **Portofoliu (Listare & Detaliu):** ✅ (Funcțional) - Citește date reale din Firestore via API.
-   **Galerie:** ✅ (Funcțional) - Agregă imagini din proiectele publicate.
-   **Contact & Cerere Ofertă:** ✅ (Funcțional) - Formularele sunt conectate la Firestore.

---

## A.5 SEO Status

-   **Metadata (title, description):** ⚠️ (Parțial) - `layout.tsx` are metadata generală. Pagina de detaliu proiect generează titlu dinamic, dar restul paginilor nu.
-   **OpenGraph:** ⚠️ (Parțial) - Doar pagina de detaliu proiect are OG.
-   **Sitemap.xml:** ❌ (Lipsește)
-   **robots.txt:** ❌ (Lipsește)
-   **Canonical URLs:** ❌ (Lipsește) - Important pentru a evita conținut duplicat pe rutele `/[lang]`.
-   **i18n (hreflang):** ❌ (Lipsește) - Esențial pentru SEO multi-lingvistic.

---

## A.6 Riscuri (Top 5)

| # | Risc                                                | Descriere                                                                                             | Fix Recomandat                                                                    | Guardrail                                                              |
| - | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1 | **Sincronizare Eșuată `projects` -> `summaries`**     | Dacă funcția de sincronizare eșuează, portofoliul public devine inconsistent cu datele din admin.         | Tranzacții Firestore sau funcție Cloud care se declanșează la `onWrite` pe `projects`. | Script de migrare/resincronizare (`sync-project-summaries`).           |
| 2 | **Hydration Mismatch (Theme)**                      | Schimbarea temei pe client poate cauza nepotriviri. Deși suprimat, riscul de "flicker" rămâne.        | Utilizarea unui script `beforeInteractive` pentru a seta tema înainte de render.  | `suppressHydrationWarning` este deja un guardrail.                     |
| 3 | **Lipsă Credențiale Admin SDK în Producție**        | API-urile de admin și cele publice care folosesc Admin SDK vor eșua complet.                         | Setarea corectă a variabilelor de mediu în platforma de hosting (Vercel, etc.). | Endpoint-ul `/api/diag/runtime` pentru a verifica `adminFirebase.mode`. |
| 4 | **Reguli Firestore Incomplete/Greșite**             | Adăugarea de noi colecții fără a actualiza `firestore.rules` va duce la erori `PERMISSION_DENIED`. | Audit periodic al regulilor vs. cod. Testare end-to-end.                          | Endpoint-ul `/api/diag/firestore-public-test` și scriptul `healthcheck`.  |
| 5 | **Management Media Inexistent**                     | Momentan, aplicația depinde de URL-uri statice. Fără un sistem de upload, nu este scalabilă.      | Integrare cu Firebase Storage, crearea unei colecții `media` și a unui UI de admin. | N/A (problemă de funcționalitate, nu de stabilitate imediată).      |
