
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import { Video } from './types';
import { uploadVideoToCloudinary, checkIsVertical } from './services/cloudinaryService';

// ============================================================
// ✅ CONFIGURAÇÃO - MODO ETERNO ATIVADO
// ============================================================
const CLOUDINARY_CLOUD_NAME: string = 'dxhqim1nl'; 
const CLOUDINARY_UPLOAD_PRESET: string = 'k5p9p5ui';
// ============================================================

const MICKEY_AVATAR = 'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png';

const INITIAL_VIDEOS: Video[] = [
  {
    id: 'demo-1',
    title: 'VLOG COM SAUDADE DO MOR #01',
    thumbnail: 'https://images.unsplash.com/photo-1516715094483-75da7dee9758?q=80&w=600&auto=format&fit=crop',
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
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'shorts'>('home');
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [lastUploadedVideo, setLastUploadedVideo] = useState<Video | null>(null);

  const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME !== 'seu_cloud_name' && CLOUDINARY_UPLOAD_PRESET !== 'seu_upload_preset';

  useEffect(() => {
    // 1. Carregar vídeos salvos no navegador do Nicolas
    const saved = localStorage.getItem('helotube_videos');
    let baseVideos = saved ? JSON.parse(saved) : INITIAL_VIDEOS;

    // 2. Verificar se a Helo recebeu um link especial
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('vurl');
    
    if (sharedUrl) {
      const sharedVideo: Video = {
        id: 'shared-' + Date.now(),
        title: decodeURIComponent(params.get('title') || 'VLOG COM SAUDADE DO MOR #01'),
        thumbnail: 'https://images.unsplash.com/photo-1518197146369-0115994ca759?q=80&w=1000&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'exclusivo para você',
        duration: 'NOVO',
        videoUrl: decodeURIComponent(sharedUrl),
        description: '❤️ Oi Helo! Este vídeo foi feito com muito carinho e postado no HeloTube só para você. Clique para assistir!',
        isVertical: params.get('vert') === 'true'
      };
      
      // Coloca o vídeo compartilhado no topo da lista
      setVideos([sharedVideo, ...baseVideos.filter((v: Video) => v.id !== 'demo-1')]);
      
      // Remove os parâmetros da URL para ficar limpo, mas NÃO abre o player automático
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setVideos(baseVideos);
    }
  }, []);

  useEffect(() => {
    if (videos.length > 0 && videos[0].id !== 'demo-1' && !videos[0].id.startsWith('shared-')) {
      localStorage.setItem('helotube_videos', JSON.stringify(videos));
    }
  }, [videos]);

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
        duration: '☁️ NUVEM',
        videoUrl: finalUrl,
        description: '✅ Este vídeo foi postado no HeloTube com sucesso!',
        isVertical: isVertical
      };

      setVideos([newVideo, ...videos.filter(v => v.id !== 'demo-1')]);
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      setLastUploadedVideo(newVideo);
      // Aqui o Nicolas vê o vídeo abrir na hora pra conferir
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
      alert("✅ LINK COPIADO! Mande no WhatsApp da Helo. Ela vai ver o vídeo na Home e clicar para assistir!");
    } else {
      const tempInput = document.createElement("input");
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      alert("✅ LINK COPIADO! Mande para a Helo!");
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
            {/* Categorias discretas */}
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar sticky top-14 bg-[#0f0f0f] z-30 pt-2">
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

            {/* Grid de Vídeos - Onde ela vai clicar! */}
            <div className={`grid gap-x-4 gap-y-10 mt-4 ${sidebarSection === 'shorts' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {videos
                .filter(v => sidebarSection === 'shorts' ? v.isVertical : true)
                .map((video) => (
                  <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
              ))}
            </div>
            
            {videos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <p className="text-lg">Tudo pronto! Use o botão Upload para começar.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AVISO DE SUCESSO DO NICOLAS */}
      {lastUploadedVideo && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1e1e1e] p-10 rounded-[3rem] border border-pink-500/30 text-center max-w-md shadow-[0_0_80px_-20px_rgba(236,72,153,0.4)]">
            <div className="text-7xl mb-6">🤩</div>
            <h2 className="text-2xl font-black mb-3 uppercase italic tracking-tighter">VÍDEO PRONTO!</h2>
            <p className="text-zinc-400 mb-8 px-4 leading-relaxed">Agora copie o link abaixo. Quando a Helo abrir, o vídeo vai aparecer na tela inicial para ela clicar!</p>
            <button 
              onClick={() => copyHeloLink(lastUploadedVideo)}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 py-5 rounded-full font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-pink-600/30 mb-4"
            >
              COPIAR LINK ESPECIAL
            </button>
            <button onClick={() => setLastUploadedVideo(null)} className="text-zinc-500 text-xs font-bold hover:text-white transition-colors">Fechar aviso</button>
          </div>
        </div>
      )}

      {/* MODAL DE UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#181818] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#212121]">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">UPLOAD HELOTUBE</h2>
              <button onClick={() => !uploadProgress && setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8">
              <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-8 bg-[#0f0f0f]">
                {uploadProgress !== null ? (
                  <div className="w-full text-center">
                    <p className="text-base font-black mb-6 uppercase tracking-[0.2em] animate-pulse text-pink-500">
                      SUBINDO... {uploadProgress}%
                    </p>
                    <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-600 to-red-600" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <p className="font-black text-xl tracking-tight uppercase">Escolha o vídeo</p>
                      <p className="text-zinc-500 text-sm">O vídeo que você gravou em pé.</p>
                    </div>
                    <label className="font-black py-5 px-12 rounded-full cursor-pointer bg-white text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/10 text-sm tracking-widest">
                      SELECIONAR
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
