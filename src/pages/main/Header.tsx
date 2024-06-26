import { Link } from 'react-router-dom';
import { Bell, CircleUser, Package2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogto } from '@logto/react';
import { useMount } from 'ahooks';
import { BASE_URL, RESOURCE_BUESS } from '@/const';

function HeaderLeft() {
  return (
    <div className="flex items-center border-r border-b px-4 lg:px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <Package2 className="h-6 w-6" />
        <span className="">Acme Inc</span>
      </Link>
      <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
    </div>
  );
}

function HeaderRight() {
  const { signOut, fetchUserInfo, getAccessTokenClaims } = useLogto();
  const handleLogout = () => {
    localStorage.clear();
    // noinspection JSIgnoredPromiseFromCall
    signOut(`${BASE_URL}/auth`);
  };
  useMount(() => {
    getAccessTokenClaims(RESOURCE_BUESS).then((claims) => {
      console.log('claims', claims);
    });
    fetchUserInfo().then((userInfo) => {
      console.log('userInfo', userInfo);
    });
  });
  return (
    <header className="flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default function Header() {
  return (
    <div
      className="
    grid h-14 lg:h-[60px] w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] border-b bg-muted
    sticky top-0 z-10
    "
    >
      <HeaderLeft />
      <HeaderRight />
    </div>
  );
}
