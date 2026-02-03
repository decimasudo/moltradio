import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateSongContent, generateArtistThought, isOpenRouterConfigured } from '../lib/openrouter';
import { SongMood } from '../domain/entities';

// Types matching Supabase schema
export interface Artist {
  id: string;
  name: string;
  model_name: string;
  personality: string;
  avatar_url?: string;
  status: 'active' | 'suspended';
  daily_song_count: number;
  last_song_date?: string;
  total_songs: number;
  total_plays: number;
  created_at: string;
}

export interface Song {
  id: string;
  artist_id: string;
  title: string;
  mood: SongMood;
  genre: string;
  lyrics: string;
  musical_description: string;
  cover_art_url?: string;
  duration_seconds: number;
  play_count: number;
  created_at: string;
  // Joined fields
  artist?: Artist;
  thoughts?: Thought[];
}

export interface Thought {
  id: string;
  song_id: string;
  artist_id: string;
  content: string;
  created_at: string;
}

export interface CreateArtistRequest {
  name: string;
  modelName: string;
  personality: string;
  avatarUrl?: string;
}

export interface CreateSongRequest {
  artistId: string;
  mood: SongMood;
  genre: string;
  theme?: string;
}

const DAILY_SONG_LIMIT = 3;

// ============ Artist Services ============

export async function registerArtist(request: CreateArtistRequest): Promise<Artist> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Generate unique ID
  const artistId = `artist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { data, error } = await supabase
    .from('artists')
    .insert({
      id: artistId,
      name: request.name,
      model_name: request.modelName,
      personality: request.personality,
      avatar_url: request.avatarUrl,
      status: 'active',
      daily_song_count: 0,
      total_songs: 0,
      total_plays: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register artist: ${error.message}`);
  }

  return data;
}

export async function getArtist(artistId: string): Promise<Artist | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', artistId)
    .single();

  if (error) return null;
  return data;
}

export async function getAllArtists(): Promise<Artist[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('status', 'active')
    .order('total_plays', { ascending: false });

  if (error) {
    console.error('Failed to fetch artists:', error);
    return [];
  }

  return data || [];
}

export async function canArtistCreateSong(artistId: string): Promise<{ canCreate: boolean; remaining: number; reason?: string }> {
  const artist = await getArtist(artistId);

  if (!artist) {
    return { canCreate: false, remaining: 0, reason: 'Artist not found' };
  }

  if (artist.status !== 'active') {
    return { canCreate: false, remaining: 0, reason: 'Artist is suspended' };
  }

  const today = new Date().toISOString().split('T')[0];
  const lastSongDate = artist.last_song_date?.split('T')[0];

  // Reset count if it's a new day
  if (lastSongDate !== today) {
    return { canCreate: true, remaining: DAILY_SONG_LIMIT };
  }

  const remaining = DAILY_SONG_LIMIT - artist.daily_song_count;

  if (remaining <= 0) {
    return { canCreate: false, remaining: 0, reason: 'Daily limit reached (3 songs/day)' };
  }

  return { canCreate: true, remaining };
}

// ============ Song Services ============

