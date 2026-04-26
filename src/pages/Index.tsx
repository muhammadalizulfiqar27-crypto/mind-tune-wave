import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Heart, Headphones, LogIn, LogOut, Menu, X } from "lucide-react";
import { frequencies, categoryLabels, type FrequencyCategory } from "@/lib/frequencies";
import FrequencyCard from "@/components/FrequencyCard";
import FloatingOrbs from "@/components/FloatingOrbs";
import { useAuth } from "@/contexts/AuthContext";
import { updateDailyStreak } from "@/lib/streak";

const FAVORITES_KEY = "mind_control_favourites";
const LAST_LISTENED_KEY = "mind_control_last_listened";

const categoryOrder: FrequencyCategory[] = [
  "stop_overthinking",
  "study_fast",
  "stress_relief",
  "control_emotions",
];

const categoryIcons: Record<FrequencyCategory, string> = {
  stop_overthinking: "🧠",
  study_fast: "📚",
  stress_relief: "🧘",
  control_emotions: "💎",
};

const Index = () => {
  const navigate = useNavigate();
  const { user, hasUsedFreeTrial, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [streakDays] = useState(() => updateDailyStreak());
  const [favoriteHz, setFavoriteHz] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [lastListenedHz] = useState<number | null>(() => {
    const saved = localStorage.getItem(LAST_LISTENED_KEY);
    return saved ? Number(saved) : null;
  });

  const favoriteFrequencies = frequencies.filter((freq) => favoriteHz.includes(freq.hz));
  const lastListened = frequencies.find((freq) => freq.hz === lastListenedHz);

  const handleCardTap = useCallback(
    (hz: number) => {
      if (!user && hasUsedFreeTrial) {
        navigate("/auth");
        return;
      }
      navigate(`/player/${hz}`);
    },
    [user, hasUsedFreeTrial, navigate]
  );

  const toggleFavorite = useCallback((hz: number) => {
    setFavoriteHz((current) => {
      const next = current.includes(hz)
        ? current.filter((item) => item !== hz)
        : [...current, hz];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingOrbs />

      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/80 text-muted-foreground transition-colors hover:text-primary"
              aria-label="Open favourites menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={20} />}
            </button>
            <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Mind Control
              <span className="text-primary"> — Sound Therapy</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Healing frequencies for mind & body
            </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed left-4 top-20 z-30 w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Heart size={16} className="text-primary" />
            Favourites
          </div>
          {favoriteFrequencies.length > 0 ? (
            <div className="space-y-2">
              {favoriteFrequencies.map((freq) => (
                <button
                  key={freq.hz}
                  type="button"
                  onClick={() => handleCardTap(freq.hz)}
                  className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-left transition-colors hover:bg-primary/10"
                >
                  <span className="text-sm font-medium text-foreground">{freq.hz} Hz</span>
                  <span className="max-w-40 truncate text-xs text-muted-foreground">{freq.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Your favourite frequencies will appear here.</p>
          )}
        </div>
      )}

      <div className="container max-w-6xl mx-auto px-4 pt-4 text-center">
        <p className="text-sm font-medium text-foreground">
          Sync your frequency daily for peak mental clarity
        </p>
      </div>

      <div className="container max-w-6xl mx-auto px-4 pt-3">
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Daily streak</p>
              <p className="text-xs text-muted-foreground">You have used the app for {streakDays} {streakDays === 1 ? "day" : "days"}</p>
            </div>
          </div>
          <span className="rounded-lg bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            {streakDays}🔥
          </span>
        </div>
      </div>

      {/* Headphones tip */}
      <div className="container max-w-6xl mx-auto px-4 pt-3">
        <div className="rounded-lg bg-muted/50 border border-border px-4 py-2.5 text-center flex items-center justify-center gap-2">
          <Headphones size={16} className="text-primary" />
          <p className="text-xs text-muted-foreground">
            Use headphones 🎧 for better results
          </p>
        </div>
      </div>

      {/* Free trial banner */}
      {!user && !hasUsedFreeTrial && (
        <div className="container max-w-6xl mx-auto px-4 pt-3">
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2.5 text-center">
            <p className="text-xs text-primary">
              🎵 Try one frequency for free — create an account to unlock all 20!
            </p>
          </div>
        </div>
      )}

      {/* Frequency grid */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {lastListened && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Continue listening
            </h2>
            <FrequencyCard
              freq={lastListened}
              isPlaying={false}
              onToggle={() => handleCardTap(lastListened.hz)}
              isFavorite={favoriteHz.includes(lastListened.hz)}
              onFavoriteToggle={() => toggleFavorite(lastListened.hz)}
            />
          </section>
        )}

        {categoryOrder.map((cat) => {
          const catFreqs = frequencies.filter((f) => f.category === cat);
          return (
            <section key={cat} className="mb-10">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-medium flex items-center gap-2">
                <span>{categoryIcons[cat]}</span>
                {categoryLabels[cat]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catFreqs.map((freq) => (
                  <FrequencyCard
                    key={freq.hz}
                    freq={freq}
                    isPlaying={false}
                    onToggle={() => handleCardTap(freq.hz)}
                    isFavorite={favoriteHz.includes(freq.hz)}
                    onFavoriteToggle={() => toggleFavorite(freq.hz)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default Index;
