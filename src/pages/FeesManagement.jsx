import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  CreditCard, 
  Search, 
  PlusCircle, 
  IndianRupee, 
  AlertTriangle,
  Receipt,
  FileCheck,
  Printer,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Modal from '../components/Modal';
import ReceiptPDF from '../components/ReceiptPDF';
import { formatINR, formatDate } from '../utils';

const FeesManagement = () => {
  const { students, fees, receipts, addFeeStructure, markFeePaid, markFeeUnpaid, classes } = useDatabase();
  
  // Tabs
  const [activeSubTab, setActiveSubTab] = useState('invoices'); // 'invoices', 'allocate', 'receipts'
  
  // Search / Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('');
  
  // Modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  
  // Pay Form states
  const [activeFee, setActiveFee] = useState(null);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState(0);

  // Print Receipt states
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Allocate Fee Form states
  const [allocateTarget, setAllocateTarget] = useState('student'); // 'student' or 'class'
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetClassId, setTargetClassId] = useState('c3');
  const [feeType, setFeeType] = useState('Monthly');
  const [feeMonth, setFeeMonth] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');
  const [allocateSuccess, setAllocateSuccess] = useState(false);

  // Dashboard Stats
  const totalCollection = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingCollection = fees.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);
  const totalInvoiced = totalCollection + pendingCollection;

  const handleOpenPayModal = (fee) => {
    setActiveFee(fee);
    setAmountPaid(fee.amount);
    setPaymentMode('CASH');
    setPayModalOpen(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (amountPaid <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }
    
    // Process payment
    const newReceipt = await markFeePaid(activeFee.id, amountPaid, paymentMode);
    setPayModalOpen(false);
    
    // Automatically open the printed receipt modal!
    setActiveReceipt(newReceipt);
    setReceiptModalOpen(true);
  };

  const handleOpenReceiptModal = (receiptId) => {
    const rcpt = receipts.find(r => r.id === receiptId);
    setActiveReceipt(rcpt);
    setReceiptModalOpen(true);
  };

  const handleAllocateFee = async (e) => {
    e.preventDefault();
    if (parseFloat(feeAmount) <= 0 || !feeMonth || !feeDueDate) {
      alert("Please check your input fields.");
      return;
    }

    const feeBase = {
      amount: parseFloat(feeAmount),
      type: feeType,
      month: feeMonth,
      status: 'Unpaid',
      dueDate: feeDueDate
    };

    if (allocateTarget === 'student') {
      if (!targetStudentId) {
        alert("Please select a student.");
        return;
      }
      await addFeeStructure({ ...feeBase, studentId: targetStudentId });
    } else {
      // Allocate to entire class
      const classStudents = students.filter(s => s.classId === targetClassId && s.status === 'Active');
      if (classStudents.length === 0) {
        alert("No active students found in this class.");
        return;
      }
      // Loop and insert
      for (const stud of classStudents) {
        await addFeeStructure({ ...feeBase, studentId: stud.id });
      }
    }

    setAllocateSuccess(true);
    setFeeAmount('');
    setFeeMonth('');
    setFeeDueDate('');
    setTimeout(() => {
      setAllocateSuccess(false);
      setActiveSubTab('invoices');
    }, 1500);
  };

  // Filter fees
  const filteredFees = fees.filter(f => {
    const stud = students.find(s => s.id === f.studentId);
    if (!stud) return false;
    
    const matchesSearch = stud.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stud.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.month.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = feeStatusFilter === '' || f.status === feeStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Fees & Accounts</h1>
          <p className="text-slate-500 text-xs mt-0.5">Collect student fees, configure structures, and print payment invoices.</p>
        </div>
        
        {/* Navigation Sub-Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeSubTab === 'invoices' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-fee-invoices"
          >
            Fee Invoices
          </button>
          <button
            onClick={() => setActiveSubTab('allocate')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeSubTab === 'allocate' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-allocate-fee"
          >
            Issue Fee Invoice
          </button>
          <button
            onClick={() => setActiveSubTab('receipts')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeSubTab === 'receipts' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-receipt-history"
          >
            Receipt Ledger
          </button>
        </div>
      </div>

      {/* Account Dashboard Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</p>
            <h4 className="text-xl font-extrabold text-slate-850">{formatINR(totalCollection)}</h4>
          </div>
        </div>
        
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</p>
            <h4 className="text-xl font-extrabold text-slate-850">{formatINR(pendingCollection)}</h4>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</p>
            <h4 className="text-xl font-extrabold text-slate-850">{formatINR(totalInvoiced)}</h4>
          </div>
        </div>
      </div>

      {/* WORKSPACE: FEE INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Search/Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative sm:col-span-2">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, admission ID or billing month..."
                className="block w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                id="fee-search-input"
              />
            </div>
            
            <div className="relative">
              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value)}
                className="block w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                id="fee-status-select"
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid Only</option>
                <option value="Unpaid">Unpaid Only</option>
              </select>
            </div>
          </div>

          {/* Invoice Table list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Roster Student</th>
                    <th className="py-4 px-6">Billing Particulars</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Invoice Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 text-sm">
                  {filteredFees.map(fee => {
                    const stud = students.find(s => s.id === fee.studentId);
                    const classObj = classes.find(c => c.id === stud?.classId);
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img src={stud?.photo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                            <div>
                              <h4 className="font-bold text-slate-800">{stud?.fullName}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">Std: {classObj?.name || 'Std 10'} - Div {stud?.division} | GR: {stud?.admissionNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-700">{fee.type} Fee</p>
                          <p className="text-[10px] text-slate-400 font-medium">{fee.month}</p>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">{formatDate(fee.dueDate)}</td>
                        <td className="py-4 px-6 font-extrabold text-slate-800">{formatINR(fee.amount)}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border
                            ${fee.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                            }
                          `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${fee.status === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {fee.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {fee.status === 'Unpaid' ? (
                            <button
                              onClick={() => handleOpenPayModal(fee)}
                              className="px-3.5 py-1.5 text-xs font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-sm transition-all"
                              id={`collect-fee-${fee.id}`}
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const receipt = receipts.find(r => r.feeId === fee.id);
                                if (receipt) handleOpenReceiptModal(receipt.id);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                              id={`view-receipt-${fee.id}`}
                            >
                              <Receipt size={12} /> Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                        No fee invoices match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE: ALLOCATE FEE */}
      {activeSubTab === 'allocate' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3">Issue Roster Invoice</h3>
          
          {allocateSuccess ? (
            <div className="text-center py-8 space-y-3 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
              <h4 className="text-lg font-bold text-slate-800">Fee Invoices Issued Successfully!</h4>
              <p className="text-xs text-slate-400">Rosters will reflect changes immediately in parent profiles.</p>
            </div>
          ) : (
            <form onSubmit={handleAllocateFee} className="space-y-4">
              
              {/* Target Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAllocateTarget('student')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    allocateTarget === 'student' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                  }`}
                  id="target-student"
                >
                  Allocate to Single Student
                </button>
                <button
                  type="button"
                  onClick={() => setAllocateTarget('class')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    allocateTarget === 'class' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                  }`}
                  id="target-class"
                >
                  Allocate to Entire Class
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* target selection */}
                {allocateTarget === 'student' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Target Student</label>
                    <select
                      value={targetStudentId}
                      required
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                      id="allocate-student-select"
                    >
                      <option value="">-- Select Student --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNumber})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Target Class</label>
                    <select
                      value={targetClassId}
                      required
                      onChange={(e) => setTargetClassId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                      id="allocate-class-select"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}-{c.division}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fee Type */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Billing Period Type</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                    id="allocate-fee-type"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                {/* Period Month name */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Period (e.g. Month / Term)</label>
                  <input
                    type="text"
                    required
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(e.target.value)}
                    placeholder="e.g. June 2026 or Term 1"
                    className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                    id="allocate-fee-period"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Fee Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="1200"
                    className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                    id="allocate-fee-amount"
                  />
                </div>

                {/* Due Date */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                    id="allocate-fee-due"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md transition-all hover-scale"
                  id="allocate-fee-submit"
                >
                  Issue Billing Invoice
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* WORKSPACE: RECEIPT HISTORY */}
      {activeSubTab === 'receipts' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-505">Transaction Receipt Ledger ({receipts.length} Receipts)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                  <th className="py-4 px-6">Receipt No</th>
                  <th className="py-4 px-6">Student Roster</th>
                  <th className="py-4 px-6">Payment Date</th>
                  <th className="py-4 px-6">Mode</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-sm">
                {receipts.map(rcpt => {
                  const stud = students.find(s => s.id === rcpt.studentId);
                  return (
                    <tr key={rcpt.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-600">{rcpt.receiptNumber}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{stud?.fullName || 'Unknown Student'}</td>
                      <td className="py-4 px-6 text-slate-500">{formatDate(rcpt.paymentDate)}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] uppercase">
                          {rcpt.paymentMode}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">{formatINR(rcpt.amountPaid)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenReceiptModal(rcpt.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
                          id={`view-receipt-ledger-${rcpt.id}`}
                        >
                          <Printer size={12} /> Print PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      No transaction history receipts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Fee Payment Collection"
      >
        {activeFee && (
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="font-medium text-slate-400">Student Roster:</span>
                <span className="font-bold text-slate-800">
                  {students.find(s => s.id === activeFee.studentId)?.fullName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="font-medium text-slate-400">Fee Particulars:</span>
                <span className="font-bold text-slate-800">{activeFee.type} Fee ({activeFee.month})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Total Bill Due:</span>
                <span className="font-extrabold text-slate-800">{formatINR(activeFee.amount)}</span>
              </div>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Payment Mode */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                  id="collect-payment-mode"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="NEFT">NEFT</option>
                </select>
              </div>
 
              {/* Amount Paid */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                  id="collect-amount-paid"
                />
              </div>

            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md transition-all hover-scale"
                id="confirm-payment-btn"
              >
                Confirm Payment & Print Receipt
              </button>
            </div>

          </form>
        )}
      </Modal>

      {/* Visual / Printable Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Payment Collection Receipt"
      >
        {activeReceipt && (
          <ReceiptPDF 
            receipt={activeReceipt}
            student={students.find(s => s.id === activeReceipt.studentId)}
            fee={fees.find(f => f.id === activeReceipt.feeId)}
          />
        )}
      </Modal>

    </div>
  );
};

export default FeesManagement;
