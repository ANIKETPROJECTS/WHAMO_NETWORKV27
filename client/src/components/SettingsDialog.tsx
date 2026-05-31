import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useProjects, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Lock,
  Save,
  FolderOpen,
  Trash2,
  Pencil,
  Check,
  X,
  Clock,
} from "lucide-react";
import { getAuthHeader } from "@/lib/queryClient";

const AUTOSAVE_KEY = "whamo_autosave_settings";

export interface AutosaveSettings {
  enabled: boolean;
  intervalSec: number;
}

export function getAutosaveSettings(): AutosaveSettings {
  try {
    const s = localStorage.getItem(AUTOSAVE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { enabled: false, intervalSec: 60 };
}

function saveAutosaveSettingsToStorage(settings: AutosaveSettings) {
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(settings));
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onLoadProject?: (project: any) => void;
  currentProjectId?: number | null;
}

export function SettingsDialog({
  open,
  onClose,
  onLoadProject,
  currentProjectId,
}: SettingsDialogProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Profile tab
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Autosave tab
  const [autosave, setAutosave] = useState<AutosaveSettings>(getAutosaveSettings);

  // Projects tab
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  // Sync autosave state when dialog opens
  useEffect(() => {
    if (open) setAutosave(getAutosaveSettings());
  }, [open]);

  const handleProfileSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast({ variant: "destructive", title: "Error", description: "All fields are required" });
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ fullName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      updateUser(data.user, data.token);
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "All fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords don't match" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 8 characters" });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password Changed", description: "Your password has been updated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Change Failed", description: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAutosaveChange = (newSettings: AutosaveSettings) => {
    setAutosave(newSettings);
    saveAutosaveSettingsToStorage(newSettings);
    window.dispatchEvent(
      new CustomEvent("autosave-settings-changed", { detail: newSettings })
    );
  };

  const handleRenameStart = (project: any) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
    setConfirmDeleteId(null);
  };

  const handleRenameConfirm = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await updateProject.mutateAsync({ id, name: editingName.trim() });
      setEditingProjectId(null);
      toast({ title: "Renamed", description: "Project name updated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Rename Failed", description: err.message });
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    try {
      await deleteProject.mutateAsync(id);
      setConfirmDeleteId(null);
      toast({ title: "Deleted", description: "Project has been deleted." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: err.message });
    }
  };

  const poppins = { fontFamily: "Poppins, sans-serif" };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: 700, height: 580 }}
      >
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <DialogTitle className="text-[15px] font-bold text-slate-900" style={poppins}>
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex flex-1 overflow-hidden" style={{ height: "calc(100% - 57px)" }}>
          {/* Sidebar nav */}
          <TabsList className="flex flex-col h-full w-44 rounded-none bg-slate-50 border-r border-slate-200 justify-start items-stretch p-2 gap-0.5 flex-shrink-0">
            <TabsTrigger
              value="profile"
              className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
              style={poppins}
            >
              <User className="w-4 h-4 flex-shrink-0" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
              style={poppins}
            >
              <Lock className="w-4 h-4 flex-shrink-0" /> Password
            </TabsTrigger>
            <TabsTrigger
              value="autosave"
              className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
              style={poppins}
            >
              <Save className="w-4 h-4 flex-shrink-0" /> Autosave
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
              style={poppins}
            >
              <FolderOpen className="w-4 h-4 flex-shrink-0" /> Projects
            </TabsTrigger>
          </TabsList>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">

            {/* ─── PROFILE ─── */}
            <TabsContent value="profile" className="m-0 p-6">
              <p className="text-[13px] font-bold text-slate-800 mb-5" style={poppins}>
                Edit Profile
              </p>
              <div className="space-y-4 max-w-sm">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block" style={poppins}>
                    Full Name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="h-9 text-sm"
                    data-testid="input-settings-fullname"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block" style={poppins}>
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-9 text-sm"
                    data-testid="input-settings-email"
                  />
                </div>
                <Button
                  onClick={handleProfileSave}
                  disabled={profileLoading}
                  className="w-full h-9 text-sm rounded-lg"
                  style={poppins}
                  data-testid="btn-settings-save-profile"
                >
                  {profileLoading ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </TabsContent>

            {/* ─── PASSWORD ─── */}
            <TabsContent value="security" className="m-0 p-6">
              <p className="text-[13px] font-bold text-slate-800 mb-5" style={poppins}>
                Change Password
              </p>
              <div className="space-y-4 max-w-sm">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block" style={poppins}>
                    Current Password
                  </Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-sm"
                    data-testid="input-settings-current-password"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block" style={poppins}>
                    New Password
                  </Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-sm"
                    data-testid="input-settings-new-password"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block" style={poppins}>
                    Confirm New Password
                  </Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-sm"
                    data-testid="input-settings-confirm-password"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-pw"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  <label htmlFor="show-pw" className="text-xs text-slate-500 cursor-pointer" style={poppins}>
                    Show passwords
                  </label>
                </div>
                <Button
                  onClick={handlePasswordSave}
                  disabled={passwordLoading}
                  className="w-full h-9 text-sm rounded-lg"
                  style={poppins}
                  data-testid="btn-settings-change-password"
                >
                  {passwordLoading ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </TabsContent>

            {/* ─── AUTOSAVE ─── */}
            <TabsContent value="autosave" className="m-0 p-6">
              <p className="text-[13px] font-bold text-slate-800 mb-1" style={poppins}>
                Autosave
              </p>
              <p className="text-xs text-slate-500 mb-5" style={poppins}>
                Automatically save your project to the cloud at regular intervals.
              </p>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5 max-w-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-800" style={poppins}>
                    Enable Autosave
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5" style={poppins}>
                    Save your project silently in the background
                  </p>
                </div>
                <Switch
                  checked={autosave.enabled}
                  onCheckedChange={(checked) =>
                    handleAutosaveChange({ ...autosave, enabled: checked })
                  }
                  data-testid="switch-autosave"
                />
              </div>

              {autosave.enabled && (
                <div className="max-w-sm">
                  <Label className="text-xs font-semibold text-slate-600 mb-2 block" style={poppins}>
                    Save Interval
                  </Label>
                  <Select
                    value={String(autosave.intervalSec)}
                    onValueChange={(v) =>
                      handleAutosaveChange({ ...autosave, intervalSec: Number(v) })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm" data-testid="select-autosave-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 seconds</SelectItem>
                      <SelectItem value="60">Every 1 minute</SelectItem>
                      <SelectItem value="120">Every 2 minutes</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                      <SelectItem value="600">Every 10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400 mt-3" style={poppins}>
                    Autosave only runs when a project is open and has been saved at least once.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ─── PROJECTS ─── */}
            <TabsContent value="projects" className="m-0 p-6">
              <p className="text-[13px] font-bold text-slate-800 mb-4" style={poppins}>
                My Projects
              </p>

              {projectsLoading && (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}

              {!projectsLoading && (!Array.isArray(projects) || projects.length === 0) && (
                <div className="flex flex-col items-center py-12 text-slate-400 gap-3">
                  <FolderOpen className="w-10 h-10 text-slate-300" />
                  <p className="text-sm" style={poppins}>No saved projects yet</p>
                </div>
              )}

              {!projectsLoading && Array.isArray(projects) && projects.length > 0 && (
                <div className="space-y-2">
                  {(projects as any[]).map((project) => (
                    <div
                      key={project.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        project.id === currentProjectId
                          ? "border-blue-300 bg-blue-50/60"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                      data-testid={`settings-project-card-${project.id}`}
                    >
                      <FolderOpen
                        className={`w-4 h-4 flex-shrink-0 ${
                          project.id === currentProjectId ? "text-blue-600" : "text-slate-400"
                        }`}
                      />

                      {/* Name / inline edit */}
                      {editingProjectId === project.id ? (
                        <div className="flex-1 flex items-center gap-1.5">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameConfirm(project.id);
                              if (e.key === "Escape") setEditingProjectId(null);
                            }}
                            className="h-7 text-sm flex-1 py-0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameConfirm(project.id)}
                            className="p-1 text-green-600 hover:text-green-700 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingProjectId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[13px] font-semibold text-slate-700 truncate"
                              style={poppins}
                            >
                              {project.name}
                            </span>
                            {project.id === currentProjectId && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-600 text-white rounded-full flex-shrink-0">
                                OPEN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] text-slate-400" style={poppins}>
                              {formatDate(project.updatedAt || project.createdAt)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action buttons — hidden during inline rename */}
                      {editingProjectId !== project.id && (
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {confirmDeleteId === project.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-red-600 font-medium" style={poppins}>
                                Delete?
                              </span>
                              <button
                                onClick={() => handleDeleteConfirm(project.id)}
                                disabled={deleteProject.isPending}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                                style={poppins}
                              >
                                {deleteProject.isPending ? "…" : "Yes"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                style={poppins}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              {onLoadProject && (
                                <button
                                  onClick={() => {
                                    onLoadProject(project);
                                    onClose();
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                  style={poppins}
                                  data-testid={`settings-btn-open-${project.id}`}
                                >
                                  Open
                                </button>
                              )}
                              <button
                                onClick={() => handleRenameStart(project)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Rename"
                                data-testid={`settings-btn-rename-${project.id}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(project.id);
                                  setEditingProjectId(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                                data-testid={`settings-btn-delete-${project.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
