
import Image from 'next/image';
import { getServicesPageData } from '@/lib/services/page-service';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';

export default async function ServicesPage({ params }: { params: Promise<{ lang: Locale }>}) {
    const { lang } = await params;
    const servicesPageData = getServicesPageData();
    
    if (!servicesPageData) {
        return null;
    }
    
    const { intro, services, cta } = servicesPageData;

    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max space-y-20">
                {services.map((service, index) => (
                    <div key={service.name} className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className={`relative h-96 md:h-[500px] rounded-lg overflow-hidden group ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                            {service.image && 
                                <Image
                                    src={service.image.imageUrl}
                                    alt={service.image.description}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    data-ai-hint={service.image.imageHint}
                                />
                            }
                        </div>
                        <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                            <h2 className="h2-headline">{service.name}</h2>
                            <p className="mt-4 text-lg text-foreground/80">{service.description}</p>
                            <ul className="mt-8 space-y-4">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </section>
            
            <section className="bg-primary/5 text-center section-padding">
                <div className="container-max">
                    <h2 className="h2-headline text-primary">{cta.title}</h2>
                    <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                        {cta.description}
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href={`/${lang}${cta.button.href}`}>{cta.button.label}</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
