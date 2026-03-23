'use client';

import { useActionState } from 'react';
import { addUserAction } from '../user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AddUserForm() {
  const [state, formAction, isPending] = useActionState(addUserAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengguna</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="id">NIK / NISN</Label>
            <Input id="id" name="id" required placeholder="NUPTK atau NISN" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" required placeholder="Nama Pengguna" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="siswa" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="siswa">Siswa</SelectItem>
                <SelectItem value="guru">Guru</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pin">PIN Akses</Label>
            <Input id="pin" name="pin" type="password" required placeholder="Minimal 6 karakter" minLength={6} />
          </div>

          {state?.error && <p className="text-sm text-red-500 font-medium">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-500 font-medium">Pengguna berhasil ditambahkan!</p>}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan Pengguna
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
