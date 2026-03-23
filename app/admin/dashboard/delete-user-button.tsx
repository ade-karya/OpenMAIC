'use client';

import { useTransition } from 'react';
import { deleteUserAction } from '../user-actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteUserButton({ id, role }: { id: string; role: 'guru' | 'siswa' }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus ${role} dengan ID ${id}?`)) {
      startTransition(async () => {
        await deleteUserAction(id, role);
      });
    }
  };

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isPending}>
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}
