
import { PageHeader } from '@/components/layout/page-header';
import { Star, StarHalf } from 'lucide-react';

export default function ReviewsPage() {
    // Placeholder data until connected to a real reviews source
    const reviews = [
        { author: "Radu Ionescu", location: "București", rating: 5, text: "O experiență excepțională! De la proiectare la montaj, echipa CARVELLO a dat dovadă de un profesionalism desăvârșit. Mobilierul de bucătărie este exact cum l-am visat, iar calitatea finisajelor este impecabilă. Recomand cu toată încrederea!" },
        { author: "Andreea Popa", location: "Cluj-Napoca", rating: 5, text: "Am apelat la CARVELLO pentru un dressing complex și sunt extrem de mulțumită de rezultat. Optimizarea spațiului este genială, iar materialele sunt de cea mai bună calitate. Un partener de încredere pentru mobilier la comandă." },
        { author: "Mihai Constantinescu", location: "Timișoara", rating: 4.5, text: "Servicii de calitate și comunicare foarte bună pe tot parcursul proiectului. Au existat mici întârzieri, dar rezultatul final (mobilier de living) a meritat așteptarea. Precizia îmbinărilor și finisajul sunt la un alt nivel." }
    ];

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <div className="flex text-primary">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} fill="currentColor" className="w-5 h-5" />)}
                {halfStar && <StarHalf key="half" fill="currentColor" className="w-5 h-5" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5 text-muted-foreground/50" />)}
            </div>
        );
    };

    return (
        <>
            <PageHeader
                badge="Ce Spun Clienții"
                title="Recenziile Clienților Noștri"
                description="Satisfacția clienților este cea mai importantă validare a muncii noastre. Iată câteva dintre părerile celor care ne-au încredințat proiectele lor."
            />

            <section className="section-padding container-max">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="bg-card p-8 rounded-lg shadow-sm border border-border/50 flex flex-col">
                                <div className="flex-grow">
                                    <p className="text-foreground/80">"{review.text}"</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{review.author}</p>
                                            <p className="text-sm text-muted-foreground">{review.location}</p>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="col-span-full text-center py-16 bg-secondary/50 rounded-lg">
                            <h3 className="text-2xl font-headline">În curând</h3>
                            <p className="mt-2 text-muted-foreground">Colectăm feedback de la clienții noștri. Reveniți pentru a citi recenziile.</p>
                        </div>
                    )}
                 </div>
            </section>
        </>
    );
}
