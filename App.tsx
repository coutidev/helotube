
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import { Video } from './types';
import { uploadVideoToCloudinary, checkIsVertical } from './services/cloudinaryService';

const CLOUDINARY_CLOUD_NAME = 'seu_cloud_name'; 
const CLOUDINARY_UPLOAD_PRESET = 'seu_upload_preset';
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
  },
  {
    id: 'meme-virginia',
    title: 'TESTANDO A BASE DA VIRGINIA DE 200 REAIS (CHOQUEI) 😱',
    thumbnail: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1280&h=720&auto=format&fit=crop',
    channelName: 'Dicas da Helo',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helo',
    views: '890k visualizações',
    postedAt: 'há 1 dia',
    duration: '15:30',
    description: 'Genteeee, será que vale tudo isso mesmo? Testei a base que todo mundo tá falando kkkk #virginia #wepink'
  }
];

const CATEGORIES = ["Tudo", "Shorts", "Mixes", "Música", "Ao vivo", "Gaming", "Notícias"];

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'shorts'>('home');
  const [activeCategory, setActiveCategory] = useState("Tudo");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('vurl');
    if (sharedUrl) {
      const sharedVideo: Video = {
        id: 'shared-' + Date.now(),
        title: decodeURIComponent(params.get('title') || 'Vídeo Compartilhado'),
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
        channelName: 'HeloTube Link',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'agora',
        duration: '4K',
        videoUrl: decodeURIComponent(sharedUrl),
        description: 'Vídeo compartilhado via HeloTube.',
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
      let finalUrl = URL.createObjectURL(file);
      
      if (CLOUDINARY_CLOUD_NAME !== 'seu_cloud_name') {
        const result = await uploadVideoToCloudinary(file, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, setUploadProgress);
        finalUrl = result.secure_url;
      } else {
        // Simulação de progresso para vídeos locais
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
        channelName: 'nicolas couti thibes',
        channelAvatar: MICKEY_AVATAR,
        views: '0 visualizações',
        postedAt: 'agora mesmo',
        duration: 'NOVO',
        videoUrl: finalUrl,
        description: `Vídeo gravado e enviado para o HeloTube!`,
        isVertical: isVertical
      };

      setVideos([newVideo, ...videos]);
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      setSelectedVideo(newVideo);
    } catch (error) {
      alert('Erro no upload.');
      setUploadProgress(null);
    }
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
            <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
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

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#212121] w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight">Postar no HeloTube</h2>
              <button onClick={() => !uploadProgress && setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-[#181818] hover:border-red-500/50 transition-colors group">
               {uploadProgress !== null ? (
                 <div className="w-full text-center py-4">
                    <p className="text-sm font-bold text-red-500 mb-4 uppercase tracking-widest animate-pulse">Carregando vídeo: {uploadProgress}%</p>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="bg-[#272727] p-5 rounded-full group-hover:scale-110 transition-transform">
                     <svg className="w-10 h-10 fill-red-600" viewBox="0 0 24 24"><path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14V6zM2 5h16v14H2V5zm18 3h2v10h-2V8z"/></svg>
                   </div>
                   <div className="text-center">
                     <p className="font-bold">Selecione seu vídeo em pé</p>
                     <p className="text-xs text-zinc-500 mt-1">Ele aparecerá na seção de Shorts automaticamente!</p>
                   </div>
                   <label className="bg-white text-black font-black py-3 px-8 rounded-full cursor-pointer hover:bg-zinc-200 active:scale-95 transition-all text-sm mt-2">
                      ESCOLHER VÍDEO DO CELULAR
                      <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                   </label>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
