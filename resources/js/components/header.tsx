import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {Button} from "@/components/ui/button";
import {MenuIcon} from "lucide-react";
import {NavigationMenu} from "@/components/ui/navigation-menu";
import {Link} from "@inertiajs/react";
import party from "@/routes/party";
import {useState} from "react";

export default function Header() {

    const [isDrawerShown, setIsDrawerShown] = useState(false);

    return <header className="shadow-sm border-b border-gray-200/10">
        <div className="container mx-auto py-4 px-2 flex justify-between">
            <h2 className="tracking-tighter font-bold text-lg md:text-2xl ">Karaokie</h2>
            <div className="max-md:hidden flex flex-1 gap-4 justify-end items-center *:hover:bg-foreground/10 *:p-1 *:rounded-sm">
                <Link href={'/'} >Home</Link>
                <Link href={party.create()} >Create Party</Link>
            </div>
            <Drawer direction="right" open={isDrawerShown} onClose={() => setIsDrawerShown(false)} onOpenChange={setIsDrawerShown}>
                <DrawerTrigger className="md:hidden" >
                    <MenuIcon />
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="text-center text-lg">Karaokie</DrawerTitle>
                        <hr/>
                    </DrawerHeader>
                    <div className="flex flex-col gap-2 px-6 *:bg-foreground/5 *:border *:p-2 *:rounded-md ">
                        <Link href={'/'} onClick={() => setIsDrawerShown(false)}>Home</Link>
                        <Link href={party.create()} onClick={() => setIsDrawerShown(false)}>Create Party</Link>
                    </div>
                    <DrawerFooter>
                        <DrawerClose>Close</DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    </header>
}
