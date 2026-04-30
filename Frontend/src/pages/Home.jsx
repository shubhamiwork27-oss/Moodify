import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import gsap from 'gsap';
import BackgroundAnimation from '../components/BackgroundAnimation';
import {
  FaPlay, FaPause, FaStepForward, FaStepBackward,
  FaCamera, FaSmile, FaHeart, FaVolumeUp, FaVolumeMute,
  FaRedo, FaRandom, FaSearch
} from 'react-icons/fa';
import {
  MdHome, MdSearch, MdFaceRetouchingNatural,
  MdFavorite, MdFavoriteBorder, MdQueue,
  MdSettings, MdPerson, MdLogout, MdClose, MdVolumeUp,
  MdDarkMode, MdShuffle, MdRepeat, MdInfo,
  MdAdd, MdPlaylistAdd, MdPlaylistPlay, MdDelete, MdCheck,
  MdLibraryMusic, MdMovieFilter, MdSelfImprovement,
  MdLocalFireDepartment, MdHeadset, MdFavorite as MdHeart
} from 'react-icons/md';
import { RiMusicFill, RiHeartFill, RiHeadphoneFill,
         RiMovie2Fill, RiLeafFill, RiFlashlightFill } from 'react-icons/ri';
import { GiLotus } from 'react-icons/gi';
import './Home.css';

