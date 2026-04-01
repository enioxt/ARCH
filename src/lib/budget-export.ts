/**
 * Budget Export Utils — PDF and Excel
 *
 * Generates professional budget reports in PDF and Excel formats
 * with complete pricing breakdown, scenarios, and source traceability.
 */

import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { BudgetReport } from '../schemas/budget.schema';

export class BudgetExportUtils {

  /**
   * Export budget report to PDF
   */
  static exportToPDF(budget: BudgetReport): void {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.text(`Orçamento: ${budget.projectName}`, 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Versão ${budget.version} | ${new Date(budget.generatedAt).toLocaleDateString('pt-BR')}`, 20, y);
    doc.text(`Região: ${budget.region} | Status: ${budget.status}`, 20, y + 5);
    y += 20;

    // Scenarios Summary
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text('Resumo de Cenários', 20, y);
    y += 8;

    doc.setFontSize(10);
    budget.scenarios.forEach((scenario) => {
      const label = scenario.scenario === 'economico' ? 'Econômico' :
                    scenario.scenario === 'padrao' ? 'Padrão' : 'Premium';
      doc.text(`${label}: R$ ${scenario.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, y);
      y += 6;
    });
    y += 10;

    // Items Breakdown
    doc.setFontSize(14);
    doc.text('Itens do Orçamento', 20, y);
    y += 8;

    doc.setFontSize(9);
    budget.items.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Item header
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${item.name}`, 20, y);
      doc.setFont(undefined, 'normal');
      y += 5;

      // Item details
      doc.text(`Categoria: ${item.category} | Qtd: ${item.quantity} ${item.unit}`, 25, y);
      y += 5;

      // Pricing
      doc.text(`Baixo: R$ ${item.totalLow.toFixed(2)} | ` +
               `Médio: R$ ${item.totalMid.toFixed(2)} | ` +
               `Alto: R$ ${item.totalHigh.toFixed(2)}`, 25, y);
      y += 5;

      // Confidence
      doc.setTextColor(item.confidenceScore >= 0.7 ? 0 : 200, 0, 0);
      doc.text(`Confiança: ${(item.confidenceScore * 100).toFixed(0)}%`, 25, y);
      doc.setTextColor(0);
      y += 8;
    });

    // Footer
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('EGOS Arch — Orçamento Gerado por IA', 20, y);
    doc.text('Este documento é uma estimativa e pode sofrer alterações.', 20, y + 4);

    doc.save(`orcamento-${budget.projectName}-v${budget.version}.pdf`);
  }

  /**
   * Export budget report to Excel (XLSX)
   */
  static exportToExcel(budget: BudgetReport): void {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      ['Orçamento do Projeto', budget.projectName],
      ['Versão', budget.version],
      ['Região', budget.region],
      ['Status', budget.status],
      ['Gerado em', new Date(budget.generatedAt).toLocaleDateString('pt-BR')],
      ['Atualizado em', new Date(budget.updatedAt).toLocaleDateString('pt-BR')],
      [],
      ['Cenário', 'Total (R$)', 'Materiais', 'Mão de Obra', 'Equipamentos', 'Logística', 'Contingência', 'BDI', 'Impostos'],
    ];

    budget.scenarios.forEach((scenario) => {
      const label = scenario.scenario === 'economico' ? 'Econômico' :
                    scenario.scenario === 'padrao' ? 'Padrão' : 'Premium';
      summaryData.push([
        label,
        scenario.total as any,
        scenario.subtotalMaterials as any,
        scenario.subtotalLabor as any,
        scenario.subtotalEquipment as any,
        scenario.subtotalLogistics as any,
        scenario.contingency as any,
        scenario.bdi as any,
        scenario.taxes as any,
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Sheet 2: Items Detail
    const itemsData = [
      ['Item', 'Categoria', 'Quantidade', 'Unidade', 'Baixo (R$)', 'Médio (R$)', 'Alto (R$)', 'Confiança (%)', 'Escolhido', 'Fatores', 'Fontes'],
    ];

    budget.items.forEach((item) => {
      itemsData.push([
        item.name,
        item.category,
        item.quantity as any,
        item.unit,
        item.totalLow as any,
        item.totalMid as any,
        item.totalHigh as any,
        (item.confidenceScore * 100).toFixed(0),
        item.chosenScenario,
        `Desperdício: ${item.wasteFactor}x | Regional: ${item.regionalFactor}x | Complexidade: ${item.complexityFactor}x`,
        item.sources.map(s => s.name).join(', '),
      ]);
    });

    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Itens');

    // Sheet 3: Price Sources
    const sourcesData = [
      ['Item', 'Fonte', 'Tipo', 'Baixo (R$)', 'Médio (R$)', 'Alto (R$)', 'Confiança (%)', 'URL'],
    ];

    budget.items.forEach((item) => {
      item.sources.forEach((source) => {
        sourcesData.push([
          item.name,
          source.name,
          source.type,
          source.low as any,
          source.mid as any,
          source.high as any,
          (source.confidence * 100).toFixed(0),
          source.url || 'N/A',
        ]);
      });
    });

    const sourcesSheet = XLSX.utils.aoa_to_sheet(sourcesData);
    XLSX.utils.book_append_sheet(workbook, sourcesSheet, 'Fontes');

    // Sheet 4: Assumptions & Alerts
    const notesData = [
      ['Metodologia'],
      ...budget.methodology.map(m => [m]),
      [],
      ['Alertas'],
      ...budget.alerts.map(a => [a]),
      [],
      ['Premissas Globais'],
      ...Object.entries(budget.assumptions).map(([key, value]) => [key, value]),
    ];

    const notesSheet = XLSX.utils.aoa_to_sheet(notesData);
    XLSX.utils.book_append_sheet(workbook, notesSheet, 'Observações');

    // Export
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `orcamento-${budget.projectName}-v${budget.version}.xlsx`);
  }

  /**
   * Export budget to JSON (for data interchange)
   */
  static exportToJSON(budget: BudgetReport): void {
    const dataStr = JSON.stringify(budget, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `orcamento-${budget.projectName}-v${budget.version}.json`);
  }

  /**
   * Export simplified CSV (items only)
   */
  static exportToCSV(budget: BudgetReport): void {
    let csv = 'Item,Categoria,Quantidade,Unidade,Baixo,Médio,Alto,Confiança\n';

    budget.items.forEach((item) => {
      const name = `"${item.name.replace(/"/g, '""')}"`;
      csv += `${name},${item.category},${item.quantity},${item.unit},${item.totalLow},${item.totalMid},${item.totalHigh},${(item.confidenceScore * 100).toFixed(0)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `orcamento-${budget.projectName}-v${budget.version}.csv`);
  }
}
