import "./globals.css";
import { Header } from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";

export const metadata = {
  title: "Ycle",
  description:
    "Ycle is a platform for recording cycles and connecting with others.",
  openGraph: {
    title: "Ycle - Record Your Cycles",
    description: "Connect and share your cycles with others on Ycle",
    url: "https://ycle.kr",
    siteName: "Ycle",
    images: [
      {
        url: "https://ycle.kr/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    icons: {
      icon: "/logo.png",
    },
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <div className="flex flex-col min-h-screen w-full max-w-3xl mx-auto">
            <Header />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
