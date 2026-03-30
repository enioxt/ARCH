import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';
import { Project } from '../schemas/project.schema';

export class ExportUtils {
  
  static exportToJSON(project: Project) {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `egos-arch-${project.name}.json`);
  }

  static exportToMarkdown(project: Project) {
    const currentVersion = project.versions.find(v => v.id === project.currentVersionId);
    const analysis = currentVersion?.analysis;

    let md = `# Projeto: ${project.name}\n\n`;
    md += `**Data:** ${new Date().toLocaleDateString()}\n\n`;
    
    if (analysis) {
      md += `## Resumo Executivo\n${analysis.resumo}\n\n`;
      md += `## Geometria Principal\n${analysis.geometria_principal}\n\n`;
      
      md += `## Programa de Necessidades\n`;
      analysis.ambientes.forEach(amb => {
        md += `- **${amb.nome}**: ${amb.descricao}\n`;
      });
      md += `\n`;

      if (analysis.pontos_chave && analysis.pontos_chave.length > 0) {
        md += `## Pontos Chave\n`;
        analysis.pontos_chave.forEach(pt => md += `- ${pt}\n`);
        md += `\n`;
      }

      if (analysis.ambiguidades && analysis.ambiguidades.length > 0) {
        md += `## Pontos de Atenção\n`;
        analysis.ambiguidades.forEach(amb => md += `- ${amb}\n`);
      }
    } else {
      md += `*Nenhuma análise estruturada disponível ainda.*\n\n`;
      md += `### Briefing Original\n${currentVersion?.briefing || ''}`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `egos-arch-${project.name}.md`);
  }

  static exportToCSV(project: Project) {
    const currentVersion = project.versions.find(v => v.id === project.currentVersionId);
    const analysis = currentVersion?.analysis;

    if (!analysis) {
      console.warn("Não há dados estruturados para exportar em CSV.");
      return;
    }

    let csv = "Ambiente,Descricao\n";
    analysis.ambientes.forEach(amb => {
      // Escape quotes and commas
      const nome = `"${amb.nome.replace(/"/g, '""')}"`;
      const desc = `"${amb.descricao.replace(/"/g, '""')}"`;
      csv += `${nome},${desc}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `egos-arch-${project.name}-ambientes.csv`);
  }

  static async exportToDOCX(project: Project) {
    const currentVersion = project.versions.find(v => v.id === project.currentVersionId);
    const analysis = currentVersion?.analysis;

    const children: any[] = [
      new Paragraph({
        text: `Projeto: ${project.name}`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: `Gerado pelo EGOS Arch Copilot`,
        spacing: { after: 400 },
      }),
    ];

    if (analysis) {
      children.push(
        new Paragraph({ text: "Resumo Executivo", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: analysis.resumo, spacing: { after: 200 } }),
        
        new Paragraph({ text: "Geometria", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: analysis.geometria_principal, spacing: { after: 200 } }),
        
        new Paragraph({ text: "Programa de Necessidades", heading: HeadingLevel.HEADING_2 })
      );

      analysis.ambientes.forEach(amb => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${amb.nome}: `, bold: true }),
              new TextRun(amb.descricao),
            ],
          })
        );
      });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `egos-arch-${project.name}.docx`);
  }

  static exportToPDF(project: Project) {
    const currentVersion = project.versions.find(v => v.id === project.currentVersionId);
    const analysis = currentVersion?.analysis;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text(`Projeto: ${project.name}`, 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`EGOS Arch - Relatório Gerado por IA`, 20, y);
    y += 20;

    if (analysis) {
      doc.setTextColor(0);
      doc.setFontSize(16);
      doc.text("Resumo Executivo", 20, y);
      y += 10;
      
      doc.setFontSize(12);
      const splitResumo = doc.splitTextToSize(analysis.resumo, 170);
      doc.text(splitResumo, 20, y);
      y += (splitResumo.length * 7) + 10;

      doc.setFontSize(16);
      doc.text("Programa de Necessidades", 20, y);
      y += 10;

      doc.setFontSize(12);
      analysis.ambientes.forEach(amb => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(undefined, 'bold');
        doc.text(`- ${amb.nome}:`, 20, y);
        doc.setFont(undefined, 'normal');
        
        const splitDesc = doc.splitTextToSize(amb.descricao, 160);
        doc.text(splitDesc, 30, y + 7);
        y += (splitDesc.length * 7) + 12;
      });
    }

    doc.save(`egos-arch-${project.name}.pdf`);
  }

  static exportToDXF(project: Project) {
    // Generate a simple ASCII DXF drawing a Hexagon as a proof of concept
    // In a real app, this would use a library like dxf-writer and real geometry data
    const radius = 500;
    let dxf = `0\nSECTION\n2\nENTITIES\n`;
    
    const sides = 6;
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * Math.PI * 2) / sides;
      points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    
    for (let i = 0; i < sides; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % sides];
      dxf += `0\nLINE\n8\n0\n10\n${p1.x.toFixed(2)}\n20\n${p1.y.toFixed(2)}\n30\n0.0\n11\n${p2.x.toFixed(2)}\n21\n${p2.y.toFixed(2)}\n31\n0.0\n`;
    }
    
    dxf += `0\nENDSEC\n0\nEOF\n`;

    const blob = new Blob([dxf], { type: 'application/dxf' });
    saveAs(blob, `egos-arch-${project.name}-base.dxf`);
  }
}
