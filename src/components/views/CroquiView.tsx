import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, Map, Layers, CheckCircle2 } from 'lucide-react';

export default function CroquiView() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  } as any);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Croqui & Terreno</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Faça upload dos seus desenhos à mão e fotos do terreno para a IA extrair a geometria e topografia.
          </p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={files.length === 0 || isAnalyzing || analysisComplete}
          className="bg-zinc-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Layers size={16} />
          )}
          Extrair Geometria
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[240px] ${
              isDragActive ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 bg-white'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={32} className="text-zinc-400 mb-4" />
            <p className="text-sm font-medium text-zinc-900 mb-1">Arraste imagens ou clique</p>
            <p className="text-xs text-zinc-500">Suporta JPG, PNG, WEBP</p>
          </div>

          {files.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Arquivos Carregados</h3>
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-3 p-2 bg-zinc-50 rounded-md border border-zinc-100">
                    <ImageIcon size={16} className="text-zinc-400" />
                    <span className="text-sm text-zinc-700 truncate flex-1">{file.name}</span>
                    <span className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Preview & Analysis Area */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          {files.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center bg-zinc-50">
              <Map size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Nenhum croqui carregado</p>
              <p className="text-xs mt-2 opacity-60 max-w-xs">A área de visualização mostrará a interpretação da IA sobre o seu desenho.</p>
            </div>
          ) : !analysisComplete ? (
            <div className="flex-1 relative bg-zinc-100 flex items-center justify-center overflow-hidden">
              {/* Show the first uploaded image as a placeholder */}
              <img 
                src={URL.createObjectURL(files[0])} 
                alt="Preview" 
                className={`max-w-full max-h-full object-contain ${isAnalyzing ? 'opacity-50 blur-sm transition-all duration-1000' : ''}`}
              />
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-zinc-900">Processando Visão Computacional...</span>
                    <span className="text-xs text-zinc-500">Detectando paredes, aberturas e proporções</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
              {/* Mocked Analysis Result */}
              <div className="absolute inset-0 opacity-40">
                <img src={URL.createObjectURL(files[0])} alt="Original" className="w-full h-full object-cover blur-md" />
              </div>
              
              {/* Hexagon Overlay Mock */}
              <div className="relative z-10 w-64 h-64 border-2 border-emerald-400/80 bg-emerald-500/10 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-emerald-400 text-xs font-mono bg-zinc-900/80 px-2 py-1 rounded">
                  Lado: ~8m
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-emerald-400/40 transform rotate-30" />
                  <div className="w-full h-px bg-emerald-400/40 transform -rotate-30" />
                  <div className="w-px h-full bg-emerald-400/40" />
                </div>
                <div className="text-emerald-400 text-xs font-mono bg-zinc-900/80 px-2 py-1 rounded">
                  Geometria: Hexágono Regular
                </div>
              </div>

              {/* Sidebar with detected features */}
              <div className="absolute right-4 top-4 bottom-4 w-64 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-xl p-4 flex flex-col gap-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Elementos Detectados</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">Forma Principal</span>
                      <span className="text-xs text-zinc-500">Hexágono dividido em 3 setores</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">Acessos</span>
                      <span className="text-xs text-zinc-500">Entrada frontal identificada</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">Áreas Externas</span>
                      <span className="text-xs text-zinc-500">Varandas perimetrais detectadas</span>
                    </div>
                  </li>
                </ul>
                <div className="mt-auto">
                  <button className="w-full bg-white text-zinc-900 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 transition-colors">
                    Aprovar e Gerar Planta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
