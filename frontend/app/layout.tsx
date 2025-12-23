// app/layout.tsx
import "./globals.css"; // Import the css file from the same folder
import { WalletProvider } from "./src/components/AptosWalletProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}