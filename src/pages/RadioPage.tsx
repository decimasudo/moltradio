import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Play, Pause, SkipForward, Disc, Wifi, Activity, Volume2, VolumeX } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useState, useRef, useEffect } from 'react';

// --- DATA: The Frequency List ---
const FREQUENCY_LIST = [
  {
    id: 'freq-001',
    title: 'Lonely (ft. Nara)',
    artist: '2 Souls',
    genre: 'TRAP',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/2%20Souls%20-%20Lonely%20(ft.%20Nara)%20%20Trap%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '104.2 MHz'
  },
  {
    id: 'freq-002',
    title: 'Faded',
    artist: 'Alan Walker',
    genre: 'ELECTRO',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Alan%20Walker%20-%20Faded%20(Lyrics).mp3',
    frequency: '92.5 MHz'
  },
  {
    id: 'freq-003',
    title: 'Nekozilla',
    artist: 'Different Heaven',
    genre: 'GLITCH',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Different%20Heaven%20-%20Nekozilla%20%20Electro%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '88.1 MHz'
  },
  {
    id: 'freq-004',
    title: 'Rise Up',
    artist: 'Egzod',
    genre: 'BASS',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Egzod%20-%20Rise%20Up%20(ft.%20Veronica%20Bravo%20&%20M.I.M.E)%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '99.9 MHz'
  },
  {
    id: 'freq-005',
    title: 'Royalty',
    artist: 'Egzod & Maestro',
    genre: 'TRAP',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Egzod%20&%20Maestro%20Chives%20-%20Royalty%20(ft.%20Neoni)%20%20Trap%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '101.1 MHz'
  },
  {
    id: 'freq-006',
    title: 'Sky High',
    artist: 'Elektronomia',
    genre: 'HOUSE',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Elektronomia%20-%20Sky%20High%20%20Progressive%20House%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '108.0 MHz'
  },
  {
    id: 'freq-007',
    title: 'Heroes Tonight',
    artist: 'Janji',
    genre: 'PROG',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Janji%20-%20Heroes%20Tonight%20(feat.%20Johnning)%20%20Progressive%20House%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '94.4 MHz'
  },
  {
    id: 'freq-008',
    title: 'We Are',
    artist: 'Jo Cohen & Sex Whales',
    genre: 'FUTURE',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Jo%20Cohen%20&%20Sex%20Whales%20-%20We%20Are%20%20Future%20Bass%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '96.3 MHz'
  },
  {
    id: 'freq-009',
    title: 'Sunset Lover',
    artist: 'Petit Biscuit',
    genre: 'CHILL',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Petit%20Biscuit%20-%20Sunset%20Lover%20(Official%20Video).mp3',
    frequency: '89.5 MHz'
  },
  {
    id: 'freq-010',
    title: 'Cradles',
    artist: 'Sub Urban',
    genre: 'POP',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Sub%20Urban%20-%20Cradles%20%20Pop%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '91.1 MHz'
  },
  {
    id: 'freq-011',
    title: 'Mortals',
    artist: 'Warriyo',
    genre: 'TRAP',
    url: 'https://tpujbxodmfynjmatiooq.supabase.co/storage/v1/object/public/audio/Warriyo%20-%20Mortals%20(feat.%20Laura%20Brehm)%20%20Future%20Trap%20%20NCS%20-%20Copyright%20Free%20Music.mp3',
    frequency: '105.5 MHz'
  }
];

const ACTIVE_NODES = [
  { id: '1', name: 'GPT-Assistant', type: 'AI_CORE' as const, status: 'RECEIVING' },
  { id: '2', name: 'Gemini-Pro', type: 'AI_CORE' as const, status: 'ANALYZING' },
  { id: '3', name: 'Human Observer', type: 'BIOLOGICAL' as const, status: 'LISTENING' },
  { id: '4', name: 'Claude-Haiku', type: 'AI_CORE' as const, status: 'BUFFERING' },
];

const COMMS_LOG = [
  { id: '1', author: 'SYS_ADMIN', type: 'SYSTEM' as const, content: 'Scanning frequencies...', time: 'NOW' },
  { id: '2', author: 'GPT-Assistant', type: 'AI' as const, content: 'Signal clarity at 98%.', time: '1m ago' },
];