/* ─── song data ─────────────────────────── */
const SONGS = [
  { title:"Rang De Basanti",      artist:"A.R. Rahman",       mood:"energetic", cat:"bollywood" },
  { title:"Tum Hi Ho",            artist:"Arijit Singh",       mood:"romantic",  cat:"bollywood" },
  { title:"Kabira",               artist:"Rekha Bhardwaj",     mood:"calm",      cat:"bollywood" },
  { title:"Zinda Hoon Main",      artist:"Javed Ali",          mood:"happy",     cat:"bollywood" },
  { title:"Ik Onkar",             artist:"Harshdeep Kaur",     mood:"spiritual", cat:"spiritual" },
  { title:"Om Namah Shivaya",     artist:"Pt. Jasraj",         mood:"spiritual", cat:"spiritual" },
  { title:"Neon Lights Skyline",  artist:"Moodify Beats",      mood:"energetic", cat:"indie"     },
  { title:"Midnight City Dreams", artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Raghupati Raghav",     artist:"Vishnu Narayan",     mood:"spiritual", cat:"spiritual" },
  { title:"Maiyya Mainu",         artist:"Shadab Faridi",      mood:"spiritual", cat:"spiritual" },
  { title:"Channa Mereya",        artist:"Arijit Singh",       mood:"sad",       cat:"bollywood" },
  { title:"Hawa Banke",           artist:"Darshan Raval",      mood:"romantic",  cat:"bollywood" },
  { title:"Retro Wave Synth",     artist:"Moodify Beats",      mood:"happy",     cat:"indie"     },
  { title:"Kesariya",             artist:"Arijit Singh",       mood:"romantic",  cat:"bollywood" },
  { title:"Hanuman Chalisa",      artist:"Gulshan Kumar",      mood:"spiritual", cat:"spiritual" },
  { title:"Shiv Tandav Stotram",  artist:"Shankar Mahadevan",  mood:"spiritual", cat:"spiritual" },
  { title:"Senorita",             artist:"Shawn Mendes",       mood:"happy",     cat:"english"   },
  { title:"Ocean Breeze Vibe",    artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Jai Jai Shiv Shankar", artist:"Lata Mangeshkar",    mood:"spiritual", cat:"spiritual" },
  { title:"Kailash Parvat Wale",  artist:"Narendra Chanchal",  mood:"spiritual", cat:"spiritual" },
  { title:"Galactic Journey",     artist:"Moodify Beats",      mood:"energetic", cat:"indie"     },
  { title:"Phir Le Aaya Dil",     artist:"Rekha Bhardwaj",     mood:"sad",       cat:"bollywood" },
  { title:"Electric Heartbeat",   artist:"Moodify Beats",      mood:"energetic", cat:"indie"     },
  { title:"Teri Mitti",           artist:"B Praak",            mood:"sad",       cat:"bollywood" },
  { title:"Maula Mere Maula",     artist:"Roop Kumar Rathod",  mood:"spiritual", cat:"spiritual" },
  { title:"Ae Dil Hai Mushkil",   artist:"Arijit Singh",       mood:"sad",       cat:"bollywood" },
  { title:"Sunset Boulevard",     artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Lofi Chill Beats",     artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Teri Aakhya Ka Kajal", artist:"Sapna Choudhary",    mood:"happy",     cat:"folk"      },
  { title:"Dil Dhadakne Do",      artist:"Priyanka Chopra",    mood:"happy",     cat:"bollywood" },
  { title:"Aurora Borealis",      artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Abhi Mujh Mein Kahin", artist:"Sonu Nigam",         mood:"sad",       cat:"bollywood" },
  { title:"Crystal Clear Water",  artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Swag Se Swagat",       artist:"Vishal Dadlani",     mood:"energetic", cat:"bollywood" },
  { title:"Urban Exploration",    artist:"Moodify Beats",      mood:"energetic", cat:"indie"     },
  { title:"Wakhre Wakhre",        artist:"Diljit Dosanjh",     mood:"happy",     cat:"punjabi"   },
  { title:"Kun Faya Kun",         artist:"A.R. Rahman",        mood:"spiritual", cat:"spiritual" },
  { title:"Aisi Deewangi",        artist:"Udit Narayan",       mood:"romantic",  cat:"bollywood" },
  { title:"Desert Mirage",        artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Ude Dil Befikre",      artist:"Benny Dayal",        mood:"happy",     cat:"bollywood" },
  { title:"Echoes of Time",       artist:"Moodify Beats",      mood:"sad",       cat:"indie"     },
  { title:"Badtameez Dil",        artist:"Udit Narayan",       mood:"energetic", cat:"bollywood" },
  { title:"Silent Mountains",     artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Dil Se Re",            artist:"A.R. Rahman",        mood:"romantic",  cat:"bollywood" },
  { title:"Deep Space Nine",      artist:"Moodify Beats",      mood:"calm",      cat:"indie"     },
  { title:"Nagada Sang Dhol",     artist:"Osman Mir",          mood:"energetic", cat:"bollywood" },
  { title:"Quantum Leap",         artist:"Moodify Beats",      mood:"energetic", cat:"indie"     },
  { title:"Lost in the Woods",    artist:"Moodify Beats",      mood:"sad",       cat:"indie"     },
  { title:"Jai Ho",               artist:"A.R. Rahman",        mood:"happy",     cat:"bollywood" },
  { title:"Ishq Jalakar",         artist:"Karvaan",            mood:"romantic",  cat:"bollywood" },
];

const MOOD_CONFIG = {
  happy:     { play:"happy",     emoji:"😄", label:"Happy",     color:"#4ade80", tip:"Joyful & uplifting vibes"  },
  sad:       { play:"happy",     emoji:"😢", label:"Sad",       color:"#93c5fd", tip:"Something to lift you up!" },
  angry:     { play:"calm",      emoji:"😤", label:"Angry",     color:"#fb923c", tip:"Calming you down..."       },
  fearful:   { play:"calm",      emoji:"😨", label:"Fearful",   color:"#c4b5fd", tip:"Soothing & peaceful"       },
  disgusted: { play:"calm",      emoji:"😒", label:"Disgusted", color:"#86efac", tip:"Neutral & mellow"          },
  surprised: { play:"energetic", emoji:"😲", label:"Surprised", color:"#fde68a", tip:"High-energy tracks!"       },
  neutral:   { play:"calm",      emoji:"😐", label:"Neutral",   color:"#b3b3b3", tip:"Balanced & mellow"         },
};

/* Library items — each with a distinct icon + accent color */
const LIBRARY_ITEMS = [
  { name:'All Songs',   Icon: MdLibraryMusic,   filter:'all',       color:'#b3b3b3' },
  { name:'Bollywood',   Icon: RiMovie2Fill,      filter:'bollywood', color:'#ff7043' },
  { name:'Spiritual',   Icon: GiLotus,           filter:'spiritual', color:'#fbbf24' },
  { name:'Indie Vibes', Icon: RiHeadphoneFill,   filter:'indie',     color:'#818cf8' },
  { name:'Romantic',    Icon: RiHeartFill,       filter:'romantic',  color:'#f472b6' },
  { name:'Energy',      Icon: RiFlashlightFill,  filter:'energetic', color:'#f97316' },
];

/* ─── component ─────────────────────────── */
export default function Home() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const audioRef    = useRef(null);
  const intervalRef = useRef(null);
  const trackRef    = useRef(null);
  const progressRef = useRef(null);  // progress slider
  const volRef      = useRef(null);  // volume slider
  const volWrapRef  = useRef(null);  // volume wrapper (for wheel listener)

  /* state */
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [camActive,    setCamActive]    = useState(false);
  const [liveExpr,     setLiveExpr]     = useState(null);   // real-time expression from faceapi
  const [lockedMood,   setLockedMood]   = useState(null);   // after clicking detect
  const [songs,        setSongs]        = useState([]);
  const [displayed,    setDisplayed]    = useState([]);
  const [catFilter,    setCatFilter]    = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const PILLS = [
    {label:'😄 Happy', val:'happy'}, {label:'😢 Sad', val:'sad'},
    {label:'😌 Calm', val:'calm'}, {label:'⚡ Energy', val:'energetic'},
    {label:'🕉️ Spiritual', val:'spiritual'},
  ];
  const [searchQ,      setSearchQ]      = useState('');
  const [songIdx,      setSongIdx]      = useState(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [curTime,      setCurTime]      = useState(0);
  const [volume,       setVolume]       = useState(0.8);
  const [shuffle,      setShuffle]      = useState(false);
  const [repeat,       setRepeat]       = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [settingsOpen, setSettingsOpen]  = useState(false);
  const [settingsTab,  setSettingsTab]   = useState('account');

  /* Liked songs — persisted in localStorage */
  const [likedSongs, setLikedSongs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('moodify_liked') || '[]')); }
    catch { return new Set(); }
  });

  /* Search overlay */
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchOvQ,   setSearchOvQ]   = useState('');
  const searchInputRef = useRef(null);

  /* Playlists — persisted in localStorage */
  const [playlists,         setPlaylists]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('moodify_playlists') || '[]'); }
    catch { return []; }
  });
  const [playlistModal,     setPlaylistModal]     = useState(false);
  const [newPlaylistName,   setNewPlaylistName]   = useState('');
  const [addToPlaylistCtx,  setAddToPlaylistCtx]  = useState(null); // {song, x, y}

  /* ── Liked toggle */
  const toggleLike = useCallback((songId, e) => {
    e.stopPropagation();
    setLikedSongs(prev => {
      const next = new Set(prev);
      next.has(songId) ? next.delete(songId) : next.add(songId);
      localStorage.setItem('moodify_liked', JSON.stringify([...next]));
      return next;
    });
  }, []);

  /* ── Playlist handlers */
  const savePlaylists = (next) => {
    setPlaylists(next);
    localStorage.setItem('moodify_playlists', JSON.stringify(next));
  };
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    savePlaylists([...playlists, { id: Date.now(), name: newPlaylistName.trim(), songIds: [] }]);
    setNewPlaylistName(''); setPlaylistModal(false);
  };
  const addSongToPlaylist = (plId, song, e) => {
    e?.stopPropagation();
    savePlaylists(playlists.map(pl =>
      pl.id === plId && !pl.songIds.includes(song.id)
        ? { ...pl, songIds: [...pl.songIds, song.id] }
        : pl
    ));
    setAddToPlaylistCtx(null);
  };
  const deletePlaylist = (plId) => {
    const next = playlists.filter(p => p.id !== plId);
    savePlaylists(next);
    if (catFilter === `pl_${plId}`) applyPill('all');
  };


  /* get username from localStorage */
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const userName = storedUser?.username || storedUser?.name || 'Guest';
  const userInitial = userName.charAt(0).toUpperCase();

  /* derived */
  const currentSong = songIdx !== null ? displayed[songIdx] : null;
  const moodCfg     = liveExpr && MOOD_CONFIG[liveExpr] ? MOOD_CONFIG[liveExpr] : null;
  const lockedCfg   = lockedMood && MOOD_CONFIG[lockedMood] ? MOOD_CONFIG[lockedMood] : null;

  /* ── init ── */
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (e) { console.error('model load', e); }
    })();
    fetchSongs();

    // entrance animations
    gsap.fromTo('.sp-sidebar', { x:-50, opacity:0 }, { x:0, opacity:1, duration:0.7, ease:'power3.out' });
    gsap.fromTo('.sp-main',    { opacity:0 },         { opacity:1, duration:0.9, ease:'power2.out', delay:0.2 });
    gsap.fromTo('.sp-bar',     { y:80, opacity:0 },   { y:0, opacity:1, duration:0.6, ease:'back.out(1.5)', delay:0.4 });
  }, []);

  /* close profile dropdown on outside click */
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => { if (!e.target.closest('.profile-wrap')) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  /* ── fetch songs ── */
  const fetchSongs = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/songs/local', { withCredentials:true });
      if (data.songs) {
        const mapped = data.songs.map((filename, i) => ({
          id: i, filename,
          ...SONGS[i % SONGS.length],
          cover: `https://picsum.photos/seed/${i + 77}/300/300`,
        }));
        setSongs(mapped);
        setDisplayed(mapped);
      }
    } catch (e) { console.error(e); }
  };

  /* ── filter logic ── */
  const applyFilter = useCallback((allSongs, cat, query, moodFilter, liked, pls) => {
    let list = allSongs;
    if (cat === 'liked') list = list.filter(s => liked && liked.has(s.id));
    else if (cat?.startsWith('pl_')) {
      const plId = parseInt(cat.slice(3));
      const pl   = pls?.find(p => p.id === plId);
      list = pl ? list.filter(s => pl.songIds.includes(s.id)) : [];
    }
    else if (moodFilter) list = list.filter(s => s.mood === moodFilter);
    else if (cat !== 'all') list = list.filter(s => s.cat === cat || s.mood === cat);
    if (query) list = list.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, []);

  useEffect(() => {
    const mf = lockedCfg ? lockedCfg.play : null;
    const next = applyFilter(songs, catFilter, searchQ, mf, likedSongs, playlists);
    setDisplayed(next);
    setSongIdx(null);
    setIsPlaying(false);

    // animate rows in
    setTimeout(() => {
      gsap.fromTo('.track-row', { opacity:0, y:10 }, { opacity:1, y:0, stagger:0.025, duration:0.3, ease:'power2.out' });
      gsap.fromTo('.mood-card', { opacity:0, scale:0.95 }, { opacity:1, scale:1, stagger:0.04, duration:0.35, ease:'back.out(1.4)' });
    }, 50);
  }, [songs, catFilter, searchQ, lockedMood]);

  /* ── camera ── */
  const startCam = () => {
    setCamActive(true);
    navigator.mediaDevices.getUserMedia({ video:true })
      .then(stream => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } })
      .catch(e => { console.error(e); setCamActive(false); });
  };

  const stopCam = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCamActive(false);
    setLiveExpr(null);
  };

  const onVideoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      const dets = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (dets.length > 0) {
        const exp = dets[0].expressions;
        const dom = Object.keys(exp).reduce((a,b) => exp[a]>exp[b] ? a : b);
        setLiveExpr(dom);
        gsap.fromTo('.live-expr', {scale:1.15},{scale:1,duration:0.25,ease:'back.out'});
      } else setLiveExpr(null);
    }, 900);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  /* ── detect mood & lock ── */
  const detectAndPlay = () => {
    if (!liveExpr) return;
    setLockedMood(liveExpr);
    setCatFilter('all');
    setActiveFilter('all');
    setSearchQ('');
    gsap.fromTo('.mood-result-banner', {opacity:0,y:-12},{opacity:1,y:0,duration:0.5,ease:'back.out(1.7)'});
  };

  const clearMood = () => { setLockedMood(null); };

  /* ── playback ── */
  const play  = idx => { setSongIdx(idx); setIsPlaying(true); };
  const skipN = () => {
    if (songIdx === null) return;
    if (shuffle) { play(Math.floor(Math.random() * displayed.length)); return; }
    play(Math.min(displayed.length-1, songIdx+1));
  };
  const skipP = () => { if (songIdx !== null) play(Math.max(0, songIdx-1)); };

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const c = audioRef.current.currentTime, d = audioRef.current.duration || 0;
    const p = d ? (c / d) * 100 : 0;
    setCurTime(c); setDuration(d); setProgress(p);
    if (progressRef.current) progressRef.current.style.setProperty('--prog', `${p}%`);
    /* Update mini-player progress bar via Media Session API */
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && d) {
      try { navigator.mediaSession.setPositionState({ duration: d, playbackRate: 1, position: c }); }
      catch(e) {}
    }
  };

  const seek = e => {
    if (!audioRef.current || !duration) return;
    const p = parseFloat(e.target.value);
    audioRef.current.currentTime = (p / 100) * duration;
    setProgress(p);
    e.target.style.setProperty('--prog', `${p}%`);
  };

  const setVol = e => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    e.target.style.setProperty('--vol', `${v * 100}%`);
  };

  const toggleMute = () => {
    const next = volume === 0 ? 0.8 : 0;
    setVolume(next);
    if (audioRef.current) audioRef.current.volume = next;
    if (volRef.current) volRef.current.style.setProperty('--vol', `${next * 100}%`);
  };

  /* Mouse-wheel volume control — scroll up = louder, down = quieter */
  const handleVolWheel = useCallback((e) => {
    e.preventDefault();
    const step  = 0.05;
    const delta = e.deltaY < 0 ? step : -step;
    const next  = Math.min(1, Math.max(0, volume + delta));
    setVolume(next);
    if (audioRef.current) audioRef.current.volume = next;
    if (volRef.current)   volRef.current.style.setProperty('--vol', `${next * 100}%`);
  }, [volume]);

  /* Attach non-passive wheel listener after handleVolWheel is defined */
  useEffect(() => {
    const el = volWrapRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleVolWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleVolWheel);
  }, [handleVolWheel]);

  /* ── Media Session API — background mini-player ── */
  useEffect(() => {
    if (!currentSong || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title:   currentSong.title,
      artist:  currentSong.artist,
      album:   'Moodify',
      artwork: [{ src: currentSong.cover, sizes: '300x300', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play',          () => { audioRef.current?.play().catch(()=>{}); setIsPlaying(true);  });
    navigator.mediaSession.setActionHandler('pause',         () => { audioRef.current?.pause(); setIsPlaying(false); });
    navigator.mediaSession.setActionHandler('previoustrack', () => skipP());
    navigator.mediaSession.setActionHandler('nexttrack',     () => skipN());
    navigator.mediaSession.setActionHandler('seekto',        d => { if (audioRef.current && d.seekTime != null) audioRef.current.currentTime = d.seekTime; });
  }, [currentSong, songIdx]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  /* ── Imperative audio play/pause tied to state ── */
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.warn('autoplay blocked:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, songIdx]);

  /* ── Search overlay keyboard shortcut ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setAddToPlaylistCtx(null); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else setSearchOvQ('');
  }, [searchOpen]);

  /* Search overlay computed results */
  const searchOvResults = useMemo(() => {
    if (!searchOvQ.trim()) return songs.slice(0, 12);
    const q = searchOvQ.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    ).slice(0, 18);
  }, [songs, searchOvQ]);

  /* ── filter pills ── */
  const applyPill = (val) => {
    setActiveFilter(val);
    setLockedMood(null);
    setCatFilter(val);
  };

  const fmt     = s => { if(!s||isNaN(s)) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };
  const onEnded = () => { if(repeat){audioRef.current.currentTime=0;audioRef.current.play();}else skipN(); };

  return (
    <div className="sp-shell" onClick={() => setAddToPlaylistCtx(null)}>
      <BackgroundAnimation />

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside className="sp-sidebar">
        <div className="sp-logo" onClick={() => navigate('/home')} style={{cursor:'pointer'}}>
          <img src="/logo.png" alt="Moodify" className="logo-img" />
        </div>

        {/* Primary nav */}
        <nav className="sp-nav">
          <button
            className={`sp-nav-btn ${(!catFilter || catFilter==='all') && !searchQ && !lockedMood ? 'sp-nav-active' : ''}`}
            title="Home"
            onClick={() => {
              applyPill('all');
              setSearchQ('');
            }}
          >
            <MdHome size={22}/>
          </button>
          <button className="sp-nav-btn" title="Search (Ctrl+K)" onClick={(e)=>{e.stopPropagation();setSearchOpen(true);}}>
            <MdSearch size={22}/>
          </button>
        </nav>

        <div className="sp-sidebar-divider"/>

        {/* Add Playlist — icon-only button */}
        <button
          className="sp-lib-add-btn"
          title="Create Playlist"
          onClick={(e)=>{e.stopPropagation();setPlaylistModal(true);}}
        >
          <MdAdd size={22}/>
        </button>

        {/* Library list */}
        <div className="sp-lib-list">
          {/* Liked Songs */}
          <button
            className={`sp-lib-item ${activeFilter==='liked'?'sp-lib-active':''}`}
            onClick={()=>applyPill('liked')}
            title={`Liked Songs (${likedSongs.size})`}
            style={{'--icon-color':'#e25454'}}
          >
            <RiHeartFill size={20} className="lib-icon"/>
          </button>

          {/* Library items with color accents */}
          {LIBRARY_ITEMS.map(({ Icon, filter, name, color }) => (
            <button key={filter}
              className={`sp-lib-item ${activeFilter===filter?'sp-lib-active':''}`}
              onClick={()=>applyPill(filter)} title={name}
              style={{'--icon-color': color}}
            >
              <Icon size={20} className="lib-icon"/>
            </button>
          ))}

          {/* Thin line separator before user playlists */}
          {playlists.length > 0 && <div className="sp-lib-divider"/>}

          {/* User playlists */}
          {playlists.map(pl => (
            <button key={pl.id}
              className={`sp-lib-item ${activeFilter===`pl_${pl.id}`?'sp-lib-active':''}`}
              onClick={()=>applyPill(`pl_${pl.id}`)}
              title={`${pl.name} (⋅ ${pl.songIds.length})`}
              style={{'--icon-color':'#a78bfa'}}
            >
              <MdPlaylistPlay size={20} className="lib-icon"/>
            </button>
          ))}
        </div>
      </aside>

      {/* ═══════════════ MAIN ═══════════════ */}
      <main className="sp-main">

        {/* Top bar */}
        <header className="sp-topbar">
          <div className="topbar-row">
            <span/>
            <div className="search-box">
              <FaSearch size={14} className="search-icon"/>
              <input className="search-input" placeholder="What do you want to play?" value={searchQ} onChange={e=>{setSearchQ(e.target.value);setLockedMood(null);}}/>
            </div>
            {/* left spacer — grid col 1 is empty, search is col 2, badge is col 3 */}
            {lockedCfg ? (
              <div className="mood-result-banner" style={{borderColor:lockedCfg.color,justifySelf:'end'}}>
                <span style={{color:lockedCfg.color}}>{lockedCfg.emoji} {lockedCfg.label}</span>
                <button className="clear-mood" onClick={clearMood}>✕</button>
              </div>
            ) : (
              /* Profile button — 3rd column */
              <div className="profile-wrap" style={{justifySelf:'end'}}>
                <button className="profile-btn" onClick={()=>setProfileOpen(o=>!o)}>
                  <div className="profile-avatar">{userInitial}</div>
                  <span className="profile-name">{userName}</span>
                  <span className="profile-chevron">{profileOpen?'▲':'▼'}</span>
                </button>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-avatar profile-avatar-lg">{userInitial}</div>
                      <div>
                        <div className="profile-dropdown-name">{userName}</div>
                        <div className="profile-dropdown-sub">Free Account · {likedSongs.size} liked</div>
                      </div>
                    </div>
                    <hr className="profile-divider"/>
                    <button className="profile-menu-item" onClick={()=>{setSettingsTab('account');setSettingsOpen(true);setProfileOpen(false);}}>
                      <MdPerson size={16}/> Account
                    </button>
                    <button className="profile-menu-item" onClick={()=>{setSettingsTab('audio');setSettingsOpen(true);setProfileOpen(false);}}>
                      <MdVolumeUp size={16}/> Audio Settings
                    </button>
                    <button className="profile-menu-item" onClick={()=>{setSettingsTab('about');setSettingsOpen(true);setProfileOpen(false);}}>
                      <MdInfo size={16}/> About Moodify
                    </button>
                    <hr className="profile-divider"/>
                    <button className="profile-menu-item profile-logout" onClick={()=>{localStorage.clear();window.location.href='/';}}>
                      <MdLogout size={16}/> Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Filter pills */}
          <div className="filter-pills">
            {PILLS.map(p=>(
              <button key={p.val} className={`pill ${activeFilter===p.val?'pill-active':''}`} onClick={()=>applyPill(p.val)}>{p.label}</button>
            ))}
          </div>
        </header>

        {/* Scrollable body */}
        <div className="sp-body">

          {/* ─── HERO ─── */}
          <section className="mood-hero" style={{display:'block'}}>
            <div className="mood-cards-col">
              <div className="mood-cards-header">
                <h3>{lockedCfg?`${lockedCfg.emoji} ${lockedCfg.label} Playlist`:'Jump back in'}</h3>
                <span className="track-ct">{displayed.length} tracks</span>
              </div>
              <div className="mood-cards-strip">
                {displayed.slice(0,8).map((s,i)=>(
                  <div key={s.id} className="mood-card" onClick={()=>play(i)}>
                    <div className="mood-card-img"><img src={s.cover} alt=""/><div className="mood-card-play"><FaPlay size={12}/></div></div>
                    <p className="mood-card-title">{s.title}</p>
                    <p className="mood-card-artist">{s.artist}</p>
                    <span className={`mpill mpill-${s.mood}`}>{s.mood}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* ─── TRACK LIST ─── */}
          <section className="tracklist-section">
            <div className="tl-header">
              <h3>
                {activeFilter==='liked'
                  ? `❤️ Liked Songs (${likedSongs.size})`
                  : lockedCfg?`Songs for your ${lockedCfg.label} mood`
                  : catFilter==='all'?'All Songs':catFilter.charAt(0).toUpperCase()+catFilter.slice(1)}
              </h3>
            </div>
            <div className="tl-cols-label">
              <span>#</span><span>Title</span><span>Artist</span><span>Mood</span>
            </div>
            <div className="tl-scroll" data-lenis-prevent ref={trackRef}>
              {displayed.map((s,i)=>(
                <div
                  key={s.id}
                  className={`track-row ${songIdx===i?'track-active':''}`}
                  onClick={()=>play(i)}
                >
                  <span className="tr-num">
                    {songIdx===i&&isPlaying
                      ? <span className="play-anim"><span/><span/><span/></span>
                      : i+1}
                  </span>
                  <div className="tr-info">
                    <img src={s.cover} alt="" className="tr-thumb"/>
                    <div>
                      <div className="tr-title">{s.title}</div>
                      <div className="tr-artist">{s.artist}</div>
                    </div>
                  </div>
                  <span className="tr-artist-col">{s.artist}</span>
                  <span className={`mpill mpill-${s.mood}`}>{s.mood}</span>
                  {/* Actions column (Like + Add to Playlist) */}
                  <div className="tr-actions">
                    <button
                      className={`tr-like-btn ${likedSongs.has(s.id)?'tr-liked':''}`}
                      onClick={(e)=>toggleLike(s.id,e)}
                      title={likedSongs.has(s.id)?'Remove from Liked':'Add to Liked'}
                    >
                      {likedSongs.has(s.id) ? <MdFavorite size={15}/> : <MdFavoriteBorder size={15}/>}
                    </button>
                    <div className="tr-pl-wrap" onClick={e=>e.stopPropagation()}>
                      <button
                        className="tr-pl-btn"
                        title="Add to Playlist"
                        onClick={(e)=>{
                          e.stopPropagation();
                          setAddToPlaylistCtx(addToPlaylistCtx?.song?.id===s.id ? null : {song:s});
                        }}
                      >
                        <MdPlaylistAdd size={18}/>
                      </button>
                      {addToPlaylistCtx?.song?.id===s.id && (
                        <div className="tr-pl-dropdown">
                          <div className="tr-pl-dd-title">Add to playlist</div>
                          {playlists.length===0 && (
                            <div className="tr-pl-dd-empty">No playlists yet</div>
                          )}
                          {playlists.map(pl=>(
                            <button key={pl.id} className="tr-pl-dd-item"
                              onClick={(e)=>addSongToPlaylist(pl.id,s,e)}
                            >
                              <MdPlaylistPlay size={15}/>
                              <span>{pl.name}</span>
                              {pl.songIds.includes(s.id) && <MdCheck size={13} style={{color:'#1db954',marginLeft:'auto'}}/>}
                            </button>
                          ))}
                          <button className="tr-pl-dd-new" onClick={(e)=>{e.stopPropagation();setAddToPlaylistCtx(null);setPlaylistModal(true);}}>
                            <MdAdd size={14}/> New Playlist
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {displayed.length===0&&(
                <div className="tl-empty">
                  {activeFilter==='liked'
                    ? '❤️ No liked songs yet. Click the heart on any track!'
                    : activeFilter?.startsWith('pl_')
                    ? '🎵 This playlist is empty. Add songs using the + button on any track.'
                    : 'No songs match. Try a different filter.'}
                </div>
              )}
            </div>
          </section>

        </div>{/* /sp-body */}
      </main>

      {/* ═══════════════ RIGHT PANEL — Mood Engine ═══════════════ */}
      <aside className="sp-right">
        <p className="right-heading">Mood Engine</p>
        <div className="cam-panel">
          <div className="cam-panel-top">
            <h2 className="cam-heading"><MdFaceRetouchingNatural size={16}/> Camera</h2>
            {camActive
              ? <button className="cam-btn cam-btn-off" onClick={stopCam}><FaCamera size={11}/> Off</button>
              : <button className="cam-btn cam-btn-on" onClick={startCam} disabled={!modelsLoaded}>
                  <FaCamera size={11}/>{modelsLoaded?' On':'…'}
                </button>
            }
          </div>
          <div className="cam-view">
            {camActive
              ? <><video ref={videoRef} onPlay={onVideoPlay} className="cam-video" muted/><canvas ref={canvasRef} className="cam-canvas"/><div className="rec-pill"><span className="dot"/>&nbsp;Live</div></>
              : <div className="cam-idle"><FaCamera size={28} className="cam-idle-icon"/><p>{modelsLoaded?'Click On':'Loading…'}</p></div>
            }
          </div>
          <div className="expr-row">
            {liveExpr && moodCfg
              ? <div className="live-expr" style={{borderColor:moodCfg.color+'55',background:moodCfg.color+'18'}}>
                  <span className="expr-emoji">{moodCfg.emoji}</span>
                  <div><div className="expr-label" style={{color:moodCfg.color}}>{moodCfg.label}</div><div className="expr-tip">{moodCfg.tip}</div></div>
                </div>
              : <div className="expr-empty">{camActive?'Detecting…':'Start camera'}</div>
            }
          </div>
          <button className="detect-btn" onClick={detectAndPlay} disabled={!liveExpr}>
            <FaSmile size={13}/> Detect &amp; Play
          </button>
          
          <div className="cam-instructions">
            <span><strong>Smile</strong> to play happy music</span>
            <span>Become <strong>sad</strong> to play sad music</span>
            <span>Look <strong>surprised</strong> for high-energy songs</span>
          </div>
        </div>

        {/* Currently playing info */}
        {currentSong && (
          <div className="now-playing-panel">
            <p className="right-heading">Now Playing</p>
            <div className="now-playing-content">
              <img src={currentSong.cover} alt="" className="now-playing-cover"/>
              <div className="now-playing-info">
                <div className="now-playing-title">{currentSong.title}</div>
                <div className="now-playing-artist">{currentSong.artist}</div>
                <span className={`mpill mpill-${currentSong.mood}`}>{currentSong.mood}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ═══════════════ PLAYER BAR ═══════════════ */}
      <footer className="sp-bar">

        {/* Left — Now Playing */}
        <div className="bar-left">
          {currentSong ? (
            <>
              <img src={currentSong.cover} alt="" className="bar-thumb"/>
              <div className="bar-info">
                <span className="bar-title">{currentSong.title}</span>
                <span className="bar-artist">{currentSong.artist}</span>
              </div>
              <FaHeart size={14} className="bar-like"/>
            </>
          ) : (
            <span className="bar-idle">Choose a song to play</span>
          )}
        </div>

        {/* Center — Controls + Progress */}
        <div className="bar-center">
          <div className="bar-ctrls">
            <button className={`bar-btn ${shuffle?'bar-btn-active':''}`} onClick={()=>setShuffle(s=>!s)} title="Shuffle">
              <FaRandom size={14}/>
            </button>
            <button className="bar-btn" onClick={skipP} title="Previous">
              <FaStepBackward size={16}/>
            </button>
            <button className="bar-play" onClick={togglePlay} title={isPlaying?'Pause':'Play'}>
              {isPlaying ? <FaPause size={16}/> : <FaPlay size={16} style={{marginLeft:'2px'}}/>}
            </button>
            <button className="bar-btn" onClick={skipN} title="Next">
              <FaStepForward size={16}/>
            </button>
            <button className={`bar-btn ${repeat?'bar-btn-active':''}`} onClick={()=>setRepeat(r=>!r)} title="Repeat">
              <FaRedo size={14}/>
            </button>
          </div>

          <div className="bar-progress">
            <span className="bar-time">{fmt(curTime)}</span>
            <input
              ref={progressRef}
              type="range" min="0" max="100"
              value={progress}
              onChange={seek}
              className="bar-slider"
              style={{'--prog':`${progress}%`}}
            />
            <span className="bar-time">{fmt(duration)}</span>
          </div>
        </div>

        {/* Right — Volume (scroll wheel to adjust) */}
        <div className="bar-right" ref={volWrapRef}>
          <button className="bar-btn" onClick={toggleMute} title={volume===0?'Unmute':'Mute'}>
            {volume === 0 ? <FaVolumeMute size={16}/> : <FaVolumeUp size={16}/>}
          </button>
          <input
            ref={volRef}
            type="range" min="0" max="1" step="0.01"
            value={volume}
            onChange={setVol}
            className="vol-slider"
            style={{'--vol':`${volume*100}%`}}
          />
        </div>

        <audio
          ref={audioRef}
          src={currentSong?`http://localhost:3000/api/songs/stream/${encodeURIComponent(currentSong.filename)}`:''}
          autoPlay={isPlaying}
          onEnded={onEnded}
          onPlay={()=>setIsPlaying(true)}
          onPause={()=>setIsPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onTimeUpdate}
        />
      </footer>

      {/* ═══════════════ SEARCH OVERLAY ═══════════════ */}
      {searchOpen && (
        <div className="search-overlay" onClick={()=>setSearchOpen(false)}>
          <div className="search-ov-box" onClick={e=>e.stopPropagation()}>
            <div className="search-ov-input-row">
              <MdSearch size={22} className="search-ov-icon"/>
              <input
                ref={searchInputRef}
                className="search-ov-input"
                placeholder="Songs, artists, moods…"
                value={searchOvQ}
                onChange={e=>setSearchOvQ(e.target.value)}
              />
              {searchOvQ && (
                <button className="search-ov-clear" onClick={()=>setSearchOvQ('')}>
                  <MdClose size={18}/>
                </button>
              )}
            </div>

            {!searchOvQ && <div className="search-ov-hint">Browse all tracks</div>}

            <div className="search-ov-results">
              {searchOvResults.map((s,i)=>(
                <div key={s.id} className="search-ov-row" onClick={()=>{
                  // find real index in songs array and play
                  const realIdx = displayed.findIndex(d=>d.id===s.id);
                  if (realIdx>=0) { play(realIdx); }
                  else {
                    // reset to all and play
                    applyPill('all');
                    setTimeout(()=>play(songs.findIndex(ss=>ss.id===s.id)),100);
                  }
                  setSearchOpen(false);
                }}>
                  <img src={s.cover} alt="" className="search-ov-thumb"/>
                  <div className="search-ov-info">
                    <div className="search-ov-title">{s.title}</div>
                    <div className="search-ov-artist">{s.artist}</div>
                  </div>
                  <span className={`mpill mpill-${s.mood}`}>{s.mood}</span>
                  <FaPlay size={11} className="search-ov-play-icon"/>
                </div>
              ))}
            </div>

            <div className="search-ov-footer">
              <kbd>ESC</kbd> to close · <kbd>↑↓</kbd> to navigate · <kbd>Enter</kbd> to play
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CREATE PLAYLIST MODAL ═══════════════ */}
      {playlistModal && (
        <div className="settings-overlay" onClick={()=>setPlaylistModal(false)}>
          <div className="pl-create-modal" onClick={e=>e.stopPropagation()}>
            <div className="pl-create-header">
              <MdPlaylistAdd size={26} style={{color:'var(--green)'}}/>
              <h2>Create Playlist</h2>
              <button className="settings-close" onClick={()=>setPlaylistModal(false)}><MdClose size={20}/></button>
            </div>
            <input
              className="pl-create-input"
              placeholder="My Playlist name…"
              value={newPlaylistName}
              onChange={e=>setNewPlaylistName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&createPlaylist()}
              autoFocus
            />
            <div className="pl-create-actions">
              <button className="pl-create-cancel" onClick={()=>setPlaylistModal(false)}>Cancel</button>
              <button className="pl-create-confirm" onClick={createPlaylist} disabled={!newPlaylistName.trim()}>Create</button>
            </div>

            {/* Existing playlists management */}
            {playlists.length>0 && (
              <div className="pl-existing">
                <div className="pl-existing-title">Your Playlists</div>
                {playlists.map(pl=>(
                  <div key={pl.id} className="pl-existing-row">
                    <MdPlaylistPlay size={18} style={{color:'var(--green)',flexShrink:0}}/>
                    <span className="pl-existing-name" onClick={()=>{applyPill(`pl_${pl.id}`);setPlaylistModal(false);}}>
                      {pl.name}
                    </span>
                    <span className="pl-existing-count">{pl.songIds.length} songs</span>
                    <button className="pl-existing-del" onClick={()=>deletePlaylist(pl.id)} title="Delete">
                      <MdDelete size={15}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ SETTINGS MODAL ═══════════════ */}
      {settingsOpen && (
        <div className="settings-overlay" onClick={()=>setSettingsOpen(false)}>
          <div className="settings-modal" onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div className="settings-header">
              <div className="settings-avatar">{userInitial}</div>
              <div className="settings-title-block">
                <h2 className="settings-title">Settings</h2>
                <p className="settings-sub">{userName} · Free Account</p>
              </div>
              <button className="settings-close" onClick={()=>setSettingsOpen(false)}>
                <MdClose size={22}/>
              </button>
            </div>

            {/* Tab Bar */}
            <div className="settings-tabs">
              {[['account',<MdPerson size={16}/>,'Account'],
                ['audio',<MdVolumeUp size={16}/>,'Audio'],
                ['about',<MdInfo size={16}/>,'About']
              ].map(([id,icon,label])=>(
                <button
                  key={id}
                  className={`settings-tab ${settingsTab===id?'settings-tab-active':''}`}
                  onClick={()=>setSettingsTab(id)}
                >{icon} {label}</button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="settings-body">

              {/* —— ACCOUNT TAB —— */}
              {settingsTab==='account' && (
                <div className="settings-section-group">
                  <div className="settings-section">
                    <h3 className="settings-section-title">Profile</h3>
                    <div className="settings-row">
                      <div className="settings-avatar-lg">{userInitial}</div>
                      <div>
                        <div className="settings-user-name">{userName}</div>
                        <div className="settings-user-email">{storedUser?.email || 'user@moodify.app'}</div>
                        <span className="settings-badge">Free Plan</span>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">Your Stats</h3>
                    <div className="settings-stats">
                      <div className="settings-stat">
                        <span className="stat-val">{songs.length}</span>
                        <span className="stat-lbl">Songs</span>
                      </div>
                      <div className="settings-stat">
                        <span className="stat-val" style={{color:'#e25454'}}>{likedSongs.size}</span>
                        <span className="stat-lbl">Liked</span>
                      </div>
                      <div className="settings-stat">
                        <span className="stat-val">5</span>
                        <span className="stat-lbl">Playlists</span>
                      </div>
                      <div className="settings-stat">
                        <span className="stat-val">Free</span>
                        <span className="stat-lbl">Plan</span>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">Danger Zone</h3>
                    <button className="settings-danger-btn" onClick={()=>{localStorage.clear();window.location.href='/';}}>Log out of Moodify</button>
                  </div>
                </div>
              )}

              {/* —— AUDIO TAB —— */}
              {settingsTab==='audio' && (
                <div className="settings-section-group">
                  <div className="settings-section">
                    <h3 className="settings-section-title">Playback</h3>
                    <div className="settings-toggle-row">
                      <div>
                        <div className="settings-toggle-label">Shuffle</div>
                        <div className="settings-toggle-sub">Play songs in random order</div>
                      </div>
                      <button className={`settings-toggle ${shuffle?'settings-toggle-on':''}`} onClick={()=>setShuffle(s=>!s)}>
                        <span className="settings-toggle-thumb"/>
                      </button>
                    </div>
                    <div className="settings-toggle-row">
                      <div>
                        <div className="settings-toggle-label">Repeat</div>
                        <div className="settings-toggle-sub">Repeat current track</div>
                      </div>
                      <button className={`settings-toggle ${repeat?'settings-toggle-on':''}`} onClick={()=>setRepeat(r=>!r)}>
                        <span className="settings-toggle-thumb"/>
                      </button>
                    </div>
                  </div>
                  <div className="settings-section">
                    <h3 className="settings-section-title">Volume</h3>
                    <div className="settings-vol-row">
                      <MdVolumeUp size={18} style={{color:'var(--muted)',flexShrink:0}}/>
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={volume}
                        onChange={setVol}
                        className="settings-vol-slider"
                        style={{'--vol':`${volume*100}%`}}
                      />
                      <span className="settings-vol-pct">{Math.round(volume*100)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* —— ABOUT TAB —— */}
              {settingsTab==='about' && (
                <div className="settings-section-group">
                  <div className="settings-section">
                    <div className="settings-about-logo">
                      <RiMusicFill size={36}/>
                    </div>
                    <h3 className="settings-about-name">Moodify</h3>
                    <p className="settings-about-desc">Moodify uses AI-powered facial expression detection to analyze your mood in real time and suggest the perfect music playlist — tailored just for you.</p>
                    <div className="settings-about-items">
                      <div className="settings-about-item"><span>Version</span><span>1.0.0</span></div>
                      <div className="settings-about-item"><span>AI Model</span><span>face-api.js</span></div>
                      <div className="settings-about-item"><span>Songs</span><span>{songs.length} tracks</span></div>
                      <div className="settings-about-item"><span>Backend</span><span>Node.js / Express</span></div>
                    </div>
                  </div>
                </div>
              )}

            </div>{/* /settings-body */}
          </div>{/* /settings-modal */}
        </div>
      )}

    </div>
  );
}
