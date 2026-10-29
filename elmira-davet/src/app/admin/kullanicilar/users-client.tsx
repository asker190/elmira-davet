"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  Users2,
  History,
  Shield,
  ShieldCheck,
  UserPlus,
  Trash2,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Mail,
  User,
  Sparkles,
  Pencil,
} from "lucide-react";
import { createUser, updateUserRole, deleteUser, updateUser } from "../actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  createdAt?: string;
}

interface AuditLogItem {
  id: string;
  user: string;
  email: string;
  action: string;
  module: string;
  details?: string;
  timestamp: string;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  initialLogs: AuditLogItem[];
}

export function UsersClient({ initialUsers, initialLogs }: UsersClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [isPending, startTransition] = useTransition();

  // Create User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as "ADMIN" | "EDITOR",
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as "ADMIN" | "EDITOR",
  });

  // Log filters
  const [logSearch, setLogSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  // Edit user
  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      toast.error("İsim ve e-posta zorunludur");
      return;
    }
    if (editFormData.password && editFormData.password.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateUser(editingUser.id, editFormData);
        if (res.success) {
          toast.success(`"${editFormData.name}" kullanıcısı başarıyla güncellendi`);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser.id
                ? { ...u, name: editFormData.name, email: editFormData.email, role: editFormData.role }
                : u
            )
          );
          setEditingUser(null);
        } else {
          toast.error(res.error || "Güncellenemedi");
        }
      } catch {
        toast.error("İşlem hatası oluştu");
      }
    });
  };

  // Create user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || formData.password.length < 6) {
      toast.error("Lütfen tüm alanları eksiksiz doldurun (Şifre min. 6 karakter)");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createUser(formData);
        if (res.success) {
          toast.success(`"${formData.name}" kullanıcısı başarıyla oluşturuldu`);
          setUsers((prev) => [
            {
              id: "usr_" + Date.now(),
              name: formData.name,
              email: formData.email,
              role: formData.role,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
          setIsModalOpen(false);
          setFormData({ name: "", email: "", password: "", role: "EDITOR" });
        } else {
          toast.error(res.error || "Kullanıcı oluşturulamadı");
        }
      } catch {
        toast.error("İşlem sırasında bir hata oluştu");
      }
    });
  };

  // Change user role
  const handleRoleChange = (id: string, newRole: "ADMIN" | "EDITOR") => {
    startTransition(async () => {
      try {
        const res = await updateUserRole(id, newRole);
        if (res.success) {
          toast.success(`Kullanıcı rolü "${newRole}" yapıldı`);
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
          );
        } else {
          toast.error("Rol güncellenemedi");
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Delete user
  const handleDeleteUser = (id: string, name: string) => {
    if (!confirm(`"${name}" adlı kullanıcıyı silmek istediğinize emin misiniz?`)) return;

    startTransition(async () => {
      try {
        const res = await deleteUser(id);
        if (res.success) {
          toast.success("Kullanıcı hesabı silindi");
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } else {
          toast.error("Silinemedi");
        }
      } catch {
        toast.error("Hata oluştu");
      }
    });
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()));

    const matchesModule =
      moduleFilter === "ALL" ? true : log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const uniqueModules = Array.from(new Set(logs.map((l) => l.module)));

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs & Quick Action */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "users"
                ? "bg-gold text-bg-primary shadow-xs"
                : "bg-bg-secondary text-text-muted hover:text-text-primary"
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Kullanıcılar & Roller ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "logs"
                ? "bg-gold text-bg-primary shadow-xs"
                : "bg-bg-secondary text-text-muted hover:text-text-primary"
            }`}
          >
            <History className="w-4 h-4" />
            <span>İşlem Geçmişi & Audit ({logs.length})</span>
          </button>
        </div>

        {/* New User Button */}
        {activeTab === "users" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-gold text-bg-primary font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <UserPlus className="w-4 h-4" />
            Yeni Kullanıcı Ekle
          </button>
        )}
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-secondary/70 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Kullanıcı Bilgisi</th>
                    <th className="py-3 px-4">E-Posta</th>
                    <th className="py-3 px-4">Erişim Rolü</th>
                    <th className="py-3 px-4">Kayıt Tarihi</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((usr) => {
                    const isAdmin = usr.role === "ADMIN";

                    return (
                      <tr
                        key={usr.id}
                        className="hover:bg-bg-secondary/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-bold text-xs uppercase">
                              {usr.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-cream text-sm block">
                                {usr.name}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono">
                                ID: {usr.id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-text-secondary">
                          {usr.email}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={usr.role}
                            disabled={isPending}
                            onChange={(e) =>
                              handleRoleChange(
                                usr.id,
                                e.target.value as "ADMIN" | "EDITOR"
                              )
                            }
                            className={`text-xs font-semibold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-hidden ${
                              isAdmin
                                ? "bg-gold/20 text-gold border-gold/40"
                                : "bg-bg-secondary text-text-secondary border-border"
                            }`}
                          >
                            <option value="ADMIN" className="bg-bg-primary text-cream">
                              Yönetici (ADMIN)
                            </option>
                            <option value="EDITOR" className="bg-bg-primary text-cream">
                              Editör (EDITOR)
                            </option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-text-muted text-[11px]">
                          {usr.createdAt
                            ? new Date(usr.createdAt).toLocaleDateString("tr-TR")
                            : "Aktif"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingUser(usr);
                                setEditFormData({
                                  name: usr.name,
                                  email: usr.email,
                                  password: "",
                                  role: usr.role,
                                });
                              }}
                              disabled={isPending}
                              className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                              title="Kullanıcı Bilgilerini Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id, usr.name)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="İşlem veya kullanıcı ara..."
                className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-xl text-xs text-cream placeholder-text-muted focus:outline-hidden focus:border-gold"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-text-muted flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Modül:
              </span>
              <button
                onClick={() => setModuleFilter("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  moduleFilter === "ALL"
                    ? "bg-gold text-bg-primary font-semibold"
                    : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
              >
                Tümü
              </button>
              {uniqueModules.map((m) => (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    moduleFilter === m
                      ? "bg-gold text-bg-primary font-semibold"
                      : "bg-bg-secondary text-text-muted hover:text-text-primary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Timeline Table */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-secondary/70 border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tarih / Saat</th>
                    <th className="py-3 px-4">İşlemi Yapan</th>
                    <th className="py-3 px-4">Modül</th>
                    <th className="py-3 px-4">Yapılan Değişiklik / Eylem</th>
                    <th className="py-3 px-4">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const dateObj = new Date(log.timestamp);
                    const formattedDate = dateObj.toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-bg-secondary/40 transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-text-secondary font-mono font-medium block">
                            {formattedDate}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold" />
                            {formattedTime}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-cream block">
                            {log.user}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            {log.email}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                            {log.module}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-cream font-medium">
                          {log.action}
                        </td>

                        <td className="py-3 px-4 text-text-muted text-[11px] max-w-xs truncate">
                          {log.details || "-"}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-muted">
                        Kriterlere uygun kayıtlı işlem geçmişi bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-heading text-cream">Yeni Kullanıcı Ekle</h3>
                <p className="text-xs text-text-muted">
                  Yönetici veya editör yetkisi ile yeni personel hesabı tanımlayın
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Örn: Ayşe Demir"
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ayse@elmiradavet.com"
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Şifre (Min. 6 Karakter) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Yetki Rolü
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "ADMIN" | "EDITOR",
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                >
                  <option value="EDITOR">Editör (İçerik, Talepler ve Takvim Yönetimi)</option>
                  <option value="ADMIN">Yönetici (Tam Yetki + Kullanıcı Tanımlama)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  {isPending ? "Oluşturuluyor..." : "Kullanıcıyı Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-gold font-heading font-medium text-base">
                <Pencil className="w-4 h-4" />
                <span>Kullanıcı Bilgilerini Düzenle</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-text-muted hover:text-cream text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center justify-between">
                  <span>Yeni Şifre Belirle</span>
                  <span className="text-[10px] text-text-muted font-normal">(Boş bırakılırsa mevcut şifre değişmez)</span>
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, password: e.target.value })
                  }
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Yetki Rolü
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      role: e.target.value as "ADMIN" | "EDITOR",
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-bg-secondary border border-border rounded-xl text-cream focus:outline-hidden focus:border-gold"
                >
                  <option value="EDITOR">Editör (İçerik, Talepler ve Takvim Yönetimi)</option>
                  <option value="ADMIN">Yönetici (Tam Yetki + Kullanıcı Tanımlama)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold bg-gradient-gold text-bg-primary rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
