import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Home, MenuIcon, Mic2, PlusCircle, Sparkles } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import party from "@/routes/party";
import { useState } from "react";

export default function Header() {
    const [isDrawerShown, setIsDrawerShown] = useState(false);
    const { url } = usePage();

    const isHome = url === "/";
    const isCreateParty = url.startsWith("/party/create");

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Brand Logo & Title */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-90 group"
                >
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <Mic2 className="size-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight font-sans">
                        Karaokie
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1.5">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                            isHome
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                    >
                        <Home className="size-4" />
                        <span>Home</span>
                    </Link>

                    <Button asChild variant={isCreateParty ? "default" : "outline"} size="sm" className="gap-2 shadow-xs ml-1">
                        <Link href={party.create()}>
                            <PlusCircle className="size-4" />
                            <span>Create Party</span>
                        </Link>
                    </Button>
                </nav>

                {/* Mobile Navigation Drawer */}
                <Drawer
                    direction="right"
                    open={isDrawerShown}
                    onClose={() => setIsDrawerShown(false)}
                    onOpenChange={setIsDrawerShown}
                >
                    <DrawerTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="size-9">
                            <MenuIcon className="size-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="p-4">
                        <DrawerHeader className="text-left px-2">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Mic2 className="size-4" />
                                </div>
                                <DrawerTitle className="text-lg font-bold">
                                    Karaokie
                                </DrawerTitle>
                            </div>
                        </DrawerHeader>

                        <div className="my-4 flex flex-col gap-2 px-2">
                            <Link
                                href="/"
                                onClick={() => setIsDrawerShown(false)}
                                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                    isHome
                                        ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                                        : "border-border/60 bg-card text-foreground hover:bg-accent"
                                }`}
                            >
                                <Home className="size-4" />
                                <span>Home</span>
                            </Link>

                            <Link
                                href={party.create()}
                                onClick={() => setIsDrawerShown(false)}
                                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                    isCreateParty
                                        ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                                        : "border-border/60 bg-card text-foreground hover:bg-accent"
                                }`}
                            >
                                <PlusCircle className="size-4 text-primary" />
                                <span>Create Party</span>
                            </Link>
                        </div>

                        <DrawerFooter className="px-2">
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full">
                                    Close Menu
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </header>
    );
}

