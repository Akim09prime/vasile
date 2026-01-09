
import Image from 'next/image';
import { getAboutPageData } from '@/lib/services/page-service';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
    const aboutData = getAboutPageData();
    
    if (!aboutData) {
        return null;
    }

    const { intro, mission, values, images } = aboutData;
    const aboutImage1 = images?.aboutImage1;
    const aboutImage2 = images?.aboutImage2;

    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="space-y-6 text-lg text-foreground/80">
                        <h2 className="h2-headline">{mission.title}</h2>
                        <p>{mission.p1}</p>
                        <p>{mission.p2}</p>
                    </div>
                    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden group">
                         {aboutImage1 && 
                            <Image
                                src={aboutImage1.imageUrl}
                                alt={aboutImage1.description}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint={aboutImage1.imageHint}
                            />
                        }
                    </div>
                </div>
            </section>
            
            <section className="bg-secondary/50 section-padding">
                <div className="container-max">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="h2-headline">{values.title}</h2>
                        <p className="mt-4 text-lg text-foreground/70">
                            {values.description}
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.items.map((item) => (
                            <Card key={item.name} className="bg-card/80 border-border/50 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-6">
                                <CheckCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                                <h3 className="font-headline text-xl mb-2">{item.name}</h3>
                                <p className="text-foreground/70 text-sm">{item.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
             <section className="section-padding container-max">
                <div className="relative h-[500px] rounded-lg overflow-hidden">
                    {aboutImage2 && 
                        <Image
                            src={aboutImage2.imageUrl}
                            alt={aboutImage2.description}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            data-ai-hint={aboutImage2.imageHint}
                        />
                    }
                     <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                </div>
            </section>
        </>
    );
}
