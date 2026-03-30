import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Paperclip, X } from 'lucide-react';
import { useProjectStore } from '../../store/project.store';
import { BriefingAnalysis } from '../../schemas/project.schema';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 image data url
}

export function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o EGOS Master Architect. Vamos projetar sua casa modular hexagonal. Para começarmos, me fale um pouco sobre quem vai morar na casa e qual é o terreno que temos disponível?' }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setAnalysis } = useProjectStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg = input.trim();
    const imageToSend = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, image: imageToSend || undefined }]);
    setIsLoading(true);

    try {
      // Prepare history for the API
      const history = messages.map(m => ({ 
        role: m.role, 
        parts: [{ text: m.text }],
        image: m.image
      }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, image: imageToSend, history }),
      });

      if (!response.ok) throw new Error('Falha na comunicação com o agente.');

      const data = await response.json();
      let botReply = data.text;

      // Check if the bot included a JSON state update
      const jsonStateMatch = botReply.match(/```json_state\n([\s\S]*?)\n```/);
      if (jsonStateMatch) {
        try {
          const newState = JSON.parse(jsonStateMatch[1]) as BriefingAnalysis;
          setAnalysis(newState); // Update the global store silently in the background!
          // Remove the JSON block from the visible chat
          botReply = botReply.replace(/```json_state\n([\s\S]*?)\n```/, '').trim();
        } catch (e) {
          console.error("Failed to parse agent state update", e);
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um problema de conexão. Podemos tentar novamente?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <Bot className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium">EGOS Master Architect</h3>
          <p className="text-xs text-slate-400">Co-criação iterativa</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-2 max-h-48 object-cover" />
              )}
              {msg.text && msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span className="text-sm text-slate-400">Analisando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
        {selectedImage && (
          <div className="relative inline-block w-24 h-24">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 shrink-0"
            title="Anexar imagem"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Descreva suas ideias, anexe um croqui ou responda ao arquiteto..."
            className="flex-1 px-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all outline-none text-sm resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
