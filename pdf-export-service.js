// src/services/PdfExportService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class PdfExportService {
  /**
   * Export dashboard analytics to PDF
   * @param {Object} data - Dashboard data to export
   * @returns {Promise} - Promise that resolves when PDF is generated and downloaded
   */
  static exportDashboard(data) {
    return new Promise((resolve, reject) => {
      try {
        // Create new PDF document
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add header
        this._addHeader(doc, data);
        
        // Add organization metrics
        this._addOrganizationMetrics(doc, data);
        
        // Add role distribution
        this._addRoleDistribution(doc, data);
        
        // Add personnel metrics
        this._addPersonnelMetrics(doc, data);
        
        // Add comparison metrics if both current and future states exist
        this._addComparisonMetrics(doc, data);
        
        // Add footer
        this._addFooter(doc);
        
        // Save the PDF
        doc.save(`${data.factory}_${data.phase}_analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
        
        resolve();
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Export organization chart to PDF
   * @param {Object} data - Organization chart data to export
   * @returns {Promise} - Promise that resolves when PDF is generated and downloaded
   */
  static exportOrgChart(data) {
    return new Promise((resolve, reject) => {
      try {
        // Create new PDF document
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a3'
        });
        
        // Add header
        this._addHeader(doc, data);
        
        // Add the org chart image (assuming a base64 image string is provided)
        if (data.chartImage) {
          doc.addImage(data.chartImage, 'PNG', 10, 40, 277, 180);
        } else {
          // If no image is provided, add a message
          doc.setFontSize(12);
          doc.text('Organization chart image not available.', 10, 60);
        }
        
        // Add a legend
        this._addOrgChartLegend(doc);
        
        // Add footer
        this._addFooter(doc);
        
        // Save the PDF
        doc.save(`${data.factory}_${data.phase}_org_chart_${new Date().toISOString().slice(0, 10)}.pdf`);
        
        resolve();
      } catch (error) {
        console.error('Error generating org chart PDF:', error);
        reject(error);
      }
    });
  }
  
  // Private methods for PDF generation
  
  /**
   * Add header to PDF
   * @param {Object} doc - jsPDF document object
   * @param {Object} data - Dashboard data
   * @private
   */
  static _addHeader(doc, data) {
    doc.setFillColor(204, 32, 48); // PCI Red
    doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Quality Re-organization Tool', 10, 10);
    
    doc.setFontSize(12);
    
    const factoryText = `Focus Factory: ${data.factory}`;
    const phaseText = `Phase: ${data.phase.charAt(0).toUpperCase() + data.phase.slice(1)}`;
    const dateText = `Generated: ${new Date().toLocaleDateString()}`;
    
    doc.text(factoryText, 10, 18);
    
    // Right-aligned text
    doc.text(phaseText, doc.internal.pageSize.width - 10 - doc.getTextWidth(phaseText), 18);
    doc.text(dateText, doc.internal.pageSize.width - 10 - doc.getTextWidth(dateText), 10);
  }
  
  /**
   * Add organization metrics section to PDF
   * @param {Object} doc - jsPDF document object
   * @param {Object} data - Dashboard data
   * @private
   */
  static _addOrganizationMetrics(doc, data) {
    const metrics = data.organizationMetrics;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Organization Metrics', 10, 35);
    
    const tableBody = [
      ['Total Positions', metrics.positionCount.toString()],
      ['Reporting Lines', metrics.reportingLineCount.toString()],
      ['Organizational Depth', `${metrics.orgDepth} levels`],
      ['Organizational Width', `${metrics.orgWidth} positions`],
      ['Span of Control', metrics.spanOfControl.toString()]
    ];
    
    doc.autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 81, 138], // PCI Blue
        textColor: [255, 255, 255]
      },
      margin: { left: 10, right: 10 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right' }
      }
    });
  }
  
  /**
   * Add role distribution section to PDF
   * @param {Object} doc - jsPDF document object
   * @param {Object} data - Dashboard data
   * @private
   */
  static _addRoleDistribution(doc, data) {
    const roleDistribution = data.roleDistribution;
    
    doc.setFontSize(14);
    doc.text('Role Distribution by Department', 10, doc.autoTable.previous.finalY + 15);
    
    const tableHead = [['Department', 'Total Roles', 'Assigned', 'Unassigned', 'Assignment Rate']];
    const tableBody = roleDistribution.map(dept => [
      dept.name,
      dept.total.toString(),
      dept.assigned.toString(),
      dept.unassigned.toString(),
      `${dept.assignmentRate}%`
    ]);
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: tableHead,
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 81, 138], // PCI Blue
        textColor: [255, 255, 255]
      },
      margin: { left: 10, right: 10 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' }
      }
    });
  }
  
  /**
   * Add personnel metrics section to PDF
   * @param {Object} doc - jsPDF document object
   * @param {Object} data - Dashboard data
   * @private
   */
  static _addPersonnelMetrics(doc, data) {
    const metrics = data.personnelMetrics;
    
    // Check if we need to add a new page
    if (doc.autoTable.previous.finalY > doc.internal.pageSize.height - 70) {
      doc.addPage();
    } else {
      doc.setFontSize(14);
      doc.text('Personnel Metrics', 10, doc.autoTable.previous.finalY + 15);
    }
    
    const tableBody = [
      ['Total Personnel', metrics.totalPersonnel.toString()],
      ['Assigned Personnel', metrics.assignedCount.toString()],
      ['Unassigned Personnel', metrics.unassignedCount.toString()],
      ['Assignment Rate', `${metrics.assignmentRate}%`]
    ];
    
    // Add availability breakdown
    Object.entries(metrics.availabilityGroups).forEach(([status, count]) => {
      if (count > 0) {
        tableBody.push([`${status} Personnel`, count.toString()]);
      }
    });
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Metric', 'Value']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 81, 138], // PCI Blue
        textColor: [255, 255, 255]
      },
      margin: { left: 10, right: 10 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right' }
      }
    });
  }
  
  /**
   * Add comparison metrics section to PDF
   * @param {Object} doc - jsPDF document object
   * @param {Object} data - Dashboard data
   * @private
   */
  static _addComparisonMetrics(doc, data) {
    const comparison = data.comparisonMetrics;
    
    // Check if we need to add a new page
    if (doc.autoTable.previous.finalY > doc.internal.pageSize.height - 100) {
      doc.addPage();
    } else {
      doc.setFontSize(14);
      doc.text('Current vs Future Comparison', 10, doc.autoTable.previous.finalY + 15);
    }
    
    const tableHead = [['Metric', 'Current State', 'Future State', 'Change', 'Change %']];
    const tableBody = [
      [
        'Positions',
        comparison.current.positionCount.toString(),
        comparison.future.positionCount.toString(),
        comparison.changes.positionChange.toString(),
        `${comparison.changes.positionChangePercent}%`
      ],
      [
        'Reporting Lines',
        comparison.current.reportingLineCount.toString(),
        comparison.future.reportingLineCount.toString(),
        comparison.changes.reportingLineChange.toString(),
        `${comparison.changes.reportingLineChangePercent}%`
      ],
      [
        'Depth',
        comparison.current.depth.toString(),
        comparison.future.depth.toString(),
        comparison.changes.depthChange.toString(),
        `${comparison.changes.depthChangePercent}%`
      ],
      [
        'Width',
        comparison.current.width.toString(),
        comparison.future.width.toString(),
        comparison.changes.widthChange.toString(),
        `${comparison.changes.widthChangePercent}%`
      ]
    ];
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: tableHead,
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 81, 138], // PCI Blue
        textColor: [255, 255, 255]
      },
      margin: { left: 10, right: 10 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      }
    });
    
    // Add added/removed positions section
    doc.setFontSize(12);
    doc.text('Position Changes:', 10, doc.autoTable.previous.finalY + 15);
    
    // Added positions
    if (comparison.addedPositions.length > 0) {
      doc.text('Added Positions:', 15, doc.autoTable.previous.finalY + 25);
      
      comparison.addedPositions.forEach((position, index) => {
        doc.text(`• ${position}`, 20, doc.autoTable.previous.finalY + 35 + (index * 5));
      });
    } else {
      doc.text('• No positions added', 15, doc.autoTable.previous.finalY + 25);
    }
    
    // Adjust Y position for removed positions
    let yPos = doc.autoTable.previous.finalY + 35;
    if (comparison.addedPositions.length > 0) {
      yPos += comparison.addedPositions.length * 5;
    }
    
    // Removed positions
    if (comparison.removedPositions.length > 0) {
      doc.text('Removed Positions:', 15, yPos);
      
      comparison.removedPositions.forEach((position, index) => {
        doc.text(`• ${position}`, 20, yPos + 10 + (index * 5));
      });
    } else {
      doc.text('• No positions removed', 15, yPos);
    }
  }
  
  /**
   * Add org chart legend to PDF
   * @param {Object} doc - jsPDF document object
   * @private
   */
  static _addOrgChartLegend(doc) {
    doc.setFontSize(12);
    doc.text('Legend:', 10, doc.internal.pageSize.height - 30);
    
    // Draw legend items
    // Position boxes
    doc.setDrawColor(204, 32, 48); // ADD - Red
    doc.setFillColor(255, 255, 255);
    doc.rect(15, doc.internal.pageSize.height - 25, 10, 5, 'FD');
    doc.text('ADD Factory', 30, doc.internal.pageSize.height - 21);
    
    doc.setDrawColor(0, 81, 138); // BBV - Blue
    doc.rect(80, doc.internal.pageSize.height - 25, 10, 5, 'FD');
    doc.text('BBV Factory', 95, doc.internal.pageSize.height - 21);
    
    doc.setDrawColor(35, 35, 35); // SYN - Dark Grey
    doc.rect(145, doc.internal.pageSize.height - 25, 10, 5, 'FD');
    doc.text('SYN Factory', 160, doc.internal.pageSize.height - 21);
    
    // Vacancy indicator
    doc.setFillColor(255, 248, 225); // Light yellow background
    doc.rect(210, doc.internal.pageSize.height - 25, 10, 5, 'F');
    doc.text('Vacancy', 225, doc.internal.pageSize.height - 21);
  }
  
  /**
   * Add footer to PDF
   * @param {Object} doc - jsPDF document object
   * @private
   */
  static _addFooter(doc) {
    // Add page numbers to all pages
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`, 
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
      
      doc.text(
        'Generated by Quality Re-organization Tool',
        doc.internal.pageSize.width - 10,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
  }
}

export default PdfExportService;