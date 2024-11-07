import { Inter } from "next/font/google";
import "./globals.css";
import PrivyWrapper from "@/privy/privyProvider";
import { FHEWrapper } from "@/fhevm/fheWrapper";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hidden Cards | Rivest | FHEVM | Inco Network",
  description: "A privacy-preserving card game built on FHEVM (Fully Homomorphic Encryption Virtual Machine). Using advanced cryptography, players can generate and reveal encrypted cards while maintaining complete privacy of card values until revealed. Built on top of Inco's Rivest Network",
  keywords: [
    "blockchain",
    "FHEVM",
    "homomorphic encryption",
    "card game",
    "privacy",
    "web3",
    "Inco Network",
    "crypto",
    "decentralized",
    "blockchain gaming"
  ],
  authors: [{ name: "Inco Network" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyWrapper>
          <FHEWrapper>{children}</FHEWrapper>
          <Toaster />
        </PrivyWrapper>
      </body>
    </html>
  );
}