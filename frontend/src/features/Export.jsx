import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Icon } from '../components/index.jsx';

export default function Export({ complaints }) {
    const exportCSV = () => {
        const data = complaints.map(c => ({
            ID: c.id, Title: c.title, Category: c.category, Priority: c.priority,
            Status: c.status, Citizen: c.citizenName, 'Assigned To': c.assignedTo,
            Address: c.address, Date: c.createdAt || c.date, Rating: c.rating || ''
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'SUGRS_complaints.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18); doc.setFont('helvetica', 'bold');
        doc.text('SUGRS — Complaint Report', 14, 20);
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()} | Total: ${complaints.length}`, 14, 28);
        autoTable(doc, {
            startY: 35,
            head: [['ID', 'Title', 'Category', 'Priority', 'Status', 'Date']],
            body: complaints.map(c => [c.id, c.title.slice(0, 35), c.category, c.priority, c.status.replace('_', ' '), c.createdAt || c.date]),
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        doc.save('SUGRS_complaints.pdf');
    };

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportCSV} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <Icon name="download" size={14} /> Export CSV
            </button>
            <button onClick={exportPDF} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <Icon name="download" size={14} /> Export PDF
            </button>
        </div>
    );
}
