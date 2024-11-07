import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lock,
  Unlock,
  Code2,
  Copy,
  Sparkles,
  FileText,
  LogOut,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

// SyntaxHighlighter component for code formatting
const SyntaxHighlighter = ({ children }) => {
  const tokenize = (code) => {
    const tokens = code.split(/([{}()=,.]|\b)/).filter(Boolean);
    return tokens.map((token, index) => {
      // Keywords
      if (
        /^(function|public|private|external|internal|view|pure|returns|memory|calldata)$/.test(
          token
        )
      ) {
        return (
          <span key={index} className="text-purple-400">
            {token}
          </span>
        );
      }
      // Types
      if (/^(uint8|uint256|bytes32|bytes|address|bool|string)$/.test(token)) {
        return (
          <span key={index} className="text-yellow-300">
            {token}
          </span>
        );
      }
      // Custom types
      if (/^(TFHE|EIP)$/.test(token)) {
        return (
          <span key={index} className="text-blue-400">
            {token}
          </span>
        );
      }
      // Variables and parameters
      if (/^(msg|sender|publicKey|signature)$/.test(token)) {
        return (
          <span key={index} className="text-orange-300">
            {token}
          </span>
        );
      }
      // Numbers
      if (/^\d+$/.test(token)) {
        return (
          <span key={index} className="text-green-300">
            {token}
          </span>
        );
      }
      // Brackets and operators
      if (/^[{}()=,.]$/.test(token)) {
        return (
          <span key={index} className="text-slate-400">
            {token}
          </span>
        );
      }
      // Default
      return (
        <span key={index} className="text-slate-300">
          {token}
        </span>
      );
    });
  };

  const highlightComments = (line) => {
    const commentMatch = line.match(/(\/\/.+)$/);
    if (commentMatch) {
      const [beforeComment, comment] = line.split(/(?=(\/\/.+)$)/);
      return (
        <>
          {tokenize(beforeComment)}
          <span className="text-slate-500">{comment}</span>
        </>
      );
    }
    return tokenize(line);
  };

  return children.split("\n").map((line, index) => {
    const indent = line.match(/^\s*/)[0];
    const content = line.substring(indent.length);

    return (
      <div key={index} className="min-h-[1.5rem]">
        <span className="whitespace-pre">{indent}</span>
        {highlightComments(content)}
      </div>
    );
  });
};

// CodeBlock component for displaying code with syntax highlighting
const CodeBlock = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden bg-slate-950">
      <div className="bg-slate-900 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-blue-400" />
          <span className="text-xs sm:text-sm text-slate-300">{title}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
          onClick={handleCopy}
        >
          <Copy size={12} className={copied ? "text-green-400" : ""} />
        </Button>
      </div>
      <div className="p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto">
        <pre className="space-y-1">
          <SyntaxHighlighter>{code}</SyntaxHighlighter>
        </pre>
      </div>
    </div>
  );
};

