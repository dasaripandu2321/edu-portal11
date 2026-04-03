'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GraduationCap, Route, Sparkles, Book, Languages, Database, Wrench, Menu, User, LogOut, LogIn, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '/languages', label: 'Programming Languages', icon: Languages },
  { href: '/databases', label: 'Databases', icon: Database },
  { href: '/career-paths', label: 'Career Paths', icon: Route },
  { href: '/tools', label: 'Tools Explorer', icon: Wrench },
  { href: '/project-generator', label: 'Project Generator', icon: Sparkles },
  { href: '/summarizer', label: 'AI Summarizer', icon: Book },
  { href: '/chat', label: 'Community Chat', icon: MessageCircle },
];

export function Header() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-violet-100 dark:border-violet-900/30 sticky top-0 z-50 shadow-sm shadow-violet-100/50 dark:shadow-violet-900/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <GraduationCap className="h-8 w-8 text-violet-600 group-hover:text-cyan-500 transition-colors duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-300"></div>
          </div>
          <span className="text-2xl font-bold font-headline bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Edu Portal
          </span>
        </Link>
        
        {/* Desktop Navigation — only show when logged in */}
        <nav className="hidden md:flex items-center gap-1">
          {user && !loading && (<>
          <Button asChild variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-300">
            <Link href="/languages" className="flex items-center gap-2">
              <Languages className="transition-transform duration-300 group-hover:scale-110"/> Programming Languages
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all duration-300">
            <Link href="/databases">Databases</Link>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300">
            <Link href="/career-paths" className="flex items-center gap-2">
              <Route className="transition-transform duration-300 group-hover:scale-110"/> Career Paths
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/40 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 transition-all duration-300">
            <Link href="/tools">Tools Explorer</Link>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-300">
            <Link href="/project-generator" className="flex items-center gap-2">
              <Sparkles className="transition-transform duration-300 group-hover:scale-110"/> Project Generator
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all duration-300">
            <Link href="/summarizer" className="flex items-center gap-2">
              <Book className="transition-transform duration-300 group-hover:scale-110"/> AI Summarizer
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-300">
            <Link href="/chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Community Chat
            </Link>
          </Button>
          </>)}

          {/* Authentication Section */}
          <div className="flex items-center gap-2 ml-2">
            <ThemeToggle />
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                          <AvatarFallback>
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {user.displayName && (
                            <p className="font-medium">{user.displayName}</p>
                          )}
                          {user.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="outline" size="sm" className="border-violet-300 hover:bg-violet-50 hover:border-violet-500 dark:border-violet-700 dark:hover:bg-violet-950/50 transition-all">
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          
          {/* Mobile Auth */}
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.displayName && (
                          <p className="font-medium">{user.displayName}</p>
                        )}
                        {user.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                        <Button asChild variant="outline" size="sm" className="border-violet-300 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-950/50">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-200 hover:border-purple-300 transition-all duration-300">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-violet-100 dark:border-violet-900/30">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {user && navLinks.map((link, index) => (
                  <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl p-3 text-lg font-medium text-muted-foreground transition-all hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 animate-slide-in-right",
                          pathname === link.href && "bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950/60 dark:to-indigo-950/60 text-violet-700 dark:text-violet-300"
                        )}
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                  </SheetClose>
                ))}
                
                {/* Mobile Auth in Sheet */}
                {user && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                          <AvatarFallback>
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          {user.displayName && (
                            <p className="font-medium text-sm">{user.displayName}</p>
                          )}
                          {user.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start gap-3 p-3 text-lg font-medium text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <LogOut className="h-5 w-5" />
                          Sign Out
                        </Button>
                      </SheetClose>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
