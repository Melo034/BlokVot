import * as React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Logo from "@/assets/blockchain_logo.png"
import { LayoutDashboard, ClipboardList, Users, UserPlus, Settings } from "lucide-react"


// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Polls Management",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Create Poll",
          url: "/admin-dashboard/polls/create",
        },
        {
          title: "Start Poll",
          url: "/admin-dashboard/polls/start",
        },
        {
          title: "Manage Polls",
          url: "/admin-dashboard/polls/manage",
        },
      ],
    },
    {
      title: "Candidates Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Add Candidate",
          url: "/admin-dashboard/candidates/add",
        },
        {
          title: "Manage Candidates",
          url: "/admin-dashboard/candidates/manage",
        }
      ],
    },
    {
      title: "Voter Management",
      url: "#",
      icon: UserPlus,
      items: [
        {
          title: "Add Voter",
          url: "/admin-dashboard/voters/add",
        },
        {
          title: "Manage Voters",
          url: "/admin-dashboard/voters/manage",
        },
      ],
    },
    {
      title: "Admin Management",
      url: "#",
      icon: UserPlus,
      items: [
        {
          title: "Add Admin",
          url: "/admin-dashboard/admins/add",
        },
      ],
    },
    {
      title: "System Settings",
      url: "/admin-dashboard/settings",
      icon: Settings,
    },
  ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const currentPath = location.pathname
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="justify-center pt-20 pb-15">
              <a href="/admin-dashboard" className="flex items-center justify-center">
                <div className="flex flex-col gap-0.5 leading-none">
                  <img src={Logo} className="w-32 h-48 object-contain" alt="logo" />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => {
              const isMainActive = item.url !== "#" && currentPath === item.url

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isMainActive}>
                    {item.url !== "#" ? (
                      <Link
                        to={item.url}
                        className={`flex items-center text-sm font-medium rounded-md px-3 py-1.5 transition-colors duration-200 ${isMainActive ? "bg-white text-black" : "text-white hover:text-neutral-300"
                          }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                        {item.title}
                      </Link>
                    ) : (
                      <span className="flex items-center text-sm font-medium text-white px-3 py-1.5">
                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                        {item.title}
                      </span>
                    )}
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = currentPath === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link
                                to={subItem.url}
                                className={`${isSubActive ? "text-black bg-white" : "text-white hover:text-neutral-300"}`}
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
