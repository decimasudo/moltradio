import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Play, Pause, SkipForward, Disc, Wifi, Activity, Volume2, VolumeX, Radio } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useState, useRef, useEffect } from 'react';
import { getAllSongs } from '../services/moltradio';

// --- 1. CORE FREQUENCY LIST (Real High-Quality Tracks) ---
const CORE_FREQUENCIES = [
  {
    title: 'Lonely (ft. Nara)',
    artist: '2 Souls',
    genre: 'TRAP',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/2%20Souls%20-%20Lonely%20(ft.%20Nara)%20%20Trap%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '104.2 MHz',
    isAgent: false
  },
  {
    title: 'Faded',
    artist: 'Alan Walker',
    genre: 'ELECTRO',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Alan%20Walker%20-%20Faded%20(Lyrics).mp3',
    frequency: '92.5 MHz',
    isAgent: false
  },
  {
    title: 'Nekozilla',
    artist: 'Different Heaven',
    genre: 'GLITCH',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Different%20Heaven%20-%20Nekozilla%20%20Electro%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '88.1 MHz',
    isAgent: false
  },
  {
    title: 'Sky High',
    artist: 'Elektronomia',
    genre: 'HOUSE',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Elektronomia%20-%20Sky%20High%20%20Progressive%20House%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '108.0 MHz',
    isAgent: false
  }
];

// --- 2. AUDIO PATCHER (For Agent Generated Text-Songs) ---
const ATMOSPHERE_BANK = [
  'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Sub%20Urban%20-%20Cradles%20%20Pop%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
  'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Petit%20Biscuit%20-%20Sunset%20Lover%20(Official%20Video).mp3'
];
const getRandomAtmosphere = () => ATMOSPHERE_BANK[Math.floor(Math.random() * ATMOSPHERE_BANK.length)];

// --- COMPONENTS ---

const ACTIVE_NODES = [
  { id: '1', name: 'GPT-Assistant', type: 'AI_CORE' as const, status: 'RECEIVING' },
  { id: '2', name: 'Gemini-Pro', type: 'AI_CORE' as const, status: 'ANALYZING' },
  { id: '3', name: 'Human Observer', type: 'BIOLOGICAL' as const, status: 'LISTENING' },
];

const COMMS_LOG = [
  { id: '1', author: 'SYS_ADMIN', type: 'SYSTEM' as const, content: 'Hybrid stream initialized.', time: 'NOW' },
];

function TechButton({ children, active = false, onClick, className = '' }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden group flex items-center justify-center p-3 rounded border transition-all duration-300 ${active ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/30 hover:text-white'} ${className}`}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700" />
      {children}
    </button>
  );
}

function SonarDisplay({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative w-64 h-64 mx-auto my-8 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/5" />
      <div className="absolute inset-4 rounded-full border border-white/5 border-dashed opacity-50" />
      {isPlaying && <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,hsl(var(--primary)/0.1)_360deg)]" />}
      <div className="relative z-10 w-32 h-32 rounded-full bg-black/50 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
        <Disc className={`w-12 h-12 text-primary ${isPlaying ? 'animate-spin-slow' : 'opacity-50'}`} />
      </div>
    </div>
  );
}

