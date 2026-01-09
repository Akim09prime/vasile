
type PageHeaderProps = {
    badge: string;
    title: string;
    description: string;
};

export function PageHeader({ badge, title, description }: PageHeaderProps) {
    return (
        <section className="bg-secondary/50 py-20 md:py-24">
            <div className="container-max px-6 text-center">
                <p className="font-headline text-primary text-lg">{badge}</p>
                <h1 className="h1-headline mt-2 max-w-4xl mx-auto">{title}</h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg text-foreground/80 md:text-xl">
                    {description}
                </p>
            </div>
        </section>
    );
}
