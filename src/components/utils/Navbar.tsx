import { useReadContract } from "thirdweb/react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { client, contract } from "@/client";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import Logo from "../../assets/blockchain_logo.png";

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
  Dashboard?: {
    login: {
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
      title: "How it works",
      url: "/how-it-works",
    },
  ],
  Dashboard = {
    login: { text: "Admin Dashboard", url: "/admin-dashboard" },
  },
}: NavbarProps) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const account = useActiveAccount();
  const addr = account?.address; // Safely access address, will be undefined if no account

  const { data: isSuperAdmin, isPending: isSuperAdminPending } = useReadContract({
    contract,
    method: "function isSuperAdmin(address addr) view returns (bool)",
    params: [addr!], // Non-null assertion since query is disabled when addr is undefined
    queryOptions: {
      enabled: !!addr, 
    },
  });

  const { data: isAdmin, isPending: isAdminPending } = useReadContract({
    contract,
    method: "function isAdmin(address addr) view returns (bool)",
    params: [addr!], // Non-null assertion since query is disabled when addr is undefined
    queryOptions: {
      enabled: !!addr, 
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show dashboard button only if user is admin or superadmin and address is defined
  const showDashboardButton =
    addr && !isSuperAdminPending && !isAdminPending && (isSuperAdmin || isAdmin);

  return (
    <section
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent bg-neutral-950/60 py-4 transition-all duration-300 supports-[backdrop-filter]:backdrop-blur-xl",
        hasScrolled && "bg-neutral-950/85 border-white/10 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.9)]"
      )}
    >
      <div className="container relative mx-auto max-w-screen-xl px-5">
        <div className="pointer-events-none absolute inset-0 border border-white/5 mix-blend-overlay" />
        {/* Desktop Menu */}
        <nav className="relative hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-32 h-12 object-contain" alt={logo.alt} />
            </a>
            <div className="flex items-center font-serif">
              <NavigationMenu>
                <NavigationMenuList>{menu.map((item) => renderMenuItem(item))}</NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
    <div className="flex gap-3 font-pt-serif">
      {showDashboardButton && (
        <Button className="py-6 px-3 text-sm font-semibold">
          <a href={Dashboard.login.url}>{Dashboard.login.text}</a>
        </Button>
      )}
      <ConnectButton
              client={client}
              theme={darkTheme({
                colors: {
                  accentText: "hsl(216, 100%, 60%)",
                  borderColor: "hsl(229, 11.70%, 64.90%)",
                  primaryText: "hsl(240, 100.00%, 97.50%)",
                  secondaryIconColor: "hsl(251, 4%, 50%)",
                },
              })}
              appMetadata={{
                name: "Example app",
                url: "https://example.com",
              }}
            />
          </div>
        </nav>
        {/* Mobile Menu */}
        <div className="relative block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-32 h-12 object-contain" alt={logo.alt} />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4 text-neutral-950 hover:text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto border border-white/10 bg-neutral-950/95 backdrop-blur-xl">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img src={logo.src} className="w-32 h-12 object-contain" alt={logo.alt} />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="flex flex-col gap-3">
                    {showDashboardButton && (
                      <Button className="py-6 px-2 text-sm font-semibold">
                        <a href={Dashboard.login.url}>{Dashboard.login.text}</a>
                      </Button>
                    )}
                    <ConnectButton
                      client={client}
                      theme={darkTheme({
                        colors: {
                          accentText: "hsl(216, 100%, 60%)",
                          borderColor: "hsl(229, 13%, 17%)",
                          primaryText: "hsl(240, 6%, 94%)",
                          secondaryIconColor: "hsl(251, 4%, 50%)",
                        },
                      })}
                      appMetadata={{
                        name: "Example app",
                        url: "https://example.com",
                      }}
                    />
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

// renderMenuItem and renderMobileMenuItem functions remain unchanged
const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
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
      className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:text-primary"
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
    <a key={item.title} href={item.url} className="text-md font-semibold text-white transition-colors hover:text-primary hover:no-underline">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 text-white rounded-md p-3 leading-none no-underline transition-colors bg-neutral-950 outline-none select-none"
      href={item.url}
    >
      <div>{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && <p className="text-sm leading-snug">{item.description}</p>}
      </div>
    </a>
  );
};

export { Navbar };
