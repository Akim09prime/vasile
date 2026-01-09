# PLAN.md - CARVELLO Development Backlog

*Acest document structurează dezvoltarea viitoare în iterații mici, controlate, pentru a asigura stabilitate și progres predictibil. Fiecare task trebuie să treacă `npm run healthcheck` înainte de a fi considerat "Done".*

---

## 🚀 Iteration 1: Stability & Admin Foundations (8-12 ore)

*Focus: Eliminarea riscurilor, completarea funcționalităților de bază din admin.*

| Task ID | Descriere                                             | Scope                                                                                                | Definition of Done                                                                              | Estimare |
| ------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | :------: |
| **S-1** | **Conectare Date Pagini Statice la Admin**            | - `src/lib/services/page-service.ts`<br>- `src/app/admin/pages` (UI nou)<br>- `src/lib/types.ts`     | - Paginile Home, Despre, Servicii își iau datele din Firestore (`settings/pages_home`, etc.), nu din mock-uri.<br>- Admin are un UI pentru a edita aceste date. |  3-4h    |
| **S-2** | **Completare UI Settings Admin**                      | - `src/app/admin/settings/page.tsx`<br>- `src/lib/services/settings-service.ts`                  | - Tab-urile Footer și Theme din admin sunt funcționale și salvează datele în Firestore.          |  2-3h    |
| **S-3** | **Implementare SEO de Bază**                          | - `src/app/sitemap.ts`<br>- `src/app/robots.ts`<br>- `src/app/layout.tsx`                           | - `sitemap.xml` și `robots.txt` sunt generate dinamic.<br>- Metadata canonical este adăugată în `layout`.<br>- Atributele `hreflang` sunt setate corect. |  2-3h    |
| **S-4** | **Întărire Formulare Publice**                        | - `src/app/[lang]/contact/page.tsx`<br>- `src/app/[lang]/cerere-oferta/page.tsx`                    | - Adăugare protecție anti-spam (ex: honeypot simplu sau reCAPTCHA invizibil).<br>- Feedback mai bun pentru utilizator la submit. |  1-2h    |

---

## 🎨 Iteration 2: Media Management & UI Polish (6-10 ore)

*Focus: Înlocuirea imaginilor placeholder cu un sistem real de management media.*

| Task ID | Descriere                                        | Scope                                                                                                                             | Definition of Done                                                                                                      | Estimare |
| ------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | :------: |
| **M-1** | **Creare Sistem de Upload Media**                | - `src/app/admin/media` (UI nou)<br>- API route pentru upload<br>- `src/lib/services/storage-service.ts`                            | - Admin poate face upload de imagini în Firebase Storage.<br>- O colecție `media` în Firestore stochează metadata (URL, alt text, etc.). |  3-4h    |
| **M-2** | **Integrare Media în CRUD Proiecte**             | - `src/app/admin/projects/project-form.tsx`                                                                                       | - Formularul de proiect permite selectarea imaginilor (cover + galerie) din media library (M-1), nu din JSON static. |  2-3h    |
| **M-3** | **Finalizare Pagini Dinamice `/[lang]/p/[slug]`** | - `src/app/admin/pages` (UI nou)<br>- `src/app/[lang]/p/[slug]/page.tsx`                                                            | - Admin poate crea pagini simple (ex: Termeni, Confidențialitate) cu un editor de text.<br>- Aceste pagini sunt randate dinamic. |  1-2h    |
| **M-4** | **UI Polish General**                            | - Componente diverse (`<Button>`, `<Card>`, etc.)                                                                                 | - Audit vizual rapid al componentelor.<br>- Corectarea micilor inconsistențe de design, spațiere, culori.              |  1-1h    |

---

## ✨ Iteration 3: Portfolio Premium V2 (4-6 ore)

*Focus: Implementarea unei experiențe vizuale superioare pentru portofoliu, sub feature flag.*

| Task ID | Descriere                                 | Scope                                                              | Definition of Done                                                                                                     | Estimare |
| ------- | ----------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | :------: |
| **P-1** | **Design și Animații Timeline V2**        | - `src/app/[lang]/portofoliu/v2-timeline.tsx`                      | - Implementarea unui layout de tip timeline vertical, cu animații subtile la scroll.<br>- Se activează doar cu `NEXT_PUBLIC_PORTFOLIO_V2="true"`. |  3-4h    |
| **P-2** | **Extindere Date Proiect (pentru V2)**    | - `src/lib/types.ts`<br>- `src/app/admin/projects/project-form.tsx` | - Adăugare câmpuri noi în `projects`: `tags` (array de stringuri), `year` (number).<br>- UI în admin pentru a edita aceste câmpuri noi. |  1-2h    |

---

## 🛠️ Backlog Tehnic & Îmbunătățiri Continue

*Task-uri fără prioritate imediată, care pot fi abordate la nevoie.*

-   **T-1:** Trecerea de la `page-service.ts` (mock) la o soluție complet CMS-driven.
-   **T-2:** Implementare paginare în listele din admin (Projects, Leads).
-   **T-3:** Refactorizarea `settings-service` pentru o structură mai granulară a documentelor.
-   **T-4:** Integrare App Check completă (client + server) și trecerea la `Enforce`.
-   **T-5:** Adăugare teste unitare/integrare pentru serviciile critice.
