import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import party from "@/routes/party";
import {
    ArrowRight,
    ListMusic,
    Mic2,
    Music,
    PlusCircle,
    Radio,
    Sparkles,
    Users,
} from "lucide-react";

export default function Welcome() {
    return (
        <>
            <Head title="Karaokie - Host Live Karaoke Parties" />

            <div className="flex flex-col min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

                    <div className="container mx-auto max-w-5xl px-4 text-center relative z-10">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                            Host & Sing Together with <br className="hidden sm:inline" />
                            <span className="text-primary bg-clip-text">Live Karaoke Queues</span>
                        </h1>

                        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
                            Create a party room in seconds. Let your guests search YouTube and queue up their favorite tracks from their phones in real time!
                        </p>

                        {/* Prominent Call To Action */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-semibold gap-2.5 shadow-xl transition-all hover:scale-105">
                                <Link href={party.create()}>
                                    <PlusCircle className="size-5" />
                                    <span>Create Your Party Now</span>
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Simple 3-Feature Section */}
                <section className="py-12 bg-muted/30 border-y border-border/40">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Everything You Need for Karaoke Night
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Simple, fast, and interactive music queueing for hosts and guests.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 border-border/60 shadow-xs transition-all hover:border-primary/40 hover:shadow-md">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Radio className="size-6" />
                                </div>
                                <h3 className="font-semibold text-lg tracking-tight mb-2">
                                    Real-Time Queue
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Host controls video playback on the main TV or screen while guest requests update instantly.
                                </p>
                            </Card>

                            <Card className="p-6 border-border/60 shadow-xs transition-all hover:border-primary/40 hover:shadow-md">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Music className="size-6" />
                                </div>
                                <h3 className="font-semibold text-lg tracking-tight mb-2">
                                    YouTube Track Search
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Guests can search millions of YouTube songs, preview videos, and queue tracks effortlessly.
                                </p>
                            </Card>

                            <Card className="p-6 border-border/60 shadow-xs transition-all hover:border-primary/40 hover:shadow-md">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Users className="size-6" />
                                </div>
                                <h3 className="font-semibold text-lg tracking-tight mb-2">
                                    Easy Link & PIN Share
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Share party links with auto-filled PINs so friends can join instantly without registration.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Bottom Call To Action Banner */}
                <section className="py-16 md:py-20 mt-auto">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <Card className="p-8 md:p-12 border-primary/20 bg-linear-to-br from-primary/5 via-card to-card shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <Mic2 className="size-7" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                    Ready to get the party started?
                                </h2>
                                <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-md">
                                    Set up your party room in under 30 seconds and start queueing songs right away!
                                </p>
                                <Button asChild size="lg" className="mt-6 h-12 px-8 font-semibold gap-2 shadow-md">
                                    <Link href={party.create()}>
                                        <PlusCircle className="size-5" />
                                        <span>Create a Party</span>
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}

