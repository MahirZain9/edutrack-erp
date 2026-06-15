import React from 'react';
import { Printer, CheckCircle2, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo.svg';
import { formatINR, formatDate } from '../utils';

const ReceiptPDF = ({ receipt, student, fee }) => {
  if (!receipt || !student || !fee) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400">
        <ShieldAlert size={40} className="mb-2 text-rose-500" />
        <p className="text-sm font-semibold">Receipt Data Unavailable</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Helper to format class strings locally
  const formatClassName = (cid, div) => {
    if (cid === 'c3') return 'Std 10 - Div A';
    if (cid === 'c4') return 'Std 10 - Div B';
    if (cid === 'c1') return 'Std 9 - Div A';
    return `Std 9 - Div ${div || 'B'}`;
  };

  return (
    <div className="space-y-6">
      {/* Receipt Paper Area */}
      <div 
        id="receipt-print-area" 
        className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6 text-slate-700 max-w-xl mx-auto"
      >
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack Logo" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">EDUTRACK SCHOOL</h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Excellence in Education</p>
              <p className="text-xs text-slate-500">support@edutrack.com | +91 79 2321 0000</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100 uppercase tracking-wider mb-2">
              Paid
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Receipt No</p>
            <p className="text-sm font-mono font-bold text-slate-800">{receipt.receiptNumber}</p>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
          <div>
            <p className="text-slate-400 font-medium">Student Name</p>
            <p className="text-sm font-bold text-slate-800">{student.fullName}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">GR Number</p>
            <p className="text-sm font-mono font-semibold text-slate-800">{student.admissionNumber}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Standard & Division</p>
            <p className="text-sm font-semibold text-slate-800">{formatClassName(student.classId, student.division)}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Roll Number</p>
            <p className="text-sm font-semibold text-slate-800">{student.rollNumber}</p>
          </div>
          <div className="col-span-2 border-t border-slate-200/50 pt-2 mt-1">
            <p className="text-slate-400 font-medium">Parent / Guardian</p>
            <p className="text-sm font-bold text-slate-800">{student.parentName} ({student.parentMobile})</p>
          </div>
        </div>

        {/* Payment Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">
            <span>Fee Particulars</span>
            <span className="text-center">Mode</span>
            <span className="text-right">Amount Paid</span>
          </div>
          <div className="grid grid-cols-3 text-sm py-1 font-medium text-slate-800">
            <span>{fee.type} Fee ({fee.month})</span>
            <span className="text-center font-semibold text-slate-600">{receipt.paymentMode}</span>
            <span className="text-right font-bold">{formatINR(receipt.amountPaid)}</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
            <span>Total Paid</span>
            <span>{formatINR(receipt.amountPaid)}</span>
          </div>
        </div>

        {/* Footer info & Signature stamp */}
        <div className="flex justify-between items-end border-t border-slate-100 pt-5 mt-4">
          <div className="text-[10px] text-slate-400 max-w-[240px]">
            <p className="font-semibold text-slate-505">Terms & Conditions:</p>
            <p>This is a computer-generated digital receipt. No signature is required. Fees once paid are non-refundable.</p>
            <p className="mt-1 font-semibold">Date Paid: {formatDate(receipt.paymentDate)}</p>
          </div>
          {/* Digital Signature stamp simulation */}
          <div className="flex flex-col items-center justify-center border border-rose-100 rounded-lg p-2 bg-rose-50/50 scale-95 origin-bottom-right">
            <CheckCircle2 size={24} className="text-rose-500 mb-0.5" />
            <span className="text-[8px] font-bold text-rose-700 uppercase tracking-widest leading-none">Verified</span>
            <span className="text-[6px] text-rose-500 font-medium leading-none">EduTrack Admin</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          id="print-receipt-btn"
        >
          <Printer size={16} />
          Print / PDF Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptPDF;
