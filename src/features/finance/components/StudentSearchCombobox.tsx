'use client';

import { useState, useRef, useEffect } from 'react';
import { useGetStudents } from '@/features/master-data/api/useGetStudents';
import { Student } from '@/features/master-data/types';
import { Search, Check, ChevronsUpDown, X, User, School } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudentSearchComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  error?: boolean;
}

export function StudentSearchCombobox({
  value,
  onValueChange,
  error,
}: StudentSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch students with search filter
  const { data: studentsData, isLoading } = useGetStudents({
    search: search.trim() ? search.trim() : undefined,
    per_page: 30,
  });

  const studentsList = studentsData?.data || [];

  // Derive active student without cascading state-in-effect
  const activeStudent = value
    ? selectedStudent?.id.toString() === value
      ? selectedStudent
      : studentsList.find((s) => s.id.toString() === value) || null
    : null;

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (student: Student) => {
    setSelectedStudent(student);
    onValueChange(student.id.toString());
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(null);
    onValueChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="student-search-listbox"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between h-10 px-3 rounded-xl border bg-white text-xs transition-all text-left ${
          error
            ? 'border-rose-300 focus:border-rose-500 ring-1 ring-rose-200'
            : open
            ? 'border-emerald-600 ring-2 ring-emerald-500/10'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {activeStudent ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="truncate flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-800 truncate">{activeStudent.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                NIS: {activeStudent.nis}
              </span>
              {activeStudent.classroom?.name && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium shrink-0">
                  {activeStudent.classroom.name}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Cari nama atau NIS santri...</span>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {activeStudent && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as any);
                }
              }}
              title="Batalkan pilihan"
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </div>
      </button>

      {/* Searchable Dropdown Popup */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden p-2 space-y-1.5 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama atau NIS santri..."
              className="pl-8.5 h-9 text-xs rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-600"
            />
          </div>

          {/* Results List */}
          <div id="student-search-listbox" role="listbox" className="max-h-[220px] overflow-y-auto space-y-0.5 pt-1">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Mencari santri...</span>
              </div>
            ) : studentsList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {search.trim()
                  ? `Tidak ada santri dengan kata kunci "${search}"`
                  : 'Tidak ada data santri'}
              </div>
            ) : (
              studentsList.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(student)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                          NIS: {student.nis}
                        </span>
                        {student.classroom?.name && (
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <School className="h-2.5 w-2.5 text-slate-400" />
                            {student.classroom.name}
                          </span>
                        )}
                        {student.dormitory?.name && (
                          <span className="text-slate-400 font-medium">· {student.dormitory.name}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
