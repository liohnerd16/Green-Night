import { useState } from "react";
import { Lock, LogOut, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-570355f0`;

export function getAdminToken(): string | null {
  return sessionStorage.getItem("adminToken");
}

export function AdminLogin({ isAdmin, onLoginSuccess, onLogout }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [changeOpen, setChangeOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      toast.error(t(tr.admin.enterPassword));
      return;
    }
    setLoginLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.token) {
        sessionStorage.setItem("adminToken", data.token);
        onLoginSuccess();
        setPassword("");
        setOpen(false);
        toast.success(t(tr.admin.loginSuccess));
      } else if (response.status === 403) {
        // Admin not set up — attempt setup
        const setupResponse = await fetch(`${API_URL}/admin/setup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ password }),
        });
        const setupData = await setupResponse.json();
        if (setupResponse.ok && setupData.success && setupData.token) {
          sessionStorage.setItem("adminToken", setupData.token);
          onLoginSuccess();
          setPassword("");
          setOpen(false);
          toast.success(t(tr.admin.loginSuccess));
        } else {
          toast.error(setupData.error || t(tr.admin.loginFailed));
          setPassword("");
        }
      } else {
        toast.error(data.error || t(tr.admin.loginFailed));
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t(tr.admin.serverError));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw.trim()) { toast.error(t(tr.admin.enterCurrentPassword)); return; }
    if (!newPw.trim()) { toast.error(t(tr.admin.enterNewPassword)); return; }
    if (newPw.length < 8) { toast.error(t(tr.admin.passwordMinLength)); return; }
    if (newPw !== confirmPw) { toast.error(t(tr.admin.passwordMismatch)); return; }
    if (currentPw === newPw) { toast.error(t(tr.admin.passwordSame)); return; }

    setChangeLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/admin/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Admin-Token": token || "",
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(t(tr.admin.passwordChanged));
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setChangeOpen(false);
      } else {
        toast.error(data.error || t(tr.admin.serverError));
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(t(tr.admin.serverError));
    } finally {
      setChangeLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleLogin(); };
  const handleChangePwKeyPress = (e) => { if (e.key === "Enter") handleChangePassword(); };

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <Dialog open={changeOpen} onOpenChange={(open) => {
          setChangeOpen(open);
          if (!open) { setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowCurrentPw(false); setShowNewPw(false); }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <KeyRound className="h-4 w-4" />
              {t(tr.admin.changePassword)}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                {t(tr.admin.changePasswordTitle)}
              </DialogTitle>
              <DialogDescription>{t(tr.admin.changePasswordDesc)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">{t(tr.admin.currentPassword)}</Label>
                <div className="relative">
                  <Input id="current-pw" type={showCurrentPw ? "text" : "password"} placeholder={t(tr.admin.currentPasswordPlaceholder)} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} onKeyDown={handleChangePwKeyPress} autoFocus className="pr-10" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">{t(tr.admin.newPassword)}</Label>
                <div className="relative">
                  <Input id="new-pw" type={showNewPw ? "text" : "password"} placeholder={t(tr.admin.newPasswordPlaceholder)} value={newPw} onChange={(e) => setNewPw(e.target.value)} onKeyDown={handleChangePwKeyPress} className="pr-10" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPw && newPw.length < 8 && <p className="text-xs text-red-500">{t(tr.admin.passwordMinLength)}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">{t(tr.admin.confirmPassword)}</Label>
                <Input id="confirm-pw" type="password" placeholder={t(tr.admin.confirmPasswordPlaceholder)} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} onKeyDown={handleChangePwKeyPress} />
                {confirmPw && confirmPw !== newPw && <p className="text-xs text-red-500">{t(tr.admin.passwordMismatch)}</p>}
              </div>
              <Button onClick={handleChangePassword} className="w-full" disabled={changeLoading || !currentPw || !newPw || newPw.length < 8 || newPw !== confirmPw}>
                {changeLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    {t(tr.common.processing)}
                  </span>
                ) : t(tr.admin.changePassword)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          {t(tr.admin.logout)}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { setOpen(open); if (!open) { setPassword(""); setShowPassword(false); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lock className="h-4 w-4" />
          {t(tr.admin.login)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(tr.admin.loginTitle)}</DialogTitle>
          <DialogDescription>{t(tr.admin.loginDesc)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t(tr.admin.password)}</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder={t(tr.admin.passwordPlaceholder)} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyPress} autoFocus className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full" disabled={loginLoading || !password.trim()}>
            {loginLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {t(tr.admin.authenticating)}
              </span>
            ) : t(tr.admin.loginButton)}
          </Button>
          <p className="text-xs text-gray-500 text-center">{t(tr.admin.loginOnly)}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
