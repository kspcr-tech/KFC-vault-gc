import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  CreditCard, 
  RefreshCw, 
  Plus, 
  Bell, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Gift,
  Loader2,
  Eye,
  EyeOff,
  Edit3,
  ExternalLink,
  Check,
  X,
  MessageSquare,
  Smartphone,
  Send,
  ArrowRight,
  Clipboard,
  Download,
  Share2,
  MoreVertical,
  Lock,
  Unlock,
  KeyRound,
  LogOut
} from 'lucide-react';

// --- Types ---

interface GiftCard {
  id: string;
  cardNumber: string;
  pin: string;
  balance: number;
  expiryDate?: string;
  lastUpdated: number;
}

// --- Gemini AI Setup ---

// Robust API Key Retrieval
const getApiKey = () => {
  // Check specifically for the polyfill in index.html (window.process)
  // @ts-ignore
  if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.API_KEY) {
     // @ts-ignore
     return window.process.env.API_KEY;
  }
  // Fallback to standard process.env if a bundler is injecting it
  // @ts-ignore
  return typeof process !== 'undefined' ? process.env.API_KEY : '';
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

const checkApiKeyConfigured = () => {
  const key = getApiKey();
  if (!key || key === 'YOUR_API_KEY_HERE' || key.includes('API_KEY')) {
    alert("⚠️ AI Key Missing or Invalid\n\nTo use Smart Features, you must add your Google Gemini API Key.\n\n1. Open index.html\n2. Replace 'YOUR_API_KEY_HERE' with your actual key.\n3. Save and Refresh.");
    return false;
  }
  return true;
};

// Helper to strip markdown code blocks from AI response
const cleanAIResponse = (text: string | undefined) => {
  if (!text) return "";
  let cleaned = text.trim();
  // Remove ```json and ``` wrappers if they exist
  cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  return cleaned;
};

// --- Components ---

const Header = ({ onInstall, onLogout }: { onInstall: () => void, onLogout: () => void }) => (
  <header className="kfc-red text-white p-4 shadow-lg sticky top-0 z-50">
    <div className="flex items-center justify-between max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <Gift className="w-6 h-6" />
        <h1 className="text-xl font-bold tracking-wide">MY KFC CARDS</h1>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onInstall}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-xs font-medium transition-colors backdrop-blur-sm"
        >
          <Download className="w-3 h-3" /> <span className="hidden sm:inline">Install</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-1 bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full text-xs font-medium transition-colors backdrop-blur-sm"
          title="Lock App"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    </div>
  </header>
);