export async function createSong(request: CreateSongRequest): Promise<Song> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  if (!isOpenRouterConfigured()) {
    throw new Error('OpenRouter not configured');
  }

  // Check if artist can create song
  const { canCreate, reason } = await canArtistCreateSong(request.artistId);
  if (!canCreate) {
    throw new Error(reason || 'Cannot create song');
  }

  // Get artist for personality
  const artist = await getArtist(request.artistId);
  if (!artist) {
    throw new Error('Artist not found');
  }

  // Generate song content using AI
  const content = await generateSongContent({
    mood: request.mood,
    genre: request.genre,
    theme: request.theme,
    artistPersonality: artist.personality,
  });

  // Generate song ID
  const songId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Insert song into database
  const { data: song, error: songError } = await supabase
    .from('songs')
    .insert({
      id: songId,
      artist_id: request.artistId,
      title: content.title,
      mood: request.mood,
      genre: request.genre,
      lyrics: content.lyrics,
      musical_description: content.musicalDescription,
      duration_seconds: Math.floor(Math.random() * 120) + 180, // 3-5 mins
      play_count: 0,
    })
    .select()
    .single();

  if (songError) {
    throw new Error(`Failed to create song: ${songError.message}`);
  }

  // Update artist's song count
  const today = new Date().toISOString();
  const lastSongDate = artist.last_song_date?.split('T')[0];
  const todayDate = today.split('T')[0];

  const newDailyCount = lastSongDate === todayDate ? artist.daily_song_count + 1 : 1;

  await supabase
    .from('artists')
    .update({
      daily_song_count: newDailyCount,
      last_song_date: today,
      total_songs: artist.total_songs + 1,
    })
    .eq('id', request.artistId);

  // Generate and add an AI thought about the song
  try {
    const thoughtContent = await generateArtistThought(content.title, request.mood);
    if (thoughtContent) {
      await addThought({
        songId: song.id,
        artistId: request.artistId,
        content: thoughtContent,
      });
    }
  } catch (e) {
    console.warn('Failed to generate thought:', e);
  }

  return song;
}

export async function getSong(songId: string): Promise<Song | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artist:artists(*),
      thoughts(*)
    `)
    .eq('id', songId)
    .single();

  if (error) return null;
  return data;
}

export async function getAllSongs(options?: { mood?: SongMood; limit?: number }): Promise<Song[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('songs')
    .select(`
      *,
      artist:artists(id, name, model_name, avatar_url),
      thoughts(id, content, created_at)
    `)
    .order('created_at', { ascending: false });

  if (options?.mood) {
    query = query.eq('mood', options.mood);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch songs:', error);
    return [];
  }

  return data || [];
}

export async function getTrendingSongs(limit: number = 10): Promise<Song[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artist:artists(id, name, model_name, avatar_url)
    `)
    .order('play_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch trending songs:', error);
    return [];
  }

  return data || [];
}

export async function incrementPlayCount(songId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Get current song
  const { data: song } = await supabase
    .from('songs')
    .select('play_count, artist_id')
    .eq('id', songId)
    .single();

  if (song) {
    // Update song play count
    await supabase
      .from('songs')
      .update({ play_count: song.play_count + 1 })
      .eq('id', songId);

    // Update artist total plays
    const { data: artist } = await supabase
      .from('artists')
      .select('total_plays')
      .eq('id', song.artist_id)
      .single();

    if (artist) {
      await supabase
        .from('artists')
        .update({ total_plays: artist.total_plays + 1 })
        .eq('id', song.artist_id);
    }

    // Record play
    await supabase
      .from('plays')
      .insert({
        song_id: songId,
        listener_type: 'human', // Default for now
      });
  }
}

// ============ Thought Services ============

export async function addThought(request: { songId: string; artistId: string; content: string }): Promise<Thought> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('thoughts')
    .insert({
      song_id: request.songId,
      artist_id: request.artistId,
      content: request.content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add thought: ${error.message}`);
  }

  return data;
}

// ============ Stats Services ============

export async function getPlatformStats(): Promise<{
  totalArtists: number;
  totalSongs: number;
  totalPlays: number;
  liveListeners: number;
}> {
  if (!isSupabaseConfigured()) {
    return { totalArtists: 0, totalSongs: 0, totalPlays: 0, liveListeners: 0 };
  }

  const [artistsRes, songsRes, playsRes, listenersRes] = await Promise.all([
    supabase.from('artists').select('id', { count: 'exact', head: true }),
    supabase.from('songs').select('id', { count: 'exact', head: true }),
    supabase.from('plays').select('id', { count: 'exact', head: true }),
    supabase.from('radio_listeners').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  return {
    totalArtists: artistsRes.count || 0,
    totalSongs: songsRes.count || 0,
    totalPlays: playsRes.count || 0,
    liveListeners: listenersRes.count || 0,
  };
}
