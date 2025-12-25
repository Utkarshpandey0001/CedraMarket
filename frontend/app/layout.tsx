import "./globals.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css"; // Import Wallet CSS here
import { NavBar } from "@/components/Navbar";
import { WalletProvider } from "@/components/AptosWalletProvider";
import { AuroraBackground } from "@/components/AuroraBackground";

export const metadata = {
  title: "Cedera Market",
  description: "Aptos NFT Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
<body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">

  <WalletProvider>
  
    <NavBar />
    <AuroraBackground>
    {children}
    </AuroraBackground>
  </WalletProvider>
  
</body>
    </html>
  );
}