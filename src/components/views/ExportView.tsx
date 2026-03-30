import React from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, File as FilePdf, Hexagon } from 'lucide-react';
import { useProjectStore } from '../../store/project.store';
import { ExportUtils } from '../../lib/exportUtils';

export default function ExportView() {
  const { project } = useProjectStore();

  if (!project) return null;

  const exportOptions = [
    {
      id: 'pdf',
      name: 'Relatório PDF',
      description: 'Documento formatado com o resumo e programa de necessidades.',
      icon: <FilePdf className="w-6 h-6 text-red-500" />,
      action: () => ExportUtils.exportToPDF(project)
    },
    {
      id: 'docx',
      name: 'Documento Word (.docx)',
      description: 'Documento editável para engenheiros e arquitetos.',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      action: () => ExportUtils.exportToDOCX(project)
    },
    {
      id: 'md',
      name: 'Markdown (.md)',
      description: 'Texto puro estruturado, ideal para documentação (Notion, GitHub).',
      icon: <FileText className="w-6 h-6 text-slate-700" />,
      action: () => ExportUtils.exportToMarkdown(project)
    },
    {
      id: 'csv',
      name: 'Planilha de Ambientes (.csv)',
      description: 'Lista de ambientes e descrições para Excel/Google Sheets.',
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
      action: () => ExportUtils.exportToCSV(project)
    },
    {
      id: 'json',
      name: 'Dados Brutos (.json)',
      description: 'Estado completo do projeto para integração com outros sistemas.',
      icon: <FileJson className="w-6 h-6 text-amber-500" />,
      action: () => ExportUtils.exportToJSON(project)
    },
    {
      id: 'dxf',
      name: 'AutoCAD Base (.dxf)',
      description: 'Gera um arquivo CAD com a geometria base (Hexágono) do projeto.',
      icon: <Hexagon className="w-6 h-6 text-indigo-500" />,
      action: () => ExportUtils.exportToDXF(project)
    }
  ];

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Download className="w-6 h-6 text-blue-600" />
          Exportar Projeto
        </h2>
        <p className="text-slate-500 mt-1">
          Baixe os dados do projeto em múltiplos formatos para compartilhar com sua equipe ou clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.action}
            className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors mb-4">
              {option.icon}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{option.name}</h3>
            <p className="text-sm text-slate-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
