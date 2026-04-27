import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Repeat, Volume2, VolumeX } from "lucide-react";
import { frequencies } from "@/lib/frequencies";
import { playFrequency, stopFrequency, setVolume } from "@/lib/audioEngine";
import PlayerCanvas from "@/components/PlayerCanvas";

const DURATION = 90; // seconds
const LAST_LISTENED_KEY = "mind_control_last_listened";

const PlayerPage = () => {
  const { hz } = useParams<{ hz: string }>();
  const navigate = useNavigate();

  const freq = frequencies.find((f) => f.hz === parseFloat(hz || "0"));
  const currentIndex = freq ? frequencies.findIndex((f) => f.hz === freq.hz) : -1;
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [remaining, setRemaining] = useState(DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pausePlayback = useCallback(() => {
    stopFrequency();
    playingRef.current = false;
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const startPlayback = useCallback(() => {
    if (!freq) return;
    clearTimer();
    playFrequency(freq.hz, volume);
    playingRef.current = true;
    setIsPlaying(true);

    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stopFrequency();
          playingRef.current = false;
          setIsPlaying(false);
          clearTimer();
          return DURATION;
        }
        return r - 1;
      });
    }, 1000);
  }, [clearTimer, freq, volume]);

  const handlePlay = useCallback(() => {
    if (playingRef.current) {
      pausePlayback();
      return;
    }
    startPlayback();
  }, [pausePlayback, startPlayback]);

  const goToFrequency = useCallback((direction: "next" | "previous") => {
    if (currentIndex < 0) return;
    pausePlayback();
    setRemaining(DURATION);
    const nextIndex = direction === "next"
      ? (currentIndex + 1) % frequencies.length
      : (currentIndex - 1 + frequencies.length) % frequencies.length;
    navigate(`/player/${frequencies[nextIndex].hz}`);
  }, [currentIndex, navigate, pausePlayback]);

  useEffect(() => {
    if (!freq) return;
    localStorage.setItem(LAST_LISTENED_KEY, String(freq.hz));
  }, [freq]);

  // Media Session API for notification controls
  useEffect(() => {
    if (!("mediaSession" in navigator) || !freq) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${freq.hz} Hz — ${freq.name}`,
      artist: "Mind Control — Sound Therapy",
      album: freq.description,
    });

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", startPlayback);
    navigator.mediaSession.setActionHandler("pause", pausePlayback);
    navigator.mediaSession.setActionHandler("nexttrack", () => goToFrequency("next"));
    navigator.mediaSession.setActionHandler("previoustrack", () => goToFrequency("previous"));

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [freq, goToFrequency, isPlaying, pausePlayback, startPlayback]);

  // Handle repeat: when remaining resets to DURATION and repeat is on, auto-play
  useEffect(() => {
    if (remaining === DURATION && repeat && !isPlaying && freq) {
      // Small delay to let state settle
      const t = setTimeout(() => handlePlay(), 300);
      return () => clearTimeout(t);
    }
  }, [remaining, repeat, isPlaying, freq, handlePlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFrequency();
      clearTimer();
    };
  }, [clearTimer]);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!freq) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Frequency not found</p>
      </div>
    );
  }

  const progress = ((DURATION - remaining) / DURATION) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <PlayerCanvas freq={freq} isPlaying={isPlaying} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-4">
        <button
          onClick={() => { stopFrequency(); navigate("/"); }}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {volume === 0 ? <VolumeX size={16} className="text-muted-foreground" /> : <Volume2 size={16} className="text-primary" />}
          <input
            type="range" min="0" max="0.6" step="0.01" value={volume}
            onChange={handleVolume}
            className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-2">
          <span className="text-6xl font-bold text-foreground tracking-tight">{freq.hz}</span>
          <span className="text-2xl text-muted-foreground ml-1">Hz</span>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-1">{freq.name}</h2>
        <p className="text-sm text-muted-foreground mb-6">{freq.description}</p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mb-2">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        <p className="text-lg font-mono text-foreground/60 mb-8">{formatTime(remaining)} / {formatTime(DURATION)}</p>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setRepeat(!repeat)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              repeat ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat size={20} />
          </button>

          <button
            onClick={handlePlay}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: isPlaying ? `0 0 40px ${freq.gradientFrom}60` : undefined }}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <button
            onClick={() => { setRemaining(DURATION); }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Description panel */}
      <div className="relative z-10 px-6 pb-8 pt-4">
        <div className="rounded-xl bg-card/80 backdrop-blur border border-border p-4 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground mb-2">About this Frequency</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{freq.longDescription}</p>
          <div className="flex flex-wrap gap-1.5">
            {freq.benefits.map((b) => (
              <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
