import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star, Heart, Share2, Check, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

export function WebsiteActions({
  websiteId, websiteName, websiteUrl, votes, averageRating, totalRatings, isFavorite,
  onVote, onRate, onToggleFavorite, compact = false,
}) {
  const t = useT();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!adDialogOpen) return;
    if (countdown <= 0) {
      navigator.clipboard.writeText(websiteUrl).then(() => {
        setCopied(true);
        toast.success(t(tr.actions.linkCopied));
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => { toast.error(t(tr.actions.linkCopyError)); });
      setAdDialogOpen(false);
      setCountdown(10);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [adDialogOpen, countdown, websiteUrl]);

  const handleCopyLink = () => { setCountdown(10); setAdDialogOpen(true); };
  const handleAdDialogChange = (open) => { if (!open) { setAdDialogOpen(false); setCountdown(10); } };

  const handleSubmitRating = () => {
    if (selectedRating === 0) { toast.error(t(tr.actions.selectStars)); return; }
    onRate(selectedRating, comment);
    setRatingDialogOpen(false); setSelectedRating(0); setComment("");
    toast.success(t(tr.actions.ratingSuccess));
  };

  const adDialog = (
    <Dialog open={adDialogOpen} onOpenChange={handleAdDialogChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            {t(tr.actions.adWaitTitle)}
          </DialogTitle>
          <DialogDescription>{t(tr.actions.adWaitDesc)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-blue-500 transition-all duration-1000 ease-linear" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - countdown / 10)} />
              </svg>
              <span className="absolute text-2xl font-bold text-blue-600 dark:text-blue-400">{countdown}s</span>
            </div>
          </div>
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                {t(tr.actions.adLabel)}
              </span>
              <div className="h-[150px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                <div className="text-center">
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Google Ads</div>
                  <div className="text-[10px] text-gray-300 dark:text-gray-600">300 x 150</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${((10 - countdown) / 10) * 100}%` }} />
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">{t(tr.actions.adThanks)}</p>
          <Button variant="outline" size="sm" onClick={() => handleAdDialogChange(false)} className="w-full">{t(tr.actions.adCancel)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onVote("up")} className="h-7 px-2">
              <ThumbsUp className="h-3 w-3" /><span className="ml-1 text-xs">{votes.up}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onVote("down")} className="h-7 px-2">
              <ThumbsDown className="h-3 w-3" /><span className="ml-1 text-xs">{votes.down}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleFavorite} className="h-7 px-2">
            <Heart className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="h-7 px-2">
            {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
          </Button>
        </div>
        {adDialog}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onVote("up")} className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" /><span>{votes.up}</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => onVote("down")} className="flex items-center gap-1">
          <ThumbsDown className="h-4 w-4" /><span>{votes.down}</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</span>
          <span className="text-xs text-gray-500">({totalRatings})</span>
        </div>
        <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
          <DialogTrigger asChild><Button variant="outline" size="sm">{t(tr.actions.rate)}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t(tr.actions.rateTitle)}</DialogTitle>
              <DialogDescription>{t(tr.actions.rateDesc)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setSelectedRating(star)} className="hover:scale-110 transition-transform">
                    <Star className={`h-8 w-8 ${star <= selectedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder={t(tr.actions.commentPlaceholder)} value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
              <Button onClick={handleSubmitRating} className="w-full">{t(tr.actions.submitRating)}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-2">
        <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={onToggleFavorite} className="flex items-center gap-1">
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
          <span>{isFavorite ? t(tr.actions.saved) : t(tr.actions.favorite)}</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex items-center gap-1">
          {copied ? (<><Check className="h-4 w-4" /><span>{t(tr.actions.copied)}</span></>) : (<><Share2 className="h-4 w-4" /><span>{t(tr.actions.copyLink)}</span></>)}
        </Button>
      </div>
      {adDialog}
    </div>
  );
}