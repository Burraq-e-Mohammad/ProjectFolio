import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Code, 
  ShoppingBag, 
  Plus, 
  User, 
  LogOut,
  ShoppingCart,
  Settings,
  Mail,
  CreditCard
} from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Why Us", href: "/why-us" },
    { name: "Instructions", href: "/instructions" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-tech-purple">
            <Code className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-tech-purple bg-clip-text text-transparent">
            ProjectFolio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" asChild>
                  <Link to="/payment-orders">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Orders
                  </Link>
                </Button>
                
                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.firstName?.charAt(0).toUpperCase() || user?.lastName?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-projects">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Projects
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">
                    Login
                  </Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/register">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
            
            <Button variant="hero" size="sm" asChild>
              <Link to="/post-ad">
                <Plus className="mr-2 h-4 w-4" />
                Post Ad
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                                <div className="pt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/cart">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Cart
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/payment-orders">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Payment Orders
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/my-projects">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          My Projects
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/login">
                          Login
                        </Link>
                      </Button>
                      <Button variant="hero" className="w-full justify-start" asChild>
                        <Link to="/register">
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                  
                  <Button variant="hero" className="w-full justify-start" asChild>
                    <Link to="/post-ad">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Ad
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;