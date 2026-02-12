import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF receipt for trade-in
 * Combines Invoice + Report style
 */
export const generateTradeInPDF = (tradeIn) => {
    const doc = new jsPDF();

    // Header - Invoice Style
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SIMUKITAA TRADE-IN RECEIPT', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Trade-In ID: #${tradeIn.id}`, 105, 30, { align: 'center' });
    doc.text(`Date: ${new Date(tradeIn.createdAt).toLocaleDateString()}`, 105, 36, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    let yPos = 50;

    // Customer Information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information', 20, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${tradeIn.customerName}`, 20, yPos);
    yPos += 6;
    doc.text(`Phone: ${tradeIn.customerPhone}`, 20, yPos);
    yPos += 12;

    // Device Details - Table
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Device Details', 20, yPos);
    yPos += 5;

    doc.autoTable({
        startY: yPos,
        head: [['Property', 'Value']],
        body: [
            ['Brand', tradeIn.deviceInfo?.brand || 'N/A'],
            ['Model', tradeIn.deviceInfo?.model || 'N/A'],
            ['Storage', tradeIn.deviceInfo?.storage || 'N/A'],
            ['Color', tradeIn.deviceInfo?.color || 'N/A'],
            ['Serial Number', tradeIn.deviceInfo?.serialNumber || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Condition Assessment
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Condition Assessment', 20, yPos);
    yPos += 5;

    doc.autoTable({
        startY: yPos,
        head: [['Component', 'Condition', 'Rating']],
        body: [
            ['Screen', tradeIn.condition?.screen || 'N/A', getStars(tradeIn.condition?.screen)],
            ['Body', tradeIn.condition?.body || 'N/A', getStars(tradeIn.condition?.body)],
            ['Battery', `${tradeIn.condition?.battery || 0}%`, getBatteryRating(tradeIn.condition?.battery)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Valuation - Invoice Style
    if (tradeIn.valuation) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Valuation', 20, yPos);
        yPos += 5;

        doc.autoTable({
            startY: yPos,
            body: [
                ['Market Value', `TSH ${tradeIn.valuation.marketValue?.toLocaleString() || 0}`],
                ['Recommended Offer', `TSH ${tradeIn.valuation.recommendedOffer?.toLocaleString() || 0}`],
                ['Min Offer', `TSH ${tradeIn.valuation.minOffer?.toLocaleString() || 0}`],
                ['Max Offer', `TSH ${tradeIn.valuation.maxOffer?.toLocaleString() || 0}`]
            ],
            theme: 'plain',
            margin: { left: 20, right: 20 },
            styles: { fontSize: 11 }
        });

        yPos = doc.lastAutoTable.finalY + 5;
    }

    // Approved Value - Highlighted
    if (tradeIn.status === 'approved' && tradeIn.approvedValue) {
        doc.setFillColor(34, 197, 94); // Green
        doc.rect(20, yPos, 170, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('APPROVED VALUE:', 25, yPos + 10);
        doc.text(`TSH ${tradeIn.approvedValue.toLocaleString()}`, 165, yPos + 10, { align: 'right' });

        doc.setTextColor(0, 0, 0);
        yPos += 20;
    }

    // Approval Details
    if (tradeIn.status === 'approved') {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Approval Details', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Approved By: ${tradeIn.approvedBy || 'CEO'}`, 20, yPos);
        yPos += 6;
        doc.text(`Approval Date: ${tradeIn.approvedAt ? new Date(tradeIn.approvedAt).toLocaleDateString() : 'N/A'}`, 20, yPos);
        yPos += 6;
        doc.text(`Category: ${tradeIn.approvedCategory || 'Used'}`, 20, yPos);
        yPos += 6;
        if (tradeIn.approvalNotes) {
            doc.text(`Notes: ${tradeIn.approvalNotes}`, 20, yPos);
        }
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for choosing Simukitaa Premium System', 105, 280, { align: 'center' });
    doc.text('This is a computer-generated receipt', 105, 285, { align: 'center' });

    return doc;
};

// Helper functions
const getStars = (condition) => {
    const stars = {
        'excellent': '⭐⭐⭐⭐⭐',
        'good': '⭐⭐⭐⭐',
        'fair': '⭐⭐⭐',
        'poor': '⭐⭐'
    };
    return stars[condition] || '⭐';
};

const getBatteryRating = (battery) => {
    if (battery >= 90) return 'Excellent';
    if (battery >= 80) return 'Good';
    if (battery >= 70) return 'Fair';
    return 'Poor';
};

/**
 * Convert PDF to base64 for storage
 */
export const pdfToBase64 = (pdf) => {
    return pdf.output('dataurlstring');
};

/**
 * Open PDF in new tab
 */
export const viewPDF = (pdfBase64) => {
    const blob = base64ToBlob(pdfBase64);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};

const base64ToBlob = (base64) => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
};
