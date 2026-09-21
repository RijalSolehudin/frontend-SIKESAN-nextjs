'use client';

import { useState, useMemo } from 'react';
import { Student } from '../types';
import { useGetGuardians } from '../api/useGetGuardians';
import { useAssignGuardian } from '../api/useAssignGuardian';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserCheck, Mail, Search, CheckCircle2, User, Sparkles } from 'lucide-react';

interface GuardianMappingModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

interface GuardianMappingContentProps {
  student: Student;
  onClose: () => void;
}

function GuardianMappingContent({ student, onClose }: GuardianMappingContentProps) {
  const { data: guardians, isLoading: isLoadingGuardians } = useGetGuardians();
  const assignMutation = useAssignGuardian();

  const currentGuardian = student.guardians && student.guardians.length > 0 ? student.guardians[0] : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuardianId, setSelectedGuardianId] = useState<number | null>(currentGuardian ? currentGuardian.id : null);
  const [relationship, setRelationship] = useState<string>('Wali Santri');

  // Filter guardians by search query
  const filteredGuardians = useMemo(() => {
    if (!guardians) return [];
    if (!searchQuery.trim()) return guardians;
    const q = searchQuery.toLowerCase();
    return guardians.filter((g) => {
      const displayName = (g.name || g.username || '').toLowerCase();
      const email = (g.email || '').toLowerCase();
      const username = (g.username || '').toLowerCase();
      return displayName.includes(q) || email.includes(q) || username.includes(q);
    });
  }, [guardians, searchQuery]);

  const currentGuardianDisplayName = currentGuardian
    ? (currentGuardian.name || currentGuardian.username || 'Wali Terdaftar')
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuardianId) {
      toast.error('Silakan pilih 1 akun wali santri terlebih dahulu');
      return;
    }

    assignMutation.mutate(
      {
        studentId: student.id,
        data: {
          user_id: selectedGuardianId,
          relationship: relationship.trim() || 'Wali Santri',
          is_primary: true,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Wali santri berhasil dipetakan untuk ${student.name}`);
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Gagal memetakan wali santri');
        },
      }
    );
  };

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-emerald-600" />
          Pemetaan Wali Santri
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          Pilih 1 akun wali untuk santri: <strong className="text-slate-800">{student.name}</strong> (NIS: {student.nis}).
        </DialogDescription>
      </DialogHeader>

      {/* Current mapping info banner */}
      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Wali Saat Ini:</span>
        </div>
        {currentGuardianDisplayName ? (
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
            {currentGuardianDisplayName}
          </span>
        ) : (
          <span className="font-medium text-slate-400 italic">Belum dipetakan</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Live Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama atau email wali..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 h-9 text-xs rounded-xl bg-white/80"
          />
        </div>

        {/* Relationship field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">Hubungan Keluarga</label>
          <div className="flex items-center gap-2 flex-wrap">
            {['Wali Santri', 'Ayah', 'Ibu', 'Orang Tua'].map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => setRelationship(rel)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  relationship === rel
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>

        {/* Guardian List (Single Selection) */}
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {isLoadingGuardians ? (
            <div className="py-8 text-center text-slate-400 text-xs">Memuat data wali santri...</div>
          ) : filteredGuardians.length > 0 ? (
            filteredGuardians.map((guardian) => {
              const isSelected = selectedGuardianId === guardian.id;
              const displayName = guardian.name || guardian.username || guardian.email || 'Wali Santri';
              const initial = (guardian.name || guardian.username || 'W').charAt(0).toUpperCase();

              return (
                <div
                  key={guardian.id}
                  onClick={() => setSelectedGuardianId(guardian.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-slate-200/80 bg-white/80 hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {displayName}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                        {guardian.email}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              {searchQuery ? 'Tidak ada wali santri yang cocok dengan pencarian.' : 'Belum ada akun wali santri.'}
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 leading-snug flex items-start gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Sesuai ketentuan, 1 santri hanya terhubung ke 1 wali santri. Memilih wali baru akan otomatis memperbarui pemetaan santri ini.
          </span>
        </div>

        <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg text-xs">
            Batal
          </Button>
          <Button
            type="submit"
            disabled={assignMutation.isPending || !selectedGuardianId}
            className="rounded-lg font-semibold text-xs"
          >
            {assignMutation.isPending ? 'Menyimpan...' : 'Simpan Pemetaan'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function GuardianMappingModal({ student, isOpen, onClose }: GuardianMappingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] glass-modal p-6">
        {student && (
          <GuardianMappingContent 
            key={student.id} 
            student={student} 
            onClose={onClose} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
