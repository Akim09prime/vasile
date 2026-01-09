

// THIS FILE IS DEPRECATED AND SHOULD NOT BE USED FOR NEW IMPLEMENTATIONS
// IT IS KEPT FOR BACKWARDS COMPATIBILITY WITH EXISTING MOCK PAGE SERVICES

import { PlaceHolderImages } from '../placeholder-images';

export const placeholderDb = {
    images: PlaceHolderImages,
    pages: {
        home: {
            hero: {
                imageId: 'hero-home',
                cta: {
                    primary: { href: "/cerere-oferta" },
                    secondary: { href: "/portofoliu" }
                }
            },
            valuePillars: {
                title: 'Design. Producție. Montaj.',
                description: 'De la concept la realitate, controlăm fiecare etapă a proiectului pentru a garanta un rezultat excepțional, aliniat viziunii dumneavoastră.',
                pillars: [
                    { title: "Consultanță & Proiectare 3D", description: "Viziunea prinde contur. Modelăm fiecare detaliu în 3D pentru o previzualizare perfectă.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-drafting-compass"><circle cx="12" cy="12" r="10"/><path d="m12 18-3.4-6H12Z"/><path d="M12 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/><path d="M6 12a6 6 0 1 0 12 0 6 6 0 0 0-12 0Z"/></svg>` },
                    { title: "Producție CNC & Finisaj Premium", description: "Precizie milimetrică și finisaje impecabile, realizate cu tehnologie de top.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>` },
                    { title: "Montaj Profesional", description: "Echipa noastră asigură o instalare perfectă, cu atenție la cele mai mici detalii.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>` },
                    { title: "Garanția Calității", description: "Oferim garanție pentru materiale și manoperă, pentru liniștea dumneavoastră.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>` },
                ]
            },
            process: {
                kicker: 'De la Idee la Realitate',
                title: 'Procesul Nostru Simplificat',
                description: 'Am optimizat fiecare pas pentru a asigura transparență, eficiență și un rezultat final care depășește așteptările.',
                steps: [
                    { name: 'Consultanță & Proiectare', description: 'Discutăm nevoile, măsurăm spațiul și creăm un proiect 3D detaliat.' },
                    { name: 'Alegerea Materialelor', description: 'Selectăm împreună finisajele, culorile și accesoriile potrivite.' },
                    { name: 'Producție de Precizie', description: 'Debităm și prelucrăm componentele cu utilaje CNC de înaltă precizie.' },
                    { name: 'Montaj & Verificare', description: 'Instalăm mobilierul și ne asigurăm că totul este perfect.' },
                ]
            },
             guarantees: {
                kicker: 'Angajamentul Nostru',
                title: 'Construim Încredere, Nu Doar Mobilier',
                description: 'Calitatea este fundamentul muncii noastre. De aceea, ne asumăm responsabilitatea pentru fiecare proiect livrat.',
                items: [
                    'Garanție de 24 de luni pentru manoperă și vicii ascunse',
                    'Materiale de la producători de top (Egger, Kronospan)',
                    'Feronerie premium cu garanție pe viață (Blum)',
                    'Respectarea termenelor contractuale',
                    'Asistență post-garanție pentru ajustări'
                ],
                imageId: 'about-2'
            }
        },
        about: {
            intro: {
                badge: "Cine Suntem",
                title: "Pasiune pentru Lemn, Obsesie pentru Detaliu",
                description: "CARVELLO s-a născut din dorința de a transforma spațiile prin mobilier care nu doar arată bine, ci este construit să dureze. Combinăm măiestria tradițională cu tehnologia modernă pentru a crea piese unice."
            },
            mission: {
                title: "Misiunea Noastră: Precizie și Eleganță",
                p1: "Credem că mobilierul la comandă trebuie să fie o expresie a personalității clientului, dar și o demonstrație de inginerie și design. De la prima schiță până la ultimul șurub, fiecare proiect este tratat cu maximă seriozitate.",
                p2: "Folosim utilaje CNC pentru o debitare și frezare de o acuratețe imposibil de atins manual, asigurând îmbinări perfecte și o geometrie impecabilă. Procesul de vopsire în propriul atelier ne permite un control total asupra calității finisajului."
            },
            values: {
                title: "Valorile care Ne Definesc",
                description: "Fiecare piesă de mobilier care poartă numele CARVELLO este o promisiune a calității, durabilității și designului atemporal.",
                items: [
                    { name: "Calitate Fără Compromis", description: "Selectăm doar materiale și feronerie de la furnizori de renume internațional." },
                    { name: "Transparență Totală", description: "Comunicăm deschis în fiecare etapă, de la proiectare la costuri și termene de execuție." },
                    { name: "Inovație Tehnologică", description: "Investim constant în tehnologie pentru a oferi precizie și finisaje de excepție." },
                    { name: "Parteneriat cu Clientul", description: "Considerăm fiecare proiect o colaborare strânsă pentru a obține rezultatul perfect." }
                ]
            },
            images: {
                aboutImage1Id: 'about-1',
                aboutImage2Id: 'hero-home',
            }
        },
        services: {
            intro: {
                badge: 'Ce Oferim',
                title: 'Servicii Complete de Mobilier la Comandă',
                description: 'Acoperim întregul proces, de la idee la realitate, pentru a vă oferi o experiență lipsită de griji și un rezultat care depășește așteptările.'
            },
            services: [
                {
                    name: 'Proiectare 3D & Consultanță',
                    description: 'Orice proiect de succes începe cu un plan bine pus la punct. Specialiștii noștri vă ajută să optimizați spațiul și să alegeți cele mai bune soluții, transpunând totul într-o randare 3D fotorealistă.',
                    features: [
                        'Măsurători de precizie la locație',
                        'Optimizarea funcțională a spațiului',
                        'Propuneri multiple de compartimentare',
                        'Randări 3D pentru vizualizare detaliată',
                        'Consultanță în alegerea materialelor și culorilor'
                    ],
                    imageId: 'services-1'
                },
                {
                    name: 'Debitrare și Prelucrare CNC',
                    description: 'Inima producției noastre este tehnologia CNC (Computer Numerical Control). Toate componentele mobilierului sunt tăiate și prelucrate cu o precizie de sub un milimetru, garantând îmbinări perfecte și o geometrie impecabilă.',
                    features: [
                        'Tăiere computerizată de înaltă precizie',
                        'Frezări complexe și modele personalizate',
                        'Găurire și pregătire pentru asamblare automată',
                        'Reducerea pierderilor de material',
                        'Calitate și repetabilitate indiferent de complexitate'
                    ],
                    imageId: 'services-2'
                },
                 {
                    name: 'Vopsitorie Profesională',
                    description: 'Deținem propria vopsitorie, ceea ce ne oferă control total asupra calității finisajelor. Folosim vopseluri premium, rezistente în timp, și putem obține orice nuanță din paletarul RAL, cu diferite grade de luciu.',
                    features: [
                        'Finisaje mate, super-mate, satinate sau lucioase',
                        'Vopsire în câmp electrostatic pentru acoperire uniformă',
                        'Folosirea de vopseluri și lacuri pe bază de apă sau poliuretanice',
                        'Posibilitatea de a crea efecte speciale (metalizat, texturat)',
                        'Durabilitate și rezistență la zgârieturi și pete'
                    ],
                    imageId: 'services-3'
                },
                 {
                    name: 'Montaj și Asistență Post-Vânzare',
                    description: 'Echipa noastră de montatori profesioniști se asigură că fiecare corp de mobilier este instalat perfect, cu atenție la detalii. Relația cu clienții noștri continuă și după finalizarea proiectului, oferind suport pentru orice ajustări necesare.',
                    features: [
                        'Echipă de montaj experimentată și atentă',
                        'Transport specializat pentru protecția mobilierului',
                        'Curățenie la finalul instalării',
                        'Ajustarea fină a ușilor și sertarelor',
                        'Garanție pentru manoperă și asistență post-garanție'
                    ],
                    imageId: 'services-4'
                }
            ],
            cta: {
                title: "Aveți un proiect în minte?",
                description: "Contactați-ne pentru o discuție fără obligații și o ofertă personalizată.",
                button: {
                    label: "Cere Ofertă Acum",
                    href: "/cerere-oferta"
                }
            }
        },
        portfolio: {
            intro: {
                badge: 'Proiecte Realizate',
                title: 'Portofoliul Nostru',
                description: 'Explorați o selecție de proiecte finalizate care demonstrează calitatea, atenția la detalii și versatilitatea soluțiilor noastre de mobilier la comandă.'
            },
            cta: {
                title: 'Transformați-vă viziunea în realitate',
                description: 'Suntem pregătiți să abordăm orice provocare de design și funcționalitate. Contactați-ne pentru a discuta despre proiectul dumneavoastră.',
                button: {
                    label: 'Începeți Proiectul',
                    href: '/cerere-oferta'
                }
            }
        },
        gallery: {
            intro: {
                badge: 'Inspirație',
                title: 'Galerie Mobilier',
                description: 'O colecție de imagini din proiectele noastre, menită să vă inspire și să vă prezinte diversitatea stilurilor și finisajelor pe care le putem realiza.'
            }
        },
        contact: {
            intro: {
                badge: 'Luați Legătura',
                title: 'Contactați-ne',
                description: 'Aveți o întrebare sau doriți să demarăm un proiect? Echipa noastră vă stă la dispoziție. Completați formularul sau folosiți datele de contact de mai jos.'
            },
            contactInfo: {
                title: 'Date de Contact',
                email: 'contact@carvello.ro',
                phone: '+40 720 123 456',
                address: {
                    line1: 'Str. Atelierului, Nr. 123',
                    line2: 'București, România'
                }
            },
            program: {
                title: 'Program',
                lines: [
                    'Luni - Vineri: 09:00 - 18:00',
                    'Sâmbătă: 10:00 - 14:00',
                    'Duminică: Închis'
                ]
            }
        },
    },
    galleryImages: [
        { id: 'gal-1', imageId: 'portfolio-1', hint: 'kitchen' },
        { id: 'gal-2', imageId: 'portfolio-2', hint: 'wardrobe' },
        { id: 'gal-3', imageId: 'portfolio-3', hint: 'living room' },
        { id: 'gal-4', imageId: 'portfolio-4', hint: 'kitchen island' },
        { id: 'gal-5', imageId: 'portfolio-5', hint: 'bathroom' },
        { id: 'gal-6', imageId: 'portfolio-6', hint: 'library' },
        { id: 'gal-7', imageId: 'portfolio-7', hint: 'bedroom' },
        { id: 'gal-8', imageId: 'portfolio-8', hint: 'office' },
    ]
}