// PlayingCard component for the card display
const PlayingCard = ({ value, suit, isHidden, isRevealing }) => {
  const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  const suitColors = {
    hearts: "text-red-500",
    diamonds: "text-red-500",
    clubs: "text-slate-900",
    spades: "text-slate-900",
  };

  const cardClasses = "w-36 h-48 sm:w-56 sm:h-80";

  if (isHidden) {
    return (
      <div
        className={`relative ${cardClasses} transition-all duration-500 ${
          isRevealing ? "scale-95 rotate-1" : ""
        }`}
      >
        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/30 via-blue-500/20 to-purple-500/30 blur-2xl rounded-xl opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-xl">
          <div className="absolute inset-[2px] bg-slate-950/90 rounded-[calc(0.75rem-1px)]">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border border-white/20 rounded-lg transform"
                  style={{ rotate: `${i * 15}deg` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
                <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${cardClasses} group`}>
      <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative w-full h-full bg-white rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col justify-between transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
        <div
          className={`text-2xl sm:text-4xl font-bold ${suitColors[suit]} flex items-center gap-1 sm:gap-2`}
        >
          {value}
          <span className="text-xl sm:text-2xl">{suitSymbols[suit]}</span>
        </div>
        <div
          className={`text-5xl sm:text-8xl self-center ${suitColors[suit]} transform transition-transform duration-300 group-hover:scale-110`}
        >
          {suitSymbols[suit]}
        </div>
        <div
          className={`text-2xl sm:text-4xl font-bold self-end rotate-180 ${suitColors[suit]} flex items-center gap-1 sm:gap-2`}
        >
          {value}
          <span className="text-xl sm:text-2xl">{suitSymbols[suit]}</span>
        </div>
      </div>
    </div>
  );
};

// Main CardGame component
const CardGame = () => {
  const [isHidden, setIsHidden] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentCard, setCurrentCard] = useState({
    value: "2",
    suit: "spades",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { authenticated, login, logout } = usePrivy();

  const generateNewCard = () => {
    setIsGenerating(true);
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    setCurrentCard({
      suit: suits[Math.floor(Math.random() * suits.length)],
      value: values[Math.floor(Math.random() * values.length)],
    });
    setIsHidden(true);
    setTimeout(() => setIsGenerating(false), 500);
  };

  const revealCard = () => {
    setIsRevealing(true);
    setTimeout(() => {
      setIsHidden(false);
      setIsRevealing(false);
    }, 500);
  };

  const codeExamples = {
    generateCard: `// A random encrypted uint8 is generated
function getCard() public {
    encryptedCards[msg.sender] = TFHE.randEuint8();
}`,
    viewCard: `// EIP 712 signature required for verification
function viewCard(
    bytes32 publicKey,
    bytes calldata signature
) public view onlySignedPublicKey(publicKey, signature) returns (bytes memory) {
    return TFHE.reencrypt(
        encryptedCards[msg.sender],
        publicKey,
        0
    );
}`,
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="max-w-6xl md:mx-auto">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Game Section */}
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-4 sm:p-12 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-6 mb-6 sm:mb-12">
                <a
                  href="https://www.inco.org/"
                  target="_blank"
                  className="h-8 sm:h-12"
                >
                  <img
                    src="/inco-logo.png"
                    alt="INCO Logo"
                    className="h-full w-16 sm:w-24 object-contain"
                  />
                </a>
              </div>

              <div className="flex flex-col items-center gap-6 sm:gap-12">
                <div className="relative perspective-1000">
                  <div className="transform-gpu preserve-3d transition-all duration-500">
                    <PlayingCard
                      value={currentCard.value}
                      suit={currentCard.suit}
                      isHidden={isHidden}
                      isRevealing={isRevealing}
                    />
                  </div>
                </div>

                <div className="relative w-full max-w-sm">
                  {authenticated ? (
                    <>
                      <div className="space-y-3 sm:space-y-4 w-full">
                        <Button
                          variant="default"
                          className="w-full h-10 sm:h-14 text-sm sm:text-lg font-medium
                bg-gradient-to-br from-indigo-600 to-blue-600
                hover:from-indigo-500 hover:to-blue-500
                transition-all duration-300 shadow-lg
                hover:shadow-indigo-500/25 disabled:opacity-70"
                          onClick={generateNewCard}
                          disabled={isGenerating}
                        >
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Generate New Card
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full h-10 sm:h-14 text-sm sm:text-lg font-medium
                border-indigo-500/20 text-black
                hover:bg-indigo-500/10 hover:text-indigo-200
                transition-all duration-300
                disabled:opacity-50 disabled:hover:bg-transparent"
                          onClick={revealCard}
                          disabled={!isHidden}
                        >
                          <Unlock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Reveal Card
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full hover:bg-white/10 hover:text-white/90 text-white/50"
                          onClick={logout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>

                      {/* Logout button positioned absolutely in top-right */}
                    </>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full h-10 sm:h-14 text-sm sm:text-lg font-medium
            bg-gradient-to-br from-indigo-600 to-blue-600
            hover:from-indigo-500 hover:to-blue-500
            transition-all duration-300 shadow-lg
            hover:shadow-indigo-500/25"
                      onClick={login}
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                  Smart Contract Implementation
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-400">
                  A random hidden uint8 is generated and stored for the user,
                  which can be converted into a specific card.
                </p>
              </div>

              <div className="space-y-4 overflow-hidden">
                <div className="w-full">
                  <CodeBlock
                    title="Generate Card"
                    code={codeExamples.generateCard}
                  />
                </div>

                <p className="text-[11px] sm:text-sm text-slate-400">
                  Users can view their decrypted card by signing an EIP-712
                  signature
                </p>

                <div className="w-full">
                  <CodeBlock title="View Card" code={codeExamples.viewCard} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardGame;