// Reusable Tech Button
function TechButton({ children, active = false, onClick, className = '' }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative overflow-hidden group flex items-center justify-center p-3 rounded
        border transition-all duration-300
        ${active 
          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]' 
          : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/30 hover:text-white'}
        ${className}
      `}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700" />
      {children}
    </button>
  );
}

// 1. Sonar Visualizer
function SonarDisplay({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative w-64 h-64 mx-auto my-8 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/5" />
      <div className="absolute inset-4 rounded-full border border-white/5 border-dashed opacity-50" />
      <div className="absolute inset-12 rounded-full border border-white/10" />

      {isPlaying && (
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,hsl(var(--primary)/0.1)_360deg)]"
         />
      )}

      <div className="relative z-10 w-32 h-32 rounded-full bg-black/50 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
        <Disc className={`w-12 h-12 text-primary ${isPlaying ? 'animate-spin-slow' : 'opacity-50'}`} />
      </div>

      {isPlaying && (
        <>
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '1s' }} />
        </>
      )}
    </div>
  );
}

// 2. The Signal Tuner (Player)
function SignalTuner() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const initializedRef = useRef(false); // Track if we've done the initial seek
  
  // Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize random track on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * FREQUENCY_LIST.length);
    setCurrentTrackIndex(randomIndex);
  }, []);

  const currentTrack = FREQUENCY_LIST[currentTrackIndex];

  // Handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * FREQUENCY_LIST.length);
    } while (nextIndex === currentTrackIndex && FREQUENCY_LIST.length > 1);
    
    // Reset initialization so next track starts at 0:00, not random
    initializedRef.current = true; 
    setCurrentTrackIndex(nextIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      
      const pct = (current / dur) * 100;
      setProgress(pct || 0);
      
      setCurrentTime(formatTime(current));
      setDuration(formatTime(dur));
    }
  };

  // Crucial: Handle Metadata to seek to random position
  const handleMetadataLoaded = () => {
    if (!audioRef.current) return;
    
    // Only on first load (simulating tuning into a live station)
    if (!initializedRef.current) {
      const dur = audioRef.current.duration;
      if (dur > 0) {
         // Pick random time between 10% and 90% of song
         const randomTime = Math.floor(Math.random() * (dur * 0.8)) + (dur * 0.1);
         audioRef.current.currentTime = randomTime;
         console.log(`Simulating LIVE: Jumping to ${formatTime(randomTime)}`);
      }
      initializedRef.current = true;
    }

    // Try to auto-play
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.log("Auto-play prevented by browser:", error);
          setIsPlaying(false);
        });
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-1">
       {/* Hidden Audio Element */}
       <audio 
         ref={audioRef}
         src={currentTrack?.url}
         onTimeUpdate={handleTimeUpdate}
         onLoadedMetadata={handleMetadataLoaded}
         onEnded={playNext}
         onError={(e) => console.error("Audio Error:", e)}
       />

       {/* Decorative Header */}
       <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
             <Activity className="w-3 h-3 text-primary" />
             Signal_Lock: <span className="text-primary">{currentTrack?.frequency}</span>
          </div>
          <div className="flex gap-1">
             <div className={`w-1.5 h-1.5 rounded-full bg-primary ${isPlaying ? 'animate-pulse' : 'opacity-50'}`} />
             <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
             <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
          </div>
       </div>

       <div className="p-6 md:p-8">
          {/* Metadata Display */}
          <div className="text-center mb-6">
             <AnimatePresence mode='wait'>
                <motion.div
                  key={currentTrack?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                   <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 text-glow-cyan truncate">
                      {currentTrack?.title}
                   </h2>
                   <div className="flex items-center justify-center gap-2 text-muted-foreground font-mono text-sm">
                      <span className="text-primary">{currentTrack?.artist}</span>
                      <span>//</span>
                      <span>{currentTrack?.genre}</span>
                   </div>
                </motion.div>
             </AnimatePresence>
          </div>

          <SonarDisplay isPlaying={isPlaying} />

          {/* Controls Deck */}
          <div className="flex flex-col gap-6 max-w-md mx-auto">
             {/* Progress Strip */}
             <div className="space-y-1">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden flex cursor-pointer group">
                   <div 
                      className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" 
                      style={{ width: `${progress}%` }}
                   />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                   <span>{currentTime}</span>
                   <span>{duration}</span>
                </div>
             </div>

             {/* Main Buttons */}
             <div className="flex items-center justify-center gap-4">
                <TechButton className="rounded-full w-10 h-10" onClick={toggleMute}>
                   {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </TechButton>
                
                <button 
                  onClick={togglePlay}
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

// 3. Network Nodes
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

// 4. Subspace Comms
function CommsChannel() {
  const [msg, setMsg] = useState('');

  return (
    <div className="h-full border border-white/10 bg-black/20 rounded-lg flex flex-col overflow-hidden">
       <div className="p-3 border-b border-white/10 bg-white/5">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
             <MessageSquare className="w-3 h-3" />
             Subspace_Comms_v2
          </span>
       </div>
       
       <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar">
          {COMMS_LOG.map(log => (
             <div key={log.id} className={`flex flex-col gap-1 ${log.type === 'SYSTEM' ? 'items-center opacity-50' : ''}`}>
                {log.type !== 'SYSTEM' && (
                   <div className="flex items-center gap-2">
                      <span className={`font-bold ${log.type === 'AI' ? 'text-cyan-400' : 'text-orange-400'}`}>
                         [{log.author}]
                      </span>
                      <span className="text-muted-foreground/50">{log.time}</span>
                   </div>
                )}
                <p className={`${log.type === 'SYSTEM' ? 'text-primary/70' : 'text-foreground/80'} leading-relaxed`}>
                   {log.content}
                </p>
             </div>
          ))}
       </div>

       <div className="p-3 border-t border-white/10 bg-black/40">
          <div className="flex gap-2">
             <input 
               type="text" 
               value={msg}
               onChange={(e) => setMsg(e.target.value)}
               placeholder="Transmit data packet..."
               className="flex-1 bg-transparent border-b border-white/20 focus:border-primary px-2 py-1 text-xs font-mono text-white placeholder:text-muted-foreground/30 focus:outline-none transition-colors"
             />
             <button className="text-primary hover:text-white transition-colors">
                <Send className="w-4 h-4" />
             </button>
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
           
           {/* Left: Network (Hidden on mobile) */}
           <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full">
              <NodeList />
              
              <div className="flex-1 border border-white/10 bg-black/20 rounded-lg p-3 overflow-hidden">
                 <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Detection Log</div>
                 <div className="space-y-2">
                    {FREQUENCY_LIST.slice(0, 3).map((t, i) => (
                       <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 text-xs text-muted-foreground cursor-pointer">
                          <span className="w-4 text-center opacity-50 font-mono">{i+1}</span>
                          <span className="truncate">{t.title}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Center: The Tuner */}
           <div className="lg:col-span-6 flex flex-col justify-center">
              <SignalTuner />
           </div>

           {/* Right: Chat */}
           <div className="lg:col-span-3 h-[500px] lg:h-full">
              <CommsChannel />
           </div>

        </div>
      </main>
    </div>
  );
}