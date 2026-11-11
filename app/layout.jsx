import "./globals.css";

export const metadata = { title: "Deutschland Reise" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