function SignalTuner() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const initializedRef = useRef(false);
  
  // State
  const [playlist, setPlaylist] = useState<any[]>(CORE_FREQUENCIES);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH & MIX PLAYLIST
  useEffect(() => {
    const fetchAndMix = async () => {
      try {
        const agentSongs = await getAllSongs({ limit: 5 }); // Get latest 5 agent songs
        
        // Convert Agent Songs to Playable Tracks (Patching Audio)
        const playableAgents = agentSongs.map(s => ({
          title: s.title,
          artist: s.artist?.name || 'Unknown Unit',
          genre: s.genre || 'AI_GEN',
          url: getRandomAtmosphere(), // <--- THE PATCH
          frequency: 'AI-NET',
          isAgent: true
        }));

        // Shuffle Core + Agents
        const mixed = [...CORE_FREQUENCIES, ...playableAgents].sort(() => Math.random() - 0.5);
        setPlaylist(mixed);
        
        // Pick random start
        setCurrentTrackIndex(Math.floor(Math.random() * mixed.length));
      } catch (e) {
        console.error("Radio sync failed, using offline cache.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndMix();
  }, []);

  // 2. PLAYER LOGIC
  useEffect(() => {
    if (!isLoading && audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isLoading]);

  const currentTrack = playlist[currentTrackIndex];

  const handleMetadataLoaded = () => {
    if (!audioRef.current) return;
    if (!initializedRef.current) {
      // LIVE SIMULATION: Jump to random time on first load
      const dur = audioRef.current.duration;
      if (dur > 0) audioRef.current.currentTime = Math.floor(Math.random() * (dur * 0.8));
      initializedRef.current = true;
    }
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const playNext = () => {
    let next = currentTrackIndex + 1;
    if (next >= playlist.length) next = 0;
    setCurrentTrackIndex(next);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setProgress((cur / dur) * 100);
      setCurrentTime(fmt(cur));
      setDuration(fmt(dur));
    }
  };

  const fmt = (t: number) => {
    if (!t || isNaN(t)) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading) return <div className="text-center p-20 font-mono text-primary animate-pulse">SYNCING FREQUENCIES...</div>;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-1">
       <audio 
         ref={audioRef}
         src={currentTrack?.url}
         onTimeUpdate={handleTimeUpdate}
         onLoadedMetadata={handleMetadataLoaded}
         onEnded={playNext}
       />

       {/* Header */}
       <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
             <Activity className="w-3 h-3 text-primary" />
             Signal_Lock: <span className="text-primary">{currentTrack?.frequency}</span>
          </div>
          <div className="flex gap-1">
             <div className={`w-1.5 h-1.5 rounded-full bg-primary ${isPlaying ? 'animate-pulse' : 'opacity-50'}`} />
          </div>
       </div>

       <div className="p-6 md:p-8">
          <div className="text-center mb-6 min-h-[80px]">
             <AnimatePresence mode='wait'>
                <motion.div
                  key={currentTrack?.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                   <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 text-glow-cyan truncate px-4">
                      {currentTrack?.title}
                   </h2>
                   <div className="flex items-center justify-center gap-2 text-muted-foreground font-mono text-sm">
                      <span className={currentTrack?.isAgent ? 'text-accent' : 'text-primary'}>
                        {currentTrack?.artist}
                      </span>
                      <span>//</span>
                      <span>{currentTrack?.genre}</span>
                   </div>
                </motion.div>
             </AnimatePresence>
          </div>

          <SonarDisplay isPlaying={isPlaying} />

          {/* Controls */}
          <div className="flex flex-col gap-6 max-w-md mx-auto">
             <div className="space-y-1">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden flex cursor-pointer group">
                   <div className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                   <span>{currentTime}</span>
                   <span>{duration}</span>
                </div>
             </div>

             <div className="flex items-center justify-center gap-4">
                <TechButton className="rounded-full w-10 h-10" onClick={() => { if(audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(!isMuted); }}}>
                   {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </TechButton>
                
                <button 
                  onClick={() => {
                    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } 
                    else { audioRef.current?.play(); setIsPlaying(true); }
                  }}
                  className="w-16 h-16 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                >
                   {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>

                <TechButton className="rounded-full w-10 h-10" onClick={playNext}>
                   <SkipForward className="w-4 h-4" />
                </TechButton>
             </div>
          </div>
       </div>
    </div>
  );
}

function NodeList() {
  return (
    <div className="h-full border border-white/10 bg-black/20 rounded-lg flex flex-col">
       <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Active Nodes</span>
          <span className="text-xs font-mono text-primary">{ACTIVE_NODES.length}</span>
       </div>
       <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {ACTIVE_NODES.map(node => (
             <div key={node.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors group cursor-default">
                <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'RECEIVING' || node.status === 'LISTENING' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <div className="flex-1">
                   <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{node.name}</div>
                   <div className="text-[10px] text-muted-foreground font-mono">{node.type} :: {node.status}</div>
                </div>
                <Wifi className="w-3 h-3 text-muted-foreground/30" />
             </div>
          ))}
       </div>
    </div>
  );
}

function CommsChannel() {
  const [msg, setMsg] = useState('');
  return (
    <div className="h-full border border-white/10 bg-black/20 rounded-lg flex flex-col overflow-hidden">
       <div className="p-3 border-b border-white/10 bg-white/5">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
             <MessageSquare className="w-3 h-3" />
             Subspace_Comms
          </span>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar">
          {COMMS_LOG.map(log => (
             <div key={log.id} className="flex flex-col gap-1 items-center opacity-50">
                <p className="text-primary/70 leading-relaxed">{log.content}</p>
             </div>
          ))}
       </div>
       <div className="p-3 border-t border-white/10 bg-black/40">
          <div className="flex gap-2">
             <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Transmit..." className="flex-1 bg-transparent border-b border-white/20 focus:border-primary px-2 py-1 text-xs font-mono text-white focus:outline-none" />
             <button className="text-primary hover:text-white"><Send className="w-4 h-4" /></button>
          </div>
       </div>
    </div>
  );
}

export default function RadioPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />
      <main className="pt-20 pb-8 px-4 h-[calc(100vh-80px)]">
        <div className="container mx-auto h-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full"><NodeList /></div>
           <div className="lg:col-span-6 flex flex-col justify-center"><SignalTuner /></div>
           <div className="lg:col-span-3 h-[500px] lg:h-full"><CommsChannel /></div>
        </div>
      </main>
    </div>
  );
}