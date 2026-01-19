
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import { Video } from './types';
import { uploadVideoToCloudinary, checkIsVertical } from './services/cloudinaryService';

// ============================================================
// ✅ CONFIGURAÇÃO CLOUDINARY
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
    description: 'Fiz esse vídeo porque estou morrendo de saudades! ❤️🥺',
    isVertical: true
  }
];

const CATEGORIES = ["Tudo", "Shorts", "Música", "Mixes", "Ao vivo", "Gaming"];

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'shorts'>('home');
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [lastUploadedVideo, setLastUploadedVideo] = useState<Video | null>(null);

  useEffect(() => {
    // 1. Carrega vídeos salvos localmente
    const saved = localStorage.getItem('helotube_videos');
    let baseVideos = saved ? JSON.parse(saved) : INITIAL_VIDEOS;

    // 2. Lógica para o Link da Helo
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('vurl');
    
    if (sharedUrl) {
      const sharedVideo: Video = {
        id: 'shared-' + Date.now(),
        title: decodeURIComponent(params.get('title') || 'VLOG COM SAUDADE DO MOR #01'),
        thumbnail: params.get('vert') === 'true' 
          ? 'https://images.unsplash.com/photo-1551817670-49658e4587ba?q=80&w=400&h=711&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1518197146369-0115994ca759?q=80&w=1000&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'exclusivo para você',
        duration: 'NOVO',
        videoUrl: decodeURIComponent(sharedUrl),
        description: '❤️ Oi Helo! Este vídeo foi feito especialmente para você. Clique na imagem para assistir!',
        isVertical: params.get('vert') === 'true'
      };
      
      // Coloca o vídeo compartilhado no topo da lista para ela clicar na home
      setVideos([sharedVideo, ...baseVideos.filter((v: Video) => v.id !== 'demo-1')]);
      
      // Limpa a URL para ficar estética
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setVideos(baseVideos);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const isVertical = await checkIsVertical(file);
      
      // Tentativa de upload para o Cloudinary
      const result = await uploadVideoToCloudinary(
        file, 
        CLOUDINARY_CLOUD_NAME, 
        CLOUDINARY_UPLOAD_PRESET, 
        (p) => setUploadProgress(p)
      );

      const newVideo: Video = {
        id: 'vid-' + Date.now(),
        title: 'VLOG COM SAUDADE DO MOR #01',
        thumbnail: isVertical 
          ? 'https://images.unsplash.com/photo-1551817670-49658e4587ba?q=80&w=400&h=711&auto=format&fit=crop' 
          : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280&h=720&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '0 visualizações',
        postedAt: 'agora mesmo',
        duration: 'HD',
        videoUrl: result.secure_url,
        description: '✅ Vídeo postado com sucesso! Mande o link para a Helo.',
        isVertical: isVertical
      };

      const updatedVideos = [newVideo, ...videos.filter(v => v.id !== 'demo-1')];
      setVideos(updatedVideos);
      localStorage.setItem('helotube_videos', JSON.stringify(updatedVideos));
      
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      setLastUploadedVideo(newVideo);
      setSelectedVideo(newVideo); // Abre para o Nicolas ver
    } catch (error: any) {
      console.error(error);
      alert(`ERRO NO UPLOAD: ${error.message}\n\nDica: Se o erro persistir mesmo sendo Unsigned, pode ser um bloqueador de anúncios (AdBlock) no seu navegador ou o Cloud Name errado.`);
      setUploadProgress(null);
    }
  };

  const copyHeloLink = (video: Video) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?vurl=${encodeURIComponent(video.videoUrl || '')}&title=${encodeURIComponent(video.title)}&vert=${video.isVertical}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    alert("✅ LINK COPIADO! Agora mande para a Helo. Ela vai ver o seu vídeo na página inicial do HeloTube e clicar para assistir!");
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
            {/* Categorias Discretas */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar sticky top-14 bg-[#0f0f0f] z-30 pt-2">
               {CATEGORIES.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            {/* Grid de Vídeos - Sem mensagens chatas de postar */}
            <div className={`grid gap-x-4 gap-y-10 mt-6 ${sidebarSection === 'shorts' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {videos
                .filter(v => sidebarSection === 'shorts' ? v.isVertical : true)
                .map((video) => (
                  <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
              ))}
            </div>
            
            {videos.length === 0 && (
              <div className="flex items-center justify-center py-40 opacity-20">
                <p className="text-xl font-black italic uppercase">HeloTube</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE SUCESSO - PÓS UPLOAD */}
      {lastUploadedVideo && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1e1e1e] p-8 rounded-[2rem] border border-pink-500/30 text-center max-w-sm shadow-2xl">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-xl font-black mb-2 uppercase tracking-tighter">VÍDEO NO AR!</h2>
            <p className="text-zinc-400 text-sm mb-6">Mande o link para a Helo. Ela verá o seu vídeo lá na página inicial.</p>
            <button 
              onClick={() => copyHeloLink(lastUploadedVideo)}
              className="w-full bg-white text-black py-4 rounded-full font-black text-xs tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
            >
              COPIAR LINK ESPECIAL
            </button>
            <button onClick={() => setLastUploadedVideo(null)} className="mt-4 text-zinc-500 text-[10px] font-bold uppercase hover:text-white">Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL DE UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#181818] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#212121]">
              <h2 className="text-lg font-black uppercase italic tracking-tighter">UPLOAD HELOTUBE</h2>
              <button onClick={() => !uploadProgress && setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8">
              <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 bg-[#0f0f0f]">
                {uploadProgress !== null ? (
                  <div className="w-full text-center">
                    <p className="text-sm font-black mb-4 uppercase text-pink-500 animate-pulse">CARREGANDO... {uploadProgress}%</p>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-6 rounded-full bg-pink-500/5 text-pink-600">
                      <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24"><path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14V6zM2 5h16v14H2V5zm18 3h2v10h-2V8z"/></svg>
                    </div>
                    <p className="text-zinc-500 text-center text-sm">Selecione o vídeo do seu celular.</p>
                    <label className="font-black py-4 px-10 rounded-full cursor-pointer bg-white text-black hover:bg-zinc-200 transition-all text-xs tracking-widest active:scale-95">
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
