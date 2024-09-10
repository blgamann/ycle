import "./globals.css";

export const metadata = {
  title: "Ycle",
  description:
    "Ycle is a platform for recording cycles and connecting with others.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">{children}</div>
      </body>
    </html>
  );
}
