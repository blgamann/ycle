import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header({ isLoggedIn, onLogout }) {
  return (
    <header>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={130}
              height={130}
              className="object-contain"
            />
          </Link>
          {isLoggedIn && (
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
          )}
        </div>
      </div>
    </header>
  );
}
