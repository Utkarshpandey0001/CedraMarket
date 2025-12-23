"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "../constant"; 
import { useRouter } from "next/navigation";

// --- CONFIGURATION ---
// 1. Get your FREE Key: https://pinata.cloud/ -> API Keys -> New Key -> Admin -> Copy JWT
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

export default function CreateListingPage() {
  const { account, signAndSubmitTransaction } = useWallet();
  const router = useRouter();
  
  // TABS: 'AI' or 'UPLOAD'
  const [activeTab, setActiveTab] = useState<"AI" | "UPLOAD">("AI");

  // STATE: AI
  const [prompt, setPrompt] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // STATE: UPLOAD
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // STATE: FORM
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // --- LOGIC: GENERATE AI ART ---
  const handleGenerateArt = async () => {
    if (!prompt) return alert("Enter a prompt first!");
    setIsGenerating(true);
    setAiImageUrl(null); // Clear previous
    
    try {
      // Using Free Pollinations API
      const randomSeed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;
      
      // Wait for image to actually load to ensure it's ready
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setAiImageUrl(url);
        setIsGenerating(false);
      };
    } catch (e) {
      console.error(e);
      alert("AI Generation failed");
      setIsGenerating(false);
    }
  };

  // --- LOGIC: HANDLE FILE SELECT ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // --- LOGIC: UPLOAD TO IPFS ---
 // --- LOGIC: UPLOAD TO IPFS ---
 const uploadToIpfs = async (file: File): Promise<string | null> => {
    
    // I REMOVED THE "IF" CHECK HERE BECAUSE YOU HAVE THE REAL KEY NOW
    
    try {
      setStatusMsg("Uploading image to IPFS...");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData,
      });
      const data = await res.json();
      return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (e) {
      console.error("Upload error:", e);
      alert("Upload failed.");
      return null;
    }
  };

  // --- LOGIC: MINT NFT ---
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Connect Wallet!");
    if (!name || !price) return alert("Fill details!");

    let finalImageUrl = "";

    setIsMinting(true);

    try {
      // Determine which image source to use
      if (activeTab === "AI") {
        if (!aiImageUrl) throw new Error("No AI image generated!");
        finalImageUrl = aiImageUrl;
      } else {
        if (!selectedFile) throw new Error("No file selected!");
        const ipfsUrl = await uploadToIpfs(selectedFile);
        if (!ipfsUrl) throw new Error("Upload failed");
        finalImageUrl = ipfsUrl;
      }

      setStatusMsg("Minting NFT on Aptos...");
      
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::market_v3::list_item_with_uri`,
          typeArguments: [], 
          functionArguments: [
            name, 
            finalImageUrl, 
            (parseFloat(price) * 100_000_000).toString()
          ],
        }
      });
      
      await aptos.waitForTransaction({ transactionHash: response.hash });
      alert("Success! NFT Minted.");
      router.push("/");

    } catch (e: any) {
      console.error(e);
      alert(e.message || "Minting failed");
    } finally {
      setIsMinting(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
        
        {/* LEFT COLUMN: CREATION STUDIO */}
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Asset</h2>
          
          {/* TABS */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <button
              onClick={() => setActiveTab("AI")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "AI" 
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              ✨ AI Generator
            </button>
            <button
              onClick={() => setActiveTab("UPLOAD")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "UPLOAD" 
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              📁 Upload File
            </button>
          </div>

          {/* TAB CONTENT: AI */}
          {activeTab === "AI" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <textarea
                className="w-full h-32 p-4 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your vision (e.g. Cyberpunk Samurai)..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGenerateArt}
                disabled={isGenerating}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isGenerating ? "Dreaming..." : "Generate Art"}
              </button>
            </div>
          )}

          {/* TAB CONTENT: UPLOAD */}
          {activeTab === "UPLOAD" && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
             </div>
          )}

          {/* PREVIEW AREA (Shared) */}
          <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden relative border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            {(activeTab === "AI" && aiImageUrl) ? (
               <img src={aiImageUrl} alt="AI Art" className="w-full h-full object-cover" />
            ) : (activeTab === "UPLOAD" && filePreview) ? (
               <img src={filePreview} alt="Upload Preview" className="w-full h-full object-cover" />
            ) : (
               <span className="text-gray-400">Preview Area</span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LISTING DETAILS */}
        <div className="flex flex-col justify-center space-y-6 pt-8 lg:pt-0 lg:pl-10 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Listing Details</h3>
              <form className="space-y-6" onSubmit={handleCreateListing}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-blue-500"
                    placeholder="e.g. Cosmic #001"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (APT)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-blue-500"
                    placeholder="e.g. 0.5"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isMinting || (activeTab === "AI" && !aiImageUrl) || (activeTab === "UPLOAD" && !selectedFile)}
                    className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMinting ? statusMsg : "Mint & List NFT"}
                  </button>
                  {isMinting && <p className="text-center text-xs text-gray-500 mt-3 animate-pulse">{statusMsg}</p>}
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}