const AuthScreen = ({ onAuthenticated }: { onAuthenticated: () => void }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'SETUP' | 'CONFIRM'>('LOGIN');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem('kfc_app_pin');
    if (!storedPin) {
      setMode('SETUP');
    } else {
      setMode('LOGIN');
    }
  }, []);

  const handleDigit = (digit: string) => {
    setError('');
    const currentInput = mode === 'CONFIRM' ? confirmPin : pin;
    
    if (currentInput.length < 4) {
      const newVal = currentInput + digit;
      if (mode === 'CONFIRM') setConfirmPin(newVal);
      else setPin(newVal);
      
      // Auto-submit on 4th digit
      if (newVal.length === 4) {
        setTimeout(() => submitPin(newVal), 100);
      }
    }
  };

  const handleBackspace = () => {
    setError('');
    if (mode === 'CONFIRM') setConfirmPin(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  const submitPin = (inputPin: string) => {
    const storedPin = localStorage.getItem('kfc_app_pin');

    if (mode === 'LOGIN') {
      if (inputPin === storedPin) {
        onAuthenticated();
      } else {
        triggerError("Incorrect PIN");
        setPin('');
      }
    } else if (mode === 'SETUP') {
      setMode('CONFIRM');
      // Keep pin state as the first entry, clear confirmPin for second entry
    } else if (mode === 'CONFIRM') {
      if (inputPin === pin) {
        localStorage.setItem('kfc_app_pin', inputPin);
        onAuthenticated();
      } else {
        triggerError("PINs do not match. Try again.");
        setMode('SETUP');
        setPin('');
        setConfirmPin('');
      }
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleReset = () => {
    if (confirm("⚠️ Forgot PIN?\n\nResetting the app will DELETE ALL SAVED CARDS for security.\n\nAre you sure you want to wipe everything and start over?")) {
      localStorage.removeItem('kfc_cards');
      localStorage.removeItem('kfc_app_pin');
      window.location.reload();
    }
  };

  const activePin = mode === 'CONFIRM' ? confirmPin : pin;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4002B] to-[#960018] flex items-center justify-center p-4">
      <div className={`bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col items-center ${shake ? 'animate-shake' : ''}`}>
        
        <div className="bg-red-50 p-4 rounded-full mb-6">
          {mode === 'LOGIN' ? <Lock className="w-8 h-8 text-red-600" /> : <KeyRound className="w-8 h-8 text-red-600" />}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {mode === 'LOGIN' && "Welcome Back"}
          {mode === 'SETUP' && "Set Security PIN"}
          {mode === 'CONFIRM' && "Confirm PIN"}
        </h2>
        
        <p className="text-sm text-gray-500 mb-8 text-center h-5">
          {error ? <span className="text-red-500 font-medium flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</span> : 
            (mode === 'LOGIN' ? "Enter your 4-digit PIN" : 
             mode === 'SETUP' ? "Create a 4-digit PIN to secure cards" : "Re-enter to confirm")
          }
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-200 ${i < activePin.length ? 'bg-red-600 scale-110' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="aspect-square rounded-full bg-gray-50 hover:bg-gray-100 text-xl font-bold text-gray-700 transition-colors active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="aspect-square"></div>
          <button
              onClick={() => handleDigit('0')}
              className="aspect-square rounded-full bg-gray-50 hover:bg-gray-100 text-xl font-bold text-gray-700 transition-colors active:scale-95"
            >
              0
          </button>
          <button
              onClick={handleBackspace}
              className="aspect-square rounded-full hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors active:scale-95"
            >
              <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'LOGIN' && (
          <button onClick={handleReset} className="text-xs text-gray-400 underline hover:text-red-600">
            Forgot PIN? (Reset App)
          </button>
        )}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

const InstallHelpModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-red-600" />
            Install App
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Install this website as an app on your phone for the best experience (fullscreen, offline access).
          </p>

          <div className="space-y-4">
            {/* iOS Instructions */}
            <div className="flex gap-4 items-start">
               <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                  <Share2 className="w-6 h-6 text-blue-500" />
               </div>
               <div>
                 <p className="font-bold text-sm text-gray-800">iPhone (Safari)</p>
                 <p className="text-xs text-gray-500 mt-1">
                   Tap the <strong>Share</strong> button in the bottom bar, scroll down and select <span className="font-semibold bg-gray-100 px-1 rounded">Add to Home Screen</span>.
                 </p>
               </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            {/* Android Instructions */}
            <div className="flex gap-4 items-start">
               <div className="bg-gray-100 p-2 rounded-lg shrink-0">
                  <MoreVertical className="w-6 h-6 text-green-600" />
               </div>
               <div>
                 <p className="font-bold text-sm text-gray-800">Android (Chrome)</p>
                 <p className="text-xs text-gray-500 mt-1">
                   Tap the <strong>Menu</strong> (3 dots) in the top right corner and select <span className="font-semibold bg-gray-100 px-1 rounded">Install App</span> or <span className="font-semibold bg-gray-100 px-1 rounded">Add to Home Screen</span>.
                 </p>
               </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

interface CardItemProps {
  card: GiftCard;
  onDelete: (id: string) => void;
  onUpdateBalance: (id: string, newBalance: number, expiryDate?: string) => void;
  onCheckBalance: (card: GiftCard) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onDelete, onUpdateBalance, onCheckBalance }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBalance, setEditBalance] = useState(card.balance.toString());

  const saveBalance = () => {
    const val = parseFloat(editBalance);
    if (!isNaN(val)) {
      onUpdateBalance(card.id, val);
      setIsEditing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const formatCardNumber = (num: string) => {
    if (showDetails) {
      return num.replace(/(.{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br from-[#E4002B] to-[#960018] text-white">
      {/* Decorative Background Circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-xl"></div>

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
               <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-widest text-sm opacity-90">KFC CARD</span>
          </div>
          <div className="text-right">
             <p className="text-xs opacity-75 font-medium uppercase tracking-wider mb-1">Current Balance</p>
             {isEditing ? (
               <div className="flex items-center justify-end gap-2">
                 <input 
                    type="number" 
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-24 px-2 py-1 text-black text-lg font-bold rounded"
                    autoFocus
                 />
                 <button onClick={saveBalance} className="bg-green-500 p-1 rounded hover:bg-green-600"><Check className="w-4 h-4" /></button>
                 <button onClick={() => setIsEditing(false)} className="bg-red-800 p-1 rounded hover:bg-red-900"><X className="w-4 h-4" /></button>
               </div>
             ) : (
               <div className="flex flex-col items-end">
                 <div className="flex items-center justify-end gap-2 group">
                   <h2 className="text-3xl font-extrabold tracking-tight">₹{card.balance.toFixed(2)}</h2>
                   <button 
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                   >
                     <Edit3 className="w-4 h-4" />
                   </button>
                 </div>
                 {card.expiryDate && (
                    <p className="text-[10px] text-white/90 font-medium mt-1 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                      Exp: {card.expiryDate}
                    </p>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Card Number & Details */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col gap-4">
             <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs opacity-60 uppercase tracking-widest">Card Number</p>
                  <button 
                    onClick={() => copyToClipboard(card.cardNumber)}
                    className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="font-mono text-xl tracking-widest drop-shadow-sm truncate">
                  {formatCardNumber(card.cardNumber)}
                </p>
             </div>
             
             <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <p className="text-xs opacity-60 uppercase tracking-widest">PIN</p>
                  <p className="font-mono text-lg tracking-widest">
                    {showDetails ? card.pin : `••${card.pin.slice(-2)}`}
                  </p>
               </div>
               
               <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors text-sm font-medium backdrop-blur-sm"
               >
                 {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 {showDetails ? 'Hide' : 'Show'}
               </button>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-xs opacity-75">
              <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
              <span>Updated {new Date(card.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <a 
              href="https://gift.kfc.co.in/balance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-white/60 hover:text-white underline flex items-center gap-1 mt-1"
            >
              Check Official Site <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onCheckBalance(card)} 
              className="px-3 py-2 rounded-full bg-white text-red-700 hover:bg-gray-100 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md"
              title="Check Balance via SMS"
            >
              <RefreshCw className="w-4 h-4" /> Check Balance
            </button>
            <button 
              onClick={() => onDelete(card.id)} 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-red-200 backdrop-blur-md transition-all active:scale-95"
              title="Delete Card"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SMSUpdateModal = ({
  isOpen,
  onClose,
  card,
  onProcess
}: {
  isOpen: boolean,
  onClose: () => void,
  card: GiftCard | null,
  onProcess: (text: string) => void
}) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [justReturned, setJustReturned] = useState(false);
  const pasteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setStep(1);
      setJustReturned(false);
    }
  }, [isOpen]);

  // Detect when user returns to the app window (presumably after copying SMS)
  useEffect(() => {
    const handleFocus = () => {
      if (isOpen && step === 2) {
        setJustReturned(true);
        // Remove highlight effect after a few seconds
        setTimeout(() => setJustReturned(false), 3000);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isOpen, step]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    await onProcess(text);
    setIsProcessing(false);
  };

  const handleSendSMS = () => {
    if (!card) return;
    const recipient = "55757575";
    const body = card.cardNumber;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    
    window.location.href = `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
    setStep(2);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
      } else {
        alert('Clipboard is empty.');
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Fallback for browsers that don't support clipboard read without explicit permission logic not handled here
      alert('Tap inside the box and select "Paste" manually.');
    }
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" />
            Check Balance via SMS
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === 1 ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>1</div>
            <div className={`w-12 h-1 transition-colors ${step === 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {step === 1 ? (
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl text-left shadow-sm border border-blue-100">
                <p className="font-semibold mb-2">Instructions:</p>
                <ul className="list-decimal pl-4 space-y-1 text-blue-900/80">
                  <li>Click button to open SMS app.</li>
                  <li>Send pre-filled code to <strong>55757575</strong>.</li>
                  <li><strong>Copy the reply</strong> you get from KFC.</li>
                  <li>Return here to auto-update.</li>
                </ul>
              </div>
              
              <div className="py-2 opacity-50">
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest">SENDING FOR CARD</p>
                 <p className="font-mono text-xs">{card.cardNumber}</p>
              </div>

              <button 
                onClick={handleSendSMS}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95"
              >
                <Send className="w-5 h-5" /> Open SMS App
              </button>
              
              <button onClick={() => setStep(2)} className="text-xs text-gray-400 underline hover:text-gray-600 mt-2">
                Already sent? Skip to Step 2
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="text-center mb-4">
                  <p className="text-sm font-semibold text-gray-800">
                    Did you copy the reply?
                  </p>
                  <p className="text-xs text-gray-500">Paste it below to update balance.</p>
               </div>

               {/* Smart Paste Button */}
               <button 
                  ref={pasteButtonRef}
                  onClick={handlePaste}
                  className={`w-full py-4 rounded-xl font-bold border-2 border-dashed transition-all flex items-center justify-center gap-2 mb-2
                    ${justReturned 
                      ? 'bg-green-50 border-green-500 text-green-700 scale-[1.02] shadow-green-200 shadow-lg animate-pulse' 
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
               >
                 <Clipboard className={`w-5 h-5 ${justReturned ? 'text-green-600' : 'text-gray-400'}`} /> 
                 {justReturned ? 'Tap here to Paste Reply!' : 'Paste from Clipboard'}
               </button>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-20 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
                placeholder="Or paste text manually here..."
              />
              
              <div className="flex gap-3 pt-2">
                 <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg text-sm"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isProcessing || !text.trim()}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Balance'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddCardModal = ({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (num: string, pin: string, bal: number) => void 
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'email'>('manual');
  const [formData, setFormData] = useState({ number: '', pin: '', balance: '' });
  const [emailText, setEmailText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.number.length < 4 || formData.pin.length < 2) {
      setError('Invalid card details');
      return;
    }
    onAdd(formData.number, formData.pin, Number(formData.balance) || 0);
    onClose();
    setFormData({ number: '', pin: '', balance: '' });
    setError('');
  };

  const handleEmailParse = async () => {
    if (!emailText.trim()) return;
    if (!checkApiKeyConfigured()) return; // API Key Check

    setIsProcessing(true);
    setError('');

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following text and extract ONLY KFC (Kentucky Fried Chicken) India Gift Card details.
        
        Rules:
        1. Extract "cardNumber", "pin", and "amount" (if available).
        2. STRICTLY IGNORE credit cards (Visa/Mastercard), bank account numbers, or gift cards from other brands (Amazon, Flipkart, etc.).
        3. Only return data if you are sure it is a KFC gift card.
        4. Return a JSON array of objects.

        Text to analyze:
        ${emailText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cardNumber: { type: Type.STRING },
                pin: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["cardNumber", "pin"],
            },
          },
        },
      });

      const cleanedText = cleanAIResponse(response.text);
      const extracted = JSON.parse(cleanedText || '[]');
      
      if (extracted.length > 0) {
        extracted.forEach((card: any) => {
           onAdd(card.cardNumber, card.pin, card.amount || 0);
        });
        onClose();
        setEmailText('');
      } else {
        setError('No KFC cards found. Please check the text and try again.');
      }
    } catch (err: any) {
      setError(`Processing failed: ${err.message || "Unknown Error"}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex border-b">
          <button 
            className={`flex-1 p-4 font-medium text-sm transition-colors ${activeTab === 'manual' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Entry
          </button>
          <button 
            className={`flex-1 p-4 font-medium text-sm transition-colors ${activeTab === 'email' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('email')}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Import Text (Email/SMS)</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="16-digit card number"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
                  <input 
                    type="text" 
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="PIN"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input 
                    type="number" 
                    value={formData.balance}
                    onChange={e => setFormData({...formData, balance: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="₹0.00"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                Save Card
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Privacy First:</strong> We don't access your messages directly. Copy the text from your KFC gift card email or SMS and paste it below. Gemini AI will extract the details.
                  </span>
                </p>
              </div>
              <textarea 
                value={emailText}
                onChange={e => setEmailText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Paste email or SMS content here..."
              ></textarea>
              <button 
                onClick={handleEmailParse}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                {isProcessing ? 'AI is Processing...' : 'Sync from Text'}
              </button>
            </div>
          )}
          <button onClick={onClose} className="w-full mt-3 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [smsModalState, setSmsModalState] = useState<{isOpen: boolean, card: GiftCard | null}>({ isOpen: false, card: null });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kfc_cards');
    if (saved) {
      setCards(JSON.parse(saved));
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    // Capture PWA install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Save to local storage whenever cards change
  useEffect(() => {
    localStorage.setItem('kfc_cards', JSON.stringify(cards));
  }, [cards]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Browser supports automatic install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Manual instructions needed (iOS, or already installed, or dev env)
      setShowInstallHelp(true);
    }
  };

  // Request Notification Permission
  const enableNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification("KFC Card Manager", { body: "Notifications enabled! You will be alerted on balance changes." });
    }
  };

  const updateBalanceManually = (id: string, newBalance: number, newExpiry?: string) => {
    setCards(prev => prev.map(c => c.id === id ? { 
      ...c, 
      balance: newBalance, 
      lastUpdated: Date.now(),
      expiryDate: newExpiry !== undefined ? newExpiry : c.expiryDate
    } : c));
  };

  const handleSMSParseProcess = async (text: string) => {
    if (!smsModalState.card) return;
    if (!checkApiKeyConfigured()) return; // API Key Check

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following SMS or text message related to a KFC Gift Card.
        Extract the CURRENT AVAILABLE BALANCE amount and the EXPIRY DATE.
        
        Common formats include:
        - "Balance is Rs. 500. Valid till 31-12-2025"
        - "Card XXXX balance: 500.00 expires on 31 Dec 2025"
        - "INR 500"
        
        Text: "${text}"
        
        Return JSON object: { "found": boolean, "balance": number, "expiryDate": string | null }
        - If an expiry date is found, format it strictly as "dd/MMM/yyyy" (e.g. "01/Jan/2025").
        - If no balance is found or unsure, set found to false.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               found: { type: Type.BOOLEAN },
               balance: { type: Type.NUMBER },
               expiryDate: { type: Type.STRING, nullable: true },
             },
             required: ["found"],
          }
        }
      });
      
      const cleanedText = cleanAIResponse(response.text);
      const result = JSON.parse(cleanedText || '{}');

      if (result.found && typeof result.balance === 'number') {
        updateBalanceManually(smsModalState.card.id, result.balance, result.expiryDate);
        setSmsModalState({ isOpen: false, card: null });
        if (notificationsEnabled) {
          new Notification("Balance Updated", { body: `New balance verified: ₹${result.balance}` });
        }
      } else {
        alert("Could not find a valid balance in that text. Please ensure you copied the entire message from KFC.");
      }

    } catch (e: any) {
      console.error(e);
      alert(`AI processing failed: ${e.message || "Unknown error"}. Check API Key.`);
    }
  };

  const addCard = (cardNumber: string, pin: string, balance: number) => {
    const newCard: GiftCard = {
      id: Date.now().toString(),
      cardNumber,
      pin,
      balance,
      lastUpdated: Date.now()
    };
    setCards(prev => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen pb-24">
      <Header onInstall={handleInstallClick} onLogout={() => setIsAuthenticated(false)} />

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Notification Banner */}
        {!notificationsEnabled && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Enable Alerts</p>
                <p className="text-xs text-gray-500">Get notified when balance updates</p>
              </div>
            </div>
            <button 
              onClick={enableNotifications}
              className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Enable
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Value</p>
            <p className="text-2xl font-bold text-gray-800">
              ₹{cards.reduce((acc, curr) => acc + curr.balance, 0).toFixed(0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Active Cards</p>
            <p className="text-2xl font-bold text-gray-800">{cards.length}</p>
          </div>
        </div>

        {/* Card List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-gray-800">Your Cards</h2>
            <span className="text-xs text-gray-400">Auto-sync active</span>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-gray-800 font-medium mb-1">No Cards Added</h3>
              <p className="text-sm text-gray-400 mb-6 px-8">Add your KFC gift cards manually or sync from your email/SMS.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-red-600 font-bold text-sm hover:underline"
              >
                Add your first card
              </button>
            </div>
          ) : (
            cards.map(card => (
              <CardItem 
                key={card.id} 
                card={card} 
                onDelete={deleteCard}
                onUpdateBalance={updateBalanceManually}
                onCheckBalance={(card) => setSmsModalState({ isOpen: true, card })}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg shadow-red-300 hover:bg-red-700 hover:scale-105 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <AddCardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={addCard}
      />

      <SMSUpdateModal 
        isOpen={smsModalState.isOpen}
        onClose={() => setSmsModalState({ isOpen: false, card: null })}
        card={smsModalState.card}
        onProcess={handleSMSParseProcess}
      />

      <InstallHelpModal 
        isOpen={showInstallHelp} 
        onClose={() => setShowInstallHelp(false)} 
      />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);