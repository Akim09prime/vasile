
'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getContactPageData } from '@/lib/services/page-service';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createContactMessage } from '@/lib/services/contact-service';

const formSchema = z.object({
    name: z.string().min(3, "Numele este obligatoriu."),
    email: z.string().email("Adresa de email nu este validă."),
    subject: z.string().min(5, "Subiectul este obligatoriu."),
    message: z.string().min(10, "Vă rugăm introduceți un mesaj de cel puțin 10 caractere.").max(1500),
});

type FormData = z.infer<typeof formSchema>;


export default function ContactPage() {
    const { toast } = useToast();
    const { intro, contactInfo, program } = getContactPageData();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: ""
        }
    });

    const { isSubmitting } = form.formState;

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const messageId = await createContactMessage(data);
        if (messageId) {
            form.reset();
            toast({
                title: 'Mesaj trimis cu succes!',
                description: 'Vă mulțumim! Vă vom răspunde în cel mai scurt timp.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Eroare la trimiterea mesajului',
                description: 'A apărut o problemă. Vă rugăm să încercați din nou mai târziu.',
            });
        }
    };


    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Formular de Contact</CardTitle>
                                <CardDescription>Trimite-ne un mesaj și îți vom răspunde în cel mai scurt timp.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nume</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Numele tău" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="email@exemplu.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                         <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subiect</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Subiectul mesajului" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mesaj</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Scrie mesajul tău aici..." rows={6} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? 'Se trimite...' : 'Trimite Mesajul'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>{contactInfo.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">{contactInfo.email}</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-primary" />
                                    <a href={`tel:${contactInfo.phone}`} className="hover:text-primary transition-colors">{contactInfo.phone}</a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p>{contactInfo.address.line1}</p>
                                        <p className="text-muted-foreground">{contactInfo.address.line2}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle>{program.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {program.lines.map(line => (
                                    <div key={line} className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        <p>{line}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </>
    );
}
