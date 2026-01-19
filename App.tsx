
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import { Video } from './types';
import { uploadVideoToCloudinary, checkIsVertical } from './services/cloudinaryService';

// ============================================================
// ✅ CONFIGURAÇÃO ATUALIZADA - MODO ETERNO ATIVADO
// ============================================================
const CLOUDINARY_CLOUD_NAME: string = 'dxhqim1nl'; 
const CLOUDINARY_UPLOAD_PRESET: string = 'k5p9p5ui';
// ============================================================

const MICKEY_AVATAR = 'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png';

const INITIAL_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'VLOG COM SAUDADE DO MOR #01',
    thumbnail: 'https://images.unsplash.com/photo-1518197146369-0115994ca759?q=80&w=400&h=711&auto=format&fit=crop',
    channelName: 'nicolas couti thibes',
    channelAvatar: MICKEY_AVATAR,
    views: '1.5k visualizações',
    postedAt: 'há 2 horas',
    duration: '0:45',
    description: 'Gente, fiz esse vídeo porque sou completamente apaixonado por ela e estava morrendo de saudades! ❤️🥺',
    isVertical: true
  }
];

const CATEGORIES = ["Tudo", "Shorts", "Música", "Mixes", "Ao vivo", "Gaming", "Notícias"];

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'shorts'>('home');
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [lastUploadedVideo, setLastUploadedVideo] = useState<Video | null>(null);

  const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME !== 'seu_cloud_name' && CLOUDINARY_UPLOAD_PRESET !== 'seu_upload_preset';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('vurl');
    if (sharedUrl) {
      const sharedVideo: Video = {
        id: 'shared-' + Date.now(),
        title: decodeURIComponent(params.get('title') || 'Vídeo Especial para Você'),
        thumbnail: 'https://images.unsplash.com/photo-1518197146369-0115994ca759?q=80&w=1000&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'exclusivo',
        duration: 'ETERNO',
        videoUrl: decodeURIComponent(sharedUrl),
        description: '❤️ Este vídeo foi feito com muito carinho e postado no HeloTube para você ver sempre que sentir saudades.',
        isVertical: params.get('vert') === 'true'
      };
      setSelectedVideo(sharedVideo);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const isVertical = await checkIsVertical(file);
      let finalUrl = '';
      
      if (isCloudinaryConfigured) {
        const result = await uploadVideoToCloudinary(file, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, setUploadProgress);
        finalUrl = result.secure_url;
      } else {
        finalUrl = URL.createObjectURL(file);
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(r => setTimeout(r, 100));
        }
      }

      const newVideo: Video = {
        id: Date.now().toString(),
        title: file.name.split('.')[0].toUpperCase(),
        thumbnail: isVertical 
          ? 'https://images.unsplash.com/photo-1551817670-49658e4587ba?q=80&w=400&h=711&auto=format&fit=crop' 
          : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280&h=720&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'agora mesmo',
        duration: isCloudinaryConfigured ? '☁️ NUVEM' : '📁 LOCAL',
        videoUrl: finalUrl,
        description: isCloudinaryConfigured 
          ? '✅ SUCESSO! Este vídeo está na nuvem. Clique em COPIAR LINK para ela ver no celular dela.' 
          : '⚠️ AVISO: Este vídeo é local. Para ele ser eterno, configure o Cloudinary.',
        isVertical: isVertical
      };

      setVideos([newVideo, ...videos]);
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      setLastUploadedVideo(newVideo);
      setSelectedVideo(newVideo);
    } catch (error: any) {
      alert(`ERRO NO UPLOAD: ${error.message}`);
      setUploadProgress(null);
    }
  };

  const copyHeloLink = (video: Video) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?vurl=${encodeURIComponent(video.videoUrl || '')}&title=${encodeURIComponent(video.title)}&vert=${video.isVertical}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      alert("✅ LINK COPIADO! Agora mande no WhatsApp da Helo!");
    } else {
      alert("Link para copiar:\n\n" + shareUrl);
    }
    setLastUploadedVideo(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-red-500/30">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} onHomeClick={() => setSelectedVideo(null)} />
      
      {!selectedVideo && (
        <Sidebar 
          activeSection={sidebarSection}
          onHomeClick={() => { setSelectedVideo(null); setSidebarSection('home'); }}
          onShortsClick={() => { setSelectedVideo(null); setSidebarSection('shorts'); }}
        />
      )}

      <main className={`${selectedVideo ? '' : 'sm:pl-18 md:pl-60'} pt-14 transition-all duration-300`}>
        {selectedVideo ? (
          <VideoPlayerView 
            video={selectedVideo} 
            onClose={() => setSelectedVideo(null)} 
            relatedVideos={videos.filter(v => v.id !== selectedVideo.id)}
            onVideoClick={(v) => setSelectedVideo(v)}
          />
        ) : (
          <div className="p-4 md:p-6 max-w-[2200px] mx-auto">
            {/* NOVO BANNER DE BOAS-VINDAS PARA FACILITAR O UPLOAD */}
            <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all"></div>
              <div className="z-10 text-center md:text-left">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Olá Nicolas! ❤️</h1>
                <p className="text-zinc-400 text-sm max-w-md">Pronto para surpreender a Helo? Clique no botão ao lado para subir o seu vídeo vertical agora mesmo.</p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="z-10 bg-white text-black px-8 py-4 rounded-full font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14V6zM2 5h16v14H2V5zm18 3h2v10h-2V8z"/></svg>
                FAZER UPLOAD PARA A HELO
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
               {CATEGORIES.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => {
                     setActiveCategory(cat);
                     if (cat === "Shorts") setSidebarSection('shorts');
                     else setSidebarSection('home');
                   }}
                   className={`px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            <div className={`grid gap-x-4 gap-y-10 ${sidebarSection === 'shorts' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {videos
                .filter(v => sidebarSection === 'shorts' ? v.isVertical : true)
                .map((video) => (
                  <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE SUCESSO PÓS-UPLOAD */}
      {lastUploadedVideo && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-pink-500/30 text-center max-w-sm shadow-[0_0_50px_-12px_rgba(236,72,153,0.5)]">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-xl font-black mb-2 uppercase italic">VÍDEO NO AR!</h2>
            <p className="text-zinc-400 text-sm mb-6">Seu vídeo foi postado. Agora é só pegar o link e mandar para ela!</p>
            <button 
              onClick={() => copyHeloLink(lastUploadedVideo)}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 py-4 rounded-full font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-pink-600/20"
            >
              COPIAR LINK PARA A HELO
            </button>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-[#181818] w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#212121]">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">POSTAR NO HELOTUBE</h2>
              <button onClick={() => !uploadProgress && setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8">
              <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${isCloudinaryConfigured ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${isCloudinaryConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isCloudinaryConfigured ? 'text-green-500' : 'text-red-500'}`}>
                      {isCloudinaryConfigured ? 'Nuvem Conectada' : 'Modo Temporário'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-6 bg-[#0f0f0f] border-zinc-800">
                {uploadProgress !== null ? (
                  <div className="w-full text-center">
                    <p className="text-sm font-black mb-4 uppercase tracking-[0.2em] animate-pulse text-pink-500">
                      SUBINDO... {uploadProgress}%
                    </p>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-600" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <p className="font-black text-lg tracking-tight uppercase">Vídeo do Mor</p>
                    </div>
                    <label className="font-black py-4 px-10 rounded-full cursor-pointer bg-white text-black hover:bg-zinc-200">
                      ESCOLHER VÍDEO
                      <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
