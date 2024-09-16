"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { isLoggedIn, handleLogout } = useAuth();

  return (
    <header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <nav className="flex justify-between items-center h-20">
          <Logo />
          {isLoggedIn && <UserMenu onLogout={handleLogout} />}
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link href="/">
      <Image
        src="/logo.png"
        alt="Logo"
        width={130}
        height={130}
        className="object-contain"
      />
    </Link>
  );
}

function UserMenu({ onLogout }) {
  return (
    <div>
      {/* <Link
        href="/leaderboard"
        className="text-gray-600 hover:text-gray-900 mr-6"
      >
        Leaderboard
      </Link> */}
      <Button onClick={onLogout} variant="outline" size="sm">
        로그아웃
      </Button>
    </div>
  );
}
