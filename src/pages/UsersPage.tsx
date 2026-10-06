import { useState, useMemo } from 'react';
import { useStore } from '@/services/StoreContext';
import { Card, Badge, Button, Input, Select, EmptyState } from '@/components/ui';
import { formatDate, formatDateTime } from '@/utils/format';
import {
  ShieldCheck, Search, ChevronLeft, ChevronRight,
  Eye, Edit, Ban, KeyRound, Users as UsersIcon, Lock,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export function UsersPage() {
  const { users, roles, hasPermission } = useStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const canManage = hasPermission('roles.manage');

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (search) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.phone.includes(q)) return false;
      }
      if (roleFilter && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-slate-500 mt-1">Manage system users and their permissions</p>
        </div>
        {hasPermission('users.create') && <Button><UsersIcon className="w-4 h-4" /> Add User</Button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><UsersIcon className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{users.length}</p><p className="text-xs text-slate-500">Total Users</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{users.filter(u => u.status === 'ACTIVE').length}</p><p className="text-xs text-slate-500">Active</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><Lock className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{roles.length}</p><p className="text-xs text-slate-500">Roles</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div><div><p className="text-lg font-bold text-slate-900">{roles[0].permissions.length}</p><p className="text-xs text-slate-500">Permissions (Admin)</p></div></div></Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={search} onChange={setSearch} placeholder="Search name, email, phone..." icon={<Search className="w-4 h-4" />} />
          <Select value={roleFilter} onChange={setRoleFilter} placeholder="All roles" options={roles.map(r => ({ value: r.name, label: r.displayName }))} />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon={<UsersIcon className="w-12 h-12" />} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Last Login</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  {canManage && <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(u => {
                  const role = roles.find(r => r.name === u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: u.avatarColor }}>{u.name.charAt(0)}</div>
                          <span className="font-medium text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">{u.phone}</td>
                      <td className="px-4 py-3 text-center"><Badge color="blue">{role?.displayName ?? u.role}</Badge></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.lastLogin ? formatDateTime(u.lastLogin) : '—'}</td>
                      <td className="px-4 py-3 text-center"><Badge color={u.status === 'ACTIVE' ? 'green' : 'gray'}>{u.status}</Badge></td>
                      {canManage && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                            <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Deactivate"><Ban className="w-4 h-4" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Roles & Permissions */}
      {canManage && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Roles & Permissions Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">Permission</th>
                  {roles.map(r => <th key={r.id} className="text-center px-4 py-2 font-medium text-slate-600">{r.displayName}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles[0].permissions.map(perm => (
                  <tr key={perm} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-700 font-mono text-xs">{perm}</td>
                    {roles.map(r => (
                      <td key={r.id} className="text-center px-4 py-2">
                        {r.permissions.includes(perm) ? <Badge color="green">Yes</Badge> : <Badge color="gray">No</Badge>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
