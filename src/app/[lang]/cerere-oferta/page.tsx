'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createLead } from '@/lib/services/lead-service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    name: z.string().min(3, "Numele este obligatoriu."),
    email: z.string().email("Adresa de email nu este validă."),
    phone: z.string().min(10, "Numărul de telefon este obligatoriu."),
    city: z.string().min(2, "Localitatea este obligatorie."),
    projectType: z.string({ required_error: "Selectați un tip de proiect."}),
    budget: z.string().optional(),
    message: z.string().min(10, "Vă rugăm oferiți câteva detalii despre proiect.").max(2000),
});

type FormData = z.infer<typeof formSchema>;


export default function QuotePage() {
    const { toast } = useToast();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            city: "",
            budget: "",
            message: ""
        }
    });

    const { isSubmitting } = form.formState;

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const leadId = await createLead(data);
        if (leadId) {
            form.reset();
            toast({
                title: 'Cerere trimisă cu succes!',
                description: 'Vă mulțumim! Vă vom contacta în cel mai scurt timp.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Eroare la trimiterea cererii',
                description: 'A apărut o problemă. Vă rugăm să încercați din nou mai târziu.',
            });
        }
    };

    return (
        <>
            <PageHeader
                badge="Începe un Proiect"
                title="Cere o Ofertă Personalizată"
                description="Completați formularul de mai jos cu cât mai multe detalii despre proiectul dumneavoastră, iar noi vom reveni cu o estimare de preț și o propunere de colaborare."
            />

            <section className="section-padding container-max">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Detalii Proiect</CardTitle>
                        <CardDescription>Informațiile ne ajută să înțelegem mai bine nevoile dumneavoastră.</CardDescription>
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
                                                <FormLabel>Nume complet</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nume și Prenume" {...field} />
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
                                                <FormLabel>Adresă de Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="email@exemplu.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                     <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Număr de Telefon</FormLabel>
                                                <FormControl>
                                                    <Input type="tel" placeholder="+40 7xx xxx xxx" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Localitate</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="București" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="projectType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tip Proiect</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selectează tipul de proiect" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="bucatarie">Bucătărie</SelectItem>
                                                        <SelectItem value="dressing">Dressing / Dulap</SelectItem>
                                                        <SelectItem value="living">Mobilier Living</SelectItem>
                                                        <SelectItem value="baie">Mobilier Baie</SelectItem>
                                                        <SelectItem value="birou">Mobilier Birou</SelectItem>
                                                        <SelectItem value="comercial">Spațiu Comercial</SelectItem>
                                                        <SelectItem value="altul">Alt Tip</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Buget Estimativ (Opțional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ex: 5000 EUR" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrierea Proiectului</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Oferiți cât mai multe detalii: dimensiuni, materiale preferate, finisaje, funcționalități dorite, etc." rows={8} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid gap-2">
                                    <Label htmlFor="files">Atașamente (Funcționalitate în curând)</Label>
                                    <Input id="files" type="file" multiple disabled />
                                    <p className="text-xs text-muted-foreground">Puteți atașa schițe, imagini de inspirație, planuri, etc. (max 5 fișiere)</p>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? 'Se trimite...' : 'Trimite Cererea'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </section>
        </>
    );
}
