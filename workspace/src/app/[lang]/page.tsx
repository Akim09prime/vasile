
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Check } from 'lucide-react';
import { getHomePageData } from '@/lib/services/page-service';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';
import * as React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion';


export default function Home({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const [dictionary, setDictionary] = React.useState<any>(null);
  
  React.useEffect(() => {
    getDictionary(lang).then(setDictionary);
  }, [lang]);

  const homePageData = getHomePageData();
  
  if (!homePageData || !dictionary) {
    return null;
  }

  const { hero, valuePillars, process, guarantees } = homePageData;
  const heroImage = hero?.image;
  const guaranteeImage = guarantees?.image;

  return (
    <>
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center text-center">
        {heroImage && (
           <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              sizes="100vw"
              className="object-cover -z-10"
              data-ai-hint={heroImage.imageHint}
              priority
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent dark:from-background/80 dark:via-background/50 dark:to-transparent" />
        
        <motion.div 
          className="container-max px-6 relative"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1 variants={fadeUp} className="h1-headline max-w-4xl mx-auto">
            {dictionary.pages.home.hero.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl mx-auto text-lg text-foreground/80 md:text-xl max-prose">
            {dictionary.pages.home.hero.subtitle}
          </motion.p>
          {hero?.cta &&
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                <Link href={`/${lang}${hero.cta.primary.href}`}>{dictionary.pages.home.hero.cta.primary}</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                <Link href={`/${lang}${hero.cta.secondary.href}`}>{dictionary.pages.home.hero.cta.secondary} <ArrowRight /></Link>
                </Button>
            </motion.div>
          }
        </motion.div>
      </section>

      {valuePillars && 
        <section className="section-padding container-max">
            <div className="text-center max-w-3xl mx-auto">
            <h2 className="h2-headline">{valuePillars.title}</h2>
            <p className="mt-4 text-lg text-foreground/70">
                {valuePillars.description}
            </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valuePillars.pillars.map((pillar) => (
                <Card key={pillar.title}>
                <CardHeader className="items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary mb-4" dangerouslySetInnerHTML={{ __html: pillar.icon }}>
                    </div>
                    <CardTitle className="font-heading text-xl">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground/70">{pillar.description}</p>
                </CardContent>
                </Card>
            ))}
            </div>
        </section>
      }

      {process && 
        <section className="bg-surface section-padding">
            <div className="container-max">
                <div className="text-center max-w-3xl mx-auto">
                    <p className="font-heading text-primary text-lg">{process.kicker}</p>
                    <h2 className="h2-headline mt-2">{process.title}</h2>
                    <p className="mt-4 text-lg text-foreground/70">
                        {process.description}
                    </p>
                </div>
                <div className="relative mt-16">
                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 hidden md:block" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {process.steps.map((step, index) => (
                            <div key={step.name} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-card border flex items-center justify-center font-heading text-primary relative z-10">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{step.name}</h3>
                                    <p className="text-foreground/70">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
      }

      {guarantees && 
        <section className="section-padding container-max">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                    {guaranteeImage && 
                        <Image
                            src={guaranteeImage.imageUrl}
                            alt={guaranteeImage.description}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            data-ai-hint={guaranteeImage.imageHint}
                        />
                    }
                </div>
                <div>
                    <p className="font-heading text-primary text-lg">{guarantees.kicker}</p>
                    <h2 className="h2-headline mt-2">{guarantees.title}</h2>
                    <p className="mt-4 text-lg text-foreground/70">
                        {guarantees.description}
                    </p>
                    <ul className="mt-8 space-y-3">
                        {guarantees.items.map((guarantee) => (
                            <li key={guarantee} className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-primary" />
                                <span className="text-foreground/90">{guarantee}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
      }

      <section className="bg-primary/5 text-center section-padding">
          <div className="container-max">
              <h2 className="h2-headline text-primary">Sunteți gata să începeți un proiect?</h2>
              <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                  Contactați-ne pentru o discuție fără obligații despre proiectul dumneavoastră de mobilier la comandă.
              </p>
              <div className="mt-8">
                  <Button size="lg" asChild>
                      <Link href={`/${lang}/cerere-oferta`}>Cere o ofertă personalizată</Link>
                  </Button>
              </div>
          </div>
      </section>
    </>
  );
}
