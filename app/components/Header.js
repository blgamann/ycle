import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header({ isLoggedIn, onLogout }) {
  return (
    <header>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center h-20">
          <Image
            src="/logo.png"
            alt="Logo"
            width={130}
            height={130}
            className="object-contain"
          />
          {isLoggedIn && (
            <Button onClick={onLogout} variant="outline" size="sm">
              로그아웃
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
