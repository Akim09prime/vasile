
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function ProcessGuaranteesPage() {
    
    const processSteps = [
        { name: "1. Consultanță Inițială", description: "Totul începe cu o discuție. Înțelegem viziunea, nevoile funcționale și constrângerile spațiului dumneavoastră. Măsurăm, analizăm și propunem soluții." },
        { name: "2. Proiectare & Randare 3D", description: "Transformăm ideile în imagini concrete. Creăm un model 3D detaliat al mobilierului, pe care îl puteți vizualiza din orice unghi. Alegem împreună materiale, culori și finisaje." },
        { name: "3. Execuție de Precizie", description: "Odată ce designul este aprobat, proiectul intră în producție. Utilajele CNC debitează și prelucrează componentele cu o acuratețe milimetrică, iar vopsitorii noștri aplică finisajele premium." },
        { name: "4. Montaj & Verificare Finală", description: "Echipa noastră de instalatori profesioniști asamblează mobilierul la locație, cu atenție maximă la detalii. La final, verificăm împreună fiecare aspect pentru a ne asigura de satisfacția dumneavoastră deplină." }
    ];

    const guarantees = [
        { name: "Garanția Materialelor", description: "Folosim doar materiale de la producători de renume (Egger, Kronospan, Fundermax) și feronerie premium (Blum, Hafele), oferind certificate de conformitate." },
        { name: "Garanția Calității Manoperei", description: "Oferim o garanție standard de 24 de luni pentru orice defect de fabricație sau montaj, demonstrând încrederea în calitatea muncii noastre." },
        { name: "Respectarea Termenelor", description: "Ne angajăm contractual să respectăm termenele de livrare și montaj agreate. Transparența și predictibilitatea sunt esențiale în relația cu clienții noștri." },
        { name: "Asistență Post-Vânzare", description: "Relația noastră nu se încheie la finalizarea montajului. Oferim suport pentru orice ajustări sau întrebări ulterioare, asigurându-ne că experiența CARVELLO este impecabilă." }
    ];


    return (
        <>
            <PageHeader
                badge="Metodologia Noastră"
                title="Proces și Garanții"
                description="Transparență, predictibilitate și încredere. Descoperiți pașii prin care transformăm o idee în realitate și angajamentul nostru pentru calitate."
            />

            <section className="section-padding container-max">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="h2-headline">Procesul Nostru de Lucru</h2>
                    <p className="mt-4 text-lg text-foreground/70">
                        Am rafinat un proces în 4 etape clare pentru a asigura o colaborare eficientă și un rezultat final care corespunde întocmai așteptărilor dumneavoastră.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {processSteps.map((step) => (
                        <Card key={step.name} className="bg-card/80 border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">{step.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground/70">{step.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            
            <section className="bg-secondary/50 section-padding">
                <div className="container-max">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="h2-headline">Angajamentul Nostru: Garanții</h2>
                        <p className="mt-4 text-lg text-foreground/70">
                            Construim nu doar mobilier, ci și relații de încredere. Angajamentul nostru pentru excelență este susținut de garanții solide.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {guarantees.map((item) => (
                             <div key={item.name} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <p className="text-foreground/70 mt-1">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
