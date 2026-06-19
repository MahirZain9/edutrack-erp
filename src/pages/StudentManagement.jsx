import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Filter,
  CheckCircle,
  XCircle,
  Camera
} from 'lucide-react';
import Modal from '../components/Modal';
import { formatDate } from '../utils';

const StudentManagement = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent } = useDatabase();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [classId, setClassId] = useState('c3'); // default Std 10 - Div A
  const [division, setDivision] = useState('A');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');

  // Handle Photo upload converting to base64 for storage
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId('');
    setFullName('');
    setRollNumber('');
    setAdmissionNumber('GR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    setClassId('c3');
    setDivision('A');
    setDob('');
    setGender('Male');
    setParentName('');
    setParentMobile('');
    setAddress('');

    // Default avatar SVG as string fallback
    const initials = 'ST';
    setPhoto(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100%" height="100%" fill="%23FFE4E6"/><text x="50" y="55" font-family="Arial" font-size="36" font-weight="bold" fill="%23BE123C" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`);

    setFormModalOpen(true);
  };

  const openEditModal = (stud) => {
    setIsEditing(true);
    setEditId(stud.id);
    setFullName(stud.fullName);
    setRollNumber(stud.rollNumber);
    setAdmissionNumber(stud.admissionNumber);
    setClassId(stud.classId);
    setDivision(stud.division);
    setDob(stud.dateOfBirth);
    setGender(stud.gender);
    setParentName(stud.parentName);
    setParentMobile(stud.parentMobile);
    setAddress(stud.address);
    setPhoto(stud.photo);

    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Dynamically adjust default SVG avatar initials on save if using default photo
    let finalPhoto = photo;
    if (photo.startsWith('data:image/svg+xml;utf8,<svg')) {
      const initials = fullName.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase();
      finalPhoto = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100%" height="100%" fill="%23FFE4E6"/><text x="50" y="55" font-family="Arial" font-size="36" font-weight="bold" fill="%23BE123C" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    }

    const studentData = {
      fullName,
      rollNumber,
      admissionNumber,
      classId,
      division,
      dateOfBirth: dob,
      gender,
      parentName,
      parentMobile,
      address,
      photo: finalPhoto,
      status: 'Active'
    };

    if (isEditing) {
      await updateStudent(editId, studentData);
    } else {
      await addStudent(studentData);
    }
    setFormModalOpen(false);
  };

  const handleStatusToggle = async (stud) => {
    const nextStatus = stud.status === 'Active' ? 'Inactive' : 'Active';
    await updateStudent(stud.id, { status: nextStatus });
  };

  const handleDelete = async (studId) => {
    if (confirm("Are you sure you want to delete this student profile?")) {
      await deleteStudent(studId);
    }
  };

  const openProfileModal = (stud) => {
    setSelectedStudent(stud);
    setProfileModalOpen(true);
  };

  // Filter and search logic
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.includes(searchQuery);
    const matchesClass = classFilter === '' || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage GR Register details, classrooms, parents, and academic statuses.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md transition-all duration-200 hover-scale"
          id="add-student-btn"
        >
          <UserPlus size={18} />
          New Admission
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">

        {/* Search input */}
        <div className="relative sm:col-span-2">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, GR number, roll number..."
            className="block w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
            id="student-search-input"
          />
        </div>

        {/* Class Filter Select */}
        <div className="relative">
          <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 appearance-none"
            id="class-filter-select"
          >
            <option value="">All Standards</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - Div {c.division}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Student List Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Student Details</th>
                <th className="py-4 px-6">GR Number</th>
                <th className="py-4 px-6">Standard & Division</th>
                <th className="py-4 px-6">Parent Info</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-sm">
              {filteredStudents.map(stud => (
                <tr key={stud.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Photo & Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={stud.photo}
                        alt={stud.fullName}
                        className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100 shrink-0 border border-slate-200/50"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800">{stud.fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Roll Number: {stud.rollNumber}</p>
                      </div>
                    </div>
                  </td>
                  {/* GR number */}
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-600">
                    {stud.admissionNumber}
                  </td>
                  {/* Class */}
                  <td className="py-4 px-6">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                      {classes.find(c => c.id === stud.classId)?.name || 'Std 10'} - Div {stud.division}
                    </span>
                  </td>
                  {/* Parent name */}
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-700">{stud.parentName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{stud.parentMobile}</p>
                  </td>
                  {/* Status Toggle */}
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleStatusToggle(stud)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200
                        ${stud.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }
                      `}
                      title="Click to toggle status"
                      id={`status-toggle-${stud.id}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stud.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {stud.status}
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openProfileModal(stud)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                        title="View Full Profile"
                        id={`view-profile-${stud.id}`}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(stud)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                        title="Edit Details"
                        id={`edit-student-${stud.id}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(stud.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                        title="Delete Student"
                        id={`delete-student-${stud.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No students match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid Cards View */}
        <div className="block md:hidden p-4 space-y-4">
          {filteredStudents.map(stud => (
            <div key={stud.id} className="p-4 border border-slate-100 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={stud.photo}
                  alt={stud.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{stud.fullName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Roll Number: {stud.rollNumber} | GR: {stud.admissionNumber}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stud.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                  {stud.status}
                </span>
              </div>
              <div className="grid grid-cols-2 text-xs border-t border-slate-100 pt-3">
                <div>
                  <p className="text-slate-400 font-medium">Classroom</p>
                  <p className="font-bold text-slate-700">{classes.find(c => c.id === stud.classId)?.name || 'Std 10'} - Div {stud.division}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Parent Contact</p>
                  <p className="font-bold text-slate-700">{stud.parentName} ({stud.parentMobile})</p>
                </div>
              </div>
              <div className="flex justify-end gap-1.5 border-t border-slate-50 pt-2.5">
                <button
                  onClick={() => openProfileModal(stud)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Eye size={14} /> Profile
                </button>
                <button
                  onClick={() => openEditModal(stud)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(stud.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="py-8 text-center text-slate-400 font-semibold">
              No students match the search criteria.
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEditing ? 'Edit Student Details' : 'New Admission Registration'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">

          {/* Avatar Upload Grid */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-white border border-slate-200 group">
              <img src={photo} alt="Avatar Preview" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity duration-200">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-slate-700">Student Profile Photo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Click preview to upload (JPG, PNG, max 1MB).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="Aarav Patel"
                id="form-student-name"
              />
            </div>

            {/* Admission Number (GR Number) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">GR Number</label>
              <input
                type="text"
                required
                disabled
                value={admissionNumber}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono font-bold"
                id="form-student-adm"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Roll Number</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, ''))}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="e.g. 10"
                id="form-student-roll"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                id="form-student-dob"
              />
            </div>

            {/* Class */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Standard</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                id="form-student-class"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - Div {c.division}</option>
                ))}
              </select>
            </div>

            {/* Division */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Division</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                id="form-student-division"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                id="form-student-gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Parent Mobile Number */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Parent Mobile Number</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={parentMobile}
                onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, ''))}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="9876543210"
                id="form-student-parent-phone"
              />
            </div>

            {/* Parent Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Parent / Guardian Full Name</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="Rajesh Patel"
                id="form-student-parent-name"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Residential Address</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all duration-200"
                placeholder="402, Shivalik Heights, Satellite, Ahmedabad"
                id="form-student-address"
              />
            </div>

          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white school-gradient hover:school-gradient-hover rounded-xl shadow-md transition-all hover-scale"
              id="form-student-save"
            >
              {isEditing ? 'Save Changes' : 'Confirm Registration'}
            </button>
          </div>

        </form>
      </Modal>

      {/* View Profile Detail Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Student Academic Profile"
      >
        {selectedStudent && (
          <div className="space-y-6">

            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
              <img
                src={selectedStudent.photo}
                alt={selectedStudent.fullName}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-md bg-slate-50 shrink-0"
              />
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{selectedStudent.fullName}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                    {classes.find(c => c.id === selectedStudent.classId)?.name || 'Std 10'} - Div {selectedStudent.division}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-mono font-bold">
                    Roll Number: {selectedStudent.rollNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedStudent.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                    }`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GR Number</p>
                <p className="font-mono font-bold text-slate-700 mt-0.5">{selectedStudent.admissionNumber}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                <p className="font-semibold text-slate-700 mt-0.5">{formatDate(selectedStudent.dateOfBirth)}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.gender}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Parent Contact</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.parentName} ({selectedStudent.parentMobile})</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl sm:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Home Address</p>
                <p className="font-medium text-slate-700 mt-0.5">{selectedStudent.address}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Close Profile
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default StudentManagement;
