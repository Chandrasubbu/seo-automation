import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFOptions {
    title: string;
    keyword: string;
    brand: string;
    content: string;
}

export function generatePDF(options: PDFOptions) {
    const { title, keyword, brand, content } = options;

    // Create PDF with A4 size
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    let yPosition = margin;

    // Helper to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            addFooter();
            return true;
        }
        return false;
    };

    // Add footer with page numbers
    const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
            `Page ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.setTextColor(0);
    };

    // Header with branding
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SEO Blueprint Report', margin, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 30);

    yPosition = 50;

    // Metadata section
    doc.setTextColor(0);
    doc.setFillColor(240, 240, 245);
    doc.rect(margin, yPosition, contentWidth, 30, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Details', margin + 5, yPosition + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Brand: ${brand || 'N/A'}`, margin + 5, yPosition + 16);
    doc.text(`Target Keyword: ${keyword}`, margin + 5, yPosition + 24);

    yPosition += 40;

    // Parse and render markdown content
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            yPosition += 3;
            continue;
        }

        // H1 Headers
        if (line.startsWith('# ')) {
            checkPageBreak(15);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(99, 102, 241);
            const text = line.replace('# ', '');
            doc.text(text, margin, yPosition);
            yPosition += 10;
            doc.setDrawColor(99, 102, 241);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
            doc.setTextColor(0);
        }
        // H2 Headers
        else if (line.startsWith('## ')) {
            checkPageBreak(12);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            const text = line.replace('## ', '');
            doc.text(text, margin, yPosition);
            yPosition += 8;
            doc.setTextColor(0);
        }
        // H3 Headers
        else if (line.startsWith('### ')) {
            checkPageBreak(10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const text = line.replace('### ', '');
            doc.text(text, margin, yPosition);
            yPosition += 7;
        }
        // Bold text
        else if (line.startsWith('**') && line.endsWith('**')) {
            checkPageBreak(8);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const text = line.replace(/\*\*/g, '');
            doc.text(text, margin, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'normal');
        }
        // List items
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            checkPageBreak(8);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const text = line.replace(/^[-*] /, '');
            const cleanText = text.replace(/\*\*/g, '');
            const splitText = doc.splitTextToSize(cleanText, contentWidth - 10);
            doc.text('•', margin + 2, yPosition);
            doc.text(splitText, margin + 8, yPosition);
            yPosition += splitText.length * 5 + 2;
        }
        // Regular paragraphs
        else {
            checkPageBreak(8);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const cleanText = line.replace(/\*\*/g, '');
            const splitText = doc.splitTextToSize(cleanText, contentWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 5 + 3;
        }
    }

    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Generate filename
    const filename = `SEO-Blueprint-${keyword.replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    // Download
    doc.save(filename);
}
