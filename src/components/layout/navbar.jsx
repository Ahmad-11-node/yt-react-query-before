import { HeartIcon, LogOutIcon, MenuIcon, StoreIcon, UserIcon } from "lucide-react";
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

const navLinkClass = ({ isActive }) =>
  cn(
    "text-sm transition-colors hover:text-foreground",
    isActive ? "text-foreground font-medium" : "text-muted-foreground"
  );

export function Navbar() {
  const wishlist = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-1 px-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="rounded-md px-2 py-2 text-sm hover:bg-accent"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 font-semibold">
          <StoreIcon className="size-5 text-primary" />
          <span>Nova Store</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            asChild
            aria-label="Wishlist"
          >
            <Link to="/wishlist">
              <HeartIcon className="size-5" />
              {wishlist.count > 0 && (
                <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
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
                <Button variant="ghost" size="icon" aria-label="Account">
                  <Avatar className="size-7">
                    <AvatarImage src={user.image} alt={user.firstName} />
                    <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.firstName} {user.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                  <HeartIcon className="size-4" />
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOutIcon className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild aria-label="Sign in">
              <Link to="/login">
                <UserIcon className="size-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
