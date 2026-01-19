
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import { Video } from './types';
import { uploadVideoToCloudinary, checkIsVertical } from './services/cloudinaryService';

// SUBSTITUA PELOS SEUS DADOS DO CLOUDINARY PARA FUNCIONAR REAL
const CLOUDINARY_CLOUD_NAME = 'seu_cloud_name'; 
const CLOUDINARY_UPLOAD_PRESET = 'seu_upload_preset';

const MICKEY_AVATAR = 'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png';

const INITIAL_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'VLOG COM SAUDADE DO MOR #01',
    thumbnail: 'https://picsum.photos/seed/vlog1/400/711',
    channelName: 'nicolas couti thibes',
    channelAvatar: MICKEY_AVATAR,
    views: '1.5k visualizações',
    postedAt: 'há 2 horas',
    duration: '0:45',
    description: 'Gente, fiz esse vídeo porque sou completamente apaixonado por ela e estava morrendo de saudades! ❤️🥺 Um vlog real pra mostrar o que tô sentindo e como ela faz falta.',
    isVertical: true
  },
  {
    id: 'meme-virginia',
    title: 'TESTANDO A BASE DA VIRGINIA DE 200 REAIS (CHOQUEI) 😱',
    thumbnail: 'https://picsum.photos/seed/virginia/1280/720',
    channelName: 'Dicas da Helo',
    channelAvatar: 'https://i.pravatar.cc/150?u=beauty',
    views: '890k visualizações',
    postedAt: 'há 1 dia',
    duration: '15:30',
    description: 'Genteeee, será que vale tudo isso mesmo? Testei a base que todo mundo tá falando kkkk #virginia #wepink #meme'
  }
];

const CATEGORIES = ["Tudo", "Memes", "Virginia", "BBB", "TikTok", "Ao vivo", "Podcasts"];

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'shorts'>('home');

  // Lógica de Deep Linking: Se a URL tiver parâmetros de vídeo, carrega ele
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('vurl');
    const sharedTitle = params.get('title');
    const sharedIsVertical = params.get('vert') === 'true';

    if (sharedUrl && sharedTitle) {
      const sharedVideo: Video = {
        id: 'shared-' + Date.now(),
        title: decodeURIComponent(sharedTitle),
        thumbnail: sharedIsVertical ? 'https://picsum.photos/seed/share/400/711' : 'https://picsum.photos/seed/share/1280/720',
        channelName: 'Vídeo Compartilhado',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'agora',
        duration: '4K',
        videoUrl: decodeURIComponent(sharedUrl),
        description: 'Este vídeo foi compartilhado com você via HeloTube!',
        isVertical: sharedIsVertical
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
      
      // Se as chaves do Cloudinary estiverem preenchidas, faz o upload real
      if (CLOUDINARY_CLOUD_NAME !== 'seu_cloud_name') {
        const result = await uploadVideoToCloudinary(
          file, 
          CLOUDINARY_CLOUD_NAME, 
          CLOUDINARY_UPLOAD_PRESET, 
          (p) => setUploadProgress(p)
        );
        finalUrl = result.secure_url;
      } else {
        // Simulação se não tiver chaves
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(r => setTimeout(r, 150));
        }
      }

      const newVideo: Video = {
        id: Date.now().toString(),
        title: file.name.split('.')[0].toUpperCase() + ' (4K)',
        thumbnail: isVertical ? 'https://picsum.photos/seed/v/400/711' : 'https://picsum.photos/seed/h/1280/720',
        channelName: 'nicolas couti thibes',
        channelAvatar: MICKEY_AVATAR,
        views: '0 visualizações',
        postedAt: 'agora mesmo',
        duration: '4K',
        videoUrl: finalUrl,
        description: `Vídeo enviado via HeloTube.`,
        isVertical: isVertical
      };

      setVideos([newVideo, ...videos]);
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      setSelectedVideo(newVideo);
    } catch (error) {
      alert('Erro no upload. Verifique as chaves do Cloudinary.');
      setUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} onHomeClick={() => setSelectedVideo(null)} />
      
      {!selectedVideo && (
        <Sidebar 
          activeSection={sidebarSection}
          onHomeClick={() => { setSelectedVideo(null); setSidebarSection('home'); }}
          onShortsClick={() => { setSelectedVideo(null); setSidebarSection('shorts'); }}
        />
      )}

      <main className={`${selectedVideo ? '' : 'sm:pl-18 md:pl-60'} pt-14`}>
        {selectedVideo ? (
          <VideoPlayerView 
            video={selectedVideo} 
            onClose={() => setSelectedVideo(null)} 
            relatedVideos={videos.filter(v => v.id !== selectedVideo.id)}
            onVideoClick={(v) => setSelectedVideo(v)}
          />
        ) : (
          <div className="p-4 md:p-6">
            <div className={`grid gap-x-4 gap-y-10 ${sidebarSection === 'shorts' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {videos.filter(v => sidebarSection === 'shorts' ? v.isVertical : true).map((video) => (
                <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
              ))}
            </div>
          </div>
        )}
      </main>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#212121] w-full max-w-xl rounded-3xl p-8 border border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic tracking-tighter">HELOTUBE UPLOAD</h2>
              <button onClick={() => !uploadProgress && setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="border-4 border-dashed border-blue-600/30 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 bg-[#181818]">
               {uploadProgress !== null ? (
                 <div className="w-full text-center">
                    <p className="text-xl font-bold text-white mb-2">Subindo para a nuvem... {uploadProgress}%</p>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-4">
                       <div className="bg-blue-500 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="text-center">
                     <p className="text-xl font-bold">Arraste seu vídeo 4K aqui</p>
                     <p className="text-sm text-zinc-400 mt-2">Vídeos em pé serão salvos como Shorts!</p>
                   </div>
                   <label className="bg-white text-black font-black py-4 px-10 rounded-full cursor-pointer hover:scale-105 transition-transform">
                      ESCOLHER VÍDEO
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
