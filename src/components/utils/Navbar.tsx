import { Menu, ChevronRight, MessageCircleQuestion } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Userprofile from "./Userprofile";
import Logo from "../../assets/blockchain_logo.png"


interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}

interface NavbarProps {
    logo?: {
        url: string;
        src: string;
        alt: string;
    };
    menu?: MenuItem[];
    mobileExtraLinks?: {
        name: string;
        url: string;
    }[];
    auth?: {
        login: {
            text: string;
            url: string;
        };
        startcampaign: {
            text: string;
            url: string;
        };
    };
}


const Navbar = ({
    logo = {
        url: "/",
        src: Logo,
        alt: "logo",
    },
    menu = [
        {
            title: "Results",
            url: "/results",

        },
        {
            title: "About",
            url: "#",
            items: [
                {
                    title: "How it works",
                    description: "Step-by-step help, examples, and more",
                    icon: <MessageCircleQuestion className="size-5 shrink-0" />,
                    url: "/how-it-works",
                },
            ],
        },
    ],
    auth = {
        login: { text: "Log in", url: "/auth/login" },
        startcampaign: { text: "Cast your vote", url: "/auth/login" },
    },
}: NavbarProps) => {
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <section className={`py-4 sticky top-0 z-40 w-full bg-white transition-all ${hasScrolled ? "border-b border-gray-100 shadow-sm" : "border-b-0"
            }`}>
            <div className="container max-w-screen-xl px-5 mx-auto">
                {/* Desktop Menu */}
                <nav className="hidden justify-between lg:flex">
                    <div className="flex items-center gap-6">
                        <a href={logo.url} className="flex items-center gap-2">
                            <img src={logo.src} className="w-32 h-12 object-contain" alt={logo.alt} />
                        </a>
                        <div className="flex items-center font-serif text-neutral-900">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {menu.map((item) => renderMenuItem(item))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>
                    <div className="flex gap-2 font-pt-serif">
                        <Button asChild variant="outline" size="sm">
                            <a href={auth.login.url}>{auth.login.text}</a>
                        </Button>
                        <Button asChild size="sm">
                            <a href={auth.startcampaign.url}>{auth.startcampaign.text}</a>
                        </Button>
                        <Userprofile />
                    </div>
                </nav>
                {/* Mobile Menu */}
                <div className="block lg:hidden">
                    <div className="flex items-center justify-between">
                        <a href={logo.url} className="flex items-center gap-2">
                            <img src={logo.src} className="w-32 h-12 object-contain" alt={logo.alt} />
                        </a>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="size-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>
                                        <a href={logo.url} className="flex items-center gap-2">
                                            <img src={logo.src} className="w-32 h-12 object-contain" alt={logo.alt} />
                                        </a>
                                    </SheetTitle>
                                </SheetHeader>
                                <Card className="border-none shadow-none">
                                    <CardContent className="flex flex-col items-center text-center">
                                        <Avatar className="w-20 h-20">
                                            <AvatarImage src="/path-to-image.jpg" alt="Joseph Melvin Kanu" />
                                            <AvatarFallback>JM</AvatarFallback>
                                        </Avatar>
                                        <h2 className="mt-2 text-sm sm:text-lg font-Lora font-semibold">Joseph Melvin Kanu</h2>
                                        <a href="/my-profile"><Button variant="link" >Profile <ChevronRight size={16} /></Button></a>
                                    </CardContent>
                                </Card>
                                <Separator />
                                <div className="flex flex-col gap-6 p-4">
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="flex w-full flex-col gap-4"
                                    >
                                        {menu.map((item) => renderMobileMenuItem(item))}
                                    </Accordion>

                                    <div className="flex flex-col gap-3">
                                        <Button asChild variant="outline">
                                            <a href={auth.login.url}>{auth.login.text}</a>
                                        </Button>
                                        <Button asChild>
                                            <a href={auth.startcampaign.url}>{auth.startcampaign.text}</a>
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </section>
    );
};

const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <NavigationMenuItem key={item.title} className="text-muted-foreground">
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <div className="grid w-[100px] gap-2 p-4 md:w-[200px] lg:w-[300px]">
                        {item.items.map((subItem) => (
                            <NavigationMenuLink asChild key={subItem.title} className="w-80">
                                <SubMenuLink item={subItem} />
                            </NavigationMenuLink>
                        ))}
                    </div>
                </NavigationMenuContent>
            </NavigationMenuItem>
        );
    }

    return (
        <a
            key={item.title}
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
            href={item.url}
        >
            {item.title}
        </a>
    );
};

const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <AccordionItem key={item.title} value={item.title} className="border-b-0">
                <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent className="mt-2">
                    {item.items.map((subItem) => (
                        <SubMenuLink key={subItem.title} item={subItem} />
                    ))}
                </AccordionContent>
            </AccordionItem>
        );
    }

    return (
        <a key={item.title} href={item.url} className="text-md font-semibold">
            {item.title}
        </a>
    );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
    return (
        <a
            className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
            href={item.url}
        >
            <div>{item.icon}</div>
            <div>
                <div className="text-sm font-semibold">{item.title}</div>
                {item.description && (
                    <p className="text-sm leading-snug text-muted-foreground">
                        {item.description}
                    </p>
                )}
            </div>
        </a>
    );
};

export { Navbar };
