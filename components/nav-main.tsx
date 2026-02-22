"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

type NavItem = {
  title?: string;
  name?: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    subitems?: {
      title: string;
      url: string;
    }[];
  }[];
};

type NavMainContextType = {
  activeItem: NavItem | null;
  setActiveItem: (item: NavItem | null) => void;
};

const NavMainContext = React.createContext<NavMainContextType>({
  activeItem: null,
  setActiveItem: () => {},
});

function NestedSidebarPanel() {
  const { activeItem, setActiveItem } = React.useContext(NavMainContext);
  const [mounted, setMounted] = React.useState(false);
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeItem || !activeItem.items?.length) return null;

  const panel = (
    <div
      className="fixed right-[calc(var(--sidebar-width-icon)+1px)] top-0 z-9999 flex h-screen w-56 flex-col border-l border-sidebar-border bg-sidebar shadow-xl"
      style={{
        ["--sidebar-width-icon" as string]: "3rem",
      }}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          {activeItem.icon && (
            <activeItem.icon className="h-4 w-4 text-sidebar-foreground" />
          )}
          <span className="text-sm font-semibold text-sidebar-foreground">
            {activeItem.title}
          </span>
        </div>
        <button
          onClick={() => setActiveItem(null)}
          className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Submenu items */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {activeItem.items?.map((item) => {
            const isOpen = openKey === item.title;

            return item.subitems ? (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={(open) => setOpenKey(open ? item.title : null)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <ChevronRight className="mr-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      <span className="text-sm font-semibold text-sidebar-foreground">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 flex flex-col gap-1">
                      {item.subitems.map((subitem) => {
                        const isActive = pathname === subitem.url;
                        return (
                          <SidebarMenuSubItem key={subitem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className="flex justify-end"
                              isActive={isActive}
                            >
                              <Link href={subitem.url}>
                                <span className="text-sm text-sidebar-foreground">
                                  {subitem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuSubItem key={item.title}>
                <SidebarMenuSubButton
                  asChild
                  className="flex justify-end"
                  isActive={pathname === item.url}
                >
                  <Link href={item.url}>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return createPortal(panel, document.body);
}

function NavItemCollapsed({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const hasSubItems = item.items && item.items.length > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        asChild={!hasSubItems}
        onClick={hasSubItems ? onClick : undefined}
        data-active={isActive}
        className="data-[active=true]:bg-sidebar-accent"
      >
        {hasSubItems ? (
          <>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </>
        ) : (
          <Link href={item.url} className="flex items-center gap-2">
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavSubItem({
  item,
}: {
  item: {
    title: string;
    url: string;
    subitems?: { title: string; url: string }[];
  };
}) {
  const pathname = usePathname();
  const hasActiveChild = item.subitems?.some((s) => pathname === s.url);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  if (item.subitems && item.subitems.length > 0) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group/subcollapsible"
      >
        <SidebarMenuSubItem>
          <CollapsibleTrigger asChild>
            {/* Highlight the group header if a child is active */}
            <SidebarMenuSubButton
              className="flex justify-between"
              isActive={!!hasActiveChild}
            >
              <ChevronRight className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
              <span>{item.title}</span>
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mr-3 mt-1 flex flex-col gap-1 border-r border-sidebar-border pr-2">
              {item.subitems.map((subitem) => {
                const isActive = pathname === subitem.url;
                return (
                  <SidebarMenuSubItem key={subitem.title}>
                    <SidebarMenuSubButton
                      asChild
                      className="flex justify-end"
                      isActive={isActive}
                    >
                      <Link href={subitem.url}>
                        <span>{subitem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </ul>
          </CollapsibleContent>
        </SidebarMenuSubItem>
      </Collapsible>
    );
  }

  const isActive = pathname === item.url;
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        className="flex justify-end"
        isActive={isActive}
      >
        <Link href={item.url}>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function NavItemExpanded({ item }: { item: NavItem }) {
  const pathname = usePathname();

  const hasActiveDescendant = item.items?.some(
    (sub) =>
      pathname === sub.url || sub.subitems?.some((s) => pathname === s.url),
  );

  const [isOpen, setIsOpen] = React.useState(
    item.isActive || hasActiveDescendant || false,
  );

  React.useEffect(() => {
    if (hasActiveDescendant) setIsOpen(true);
  }, [hasActiveDescendant]);

  const hasSubItems = item.items && item.items.length > 0;
  const isDirectlyActive = pathname === item.url;

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {hasSubItems ? (
            // Highlight the parent button when a child route is active
            <SidebarMenuButton
              tooltip={item.title}
              isActive={!!hasActiveDescendant}
            >
              <ChevronRight className="mr-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              <span>{item.title}</span>
              {item.icon && <item.icon />}
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              className="flex justify-end"
              isActive={isDirectlyActive}
            >
              <Link href={item.url}>
                <span>{item.title}</span>
                {item.icon && <item.icon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {hasSubItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <NavSubItem key={subItem.title} item={subItem} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { state } = useSidebar();
  const [activeItem, setActiveItem] = React.useState<NavItem | null>(null);
  const isCollapsed = state === "collapsed";

  React.useEffect(() => {
    if (!isCollapsed) {
      setActiveItem(null);
    }
  }, [isCollapsed]);

  const handleItemClick = (item: NavItem) => {
    if (activeItem?.title === item.title) {
      setActiveItem(null);
    } else {
      setActiveItem(item);
    }
  };

  return (
    <NavMainContext.Provider value={{ activeItem, setActiveItem }}>
      <SidebarGroup>
        <SidebarGroupLabel className="items-center">
          <p className="text-right w-full">بەشە ناوخۆیی</p>
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) =>
            isCollapsed ? (
              <NavItemCollapsed
                key={item.title}
                item={item}
                isActive={activeItem?.title === item.title}
                onClick={() => handleItemClick(item)}
              />
            ) : (
              <NavItemExpanded key={item.title} item={item} />
            ),
          )}
        </SidebarMenu>
      </SidebarGroup>
      {isCollapsed && <NestedSidebarPanel />}
    </NavMainContext.Provider>
  );
}
