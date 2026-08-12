import { HeartIcon, MenuIcon, UserIcon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { CartSheet } from "@/components/cart/cart-sheet";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { useWishlist } from "@/store/wishlist-context";

const links = [
  { to: "/products", label: "Shop" },
  { to: "/infinite", label: "Infinite" },
  { to: "/patterns", label: "Patterns" },
];

export function Navbar() {
  const wishlist = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader className="border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-0.5 p-2">
              {links.map((link) => (
                <SheetClose asChild key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                        isActive && "bg-accent font-medium"
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          className="mr-2 text-sm font-semibold tracking-tight sm:mr-6"
        >
          Cachely
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/wishlist" aria-label={`Wishlist, ${wishlist.count} items`}>
              <HeartIcon />
              {wishlist.count > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-[10px] tabular-nums">
                  {wishlist.count}
                </Badge>
              )}
            </Link>
          </Button>

          <CartSheet />
          <ModeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                  <Avatar className="size-6">
                    <AvatarImage src={user.image} alt="" />
                    <AvatarFallback className="text-[10px]">
                      {user.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/login" aria-label="Sign in">
                <UserIcon />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
