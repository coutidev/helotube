
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayerView from './components/VideoPlayerView';
import { Video } from './types';
import { uploadVideoToCloudinary, checkIsVertical } from './services/cloudinaryService';

// Configurações do Nicolas (Opcional se usar YouTube)
const CLOUDINARY_CLOUD_NAME = 'dxhqim1nl'; 
const CLOUDINARY_UPLOAD_PRESET = 'k5p9p5ui';

const MICKEY_AVATAR = 'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png';

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'shorts'>('home');
  const [pastedUrl, setPastedUrl] = useState('');
  const [lastUploadedVideo, setLastUploadedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('helotube_videos');
    if (saved) setVideos(JSON.parse(saved));

    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('vurl');
    if (sharedUrl) {
      const isYT = sharedUrl.includes('youtube.com') || sharedUrl.includes('youtu.be');
      const sharedVideo: Video = {
        id: 'shared-' + Date.now(),
        title: decodeURIComponent(params.get('title') || 'VÍDEO ESPECIAL'),
        thumbnail: 'https://images.unsplash.com/photo-1551817670-49658e4587ba?q=80&w=400&h=711&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '1 visualização',
        postedAt: 'exclusivo',
        duration: 'HD',
        videoUrl: decodeURIComponent(sharedUrl),
        description: '❤️ Para Helo.',
        isVertical: params.get('vert') === 'true',
        isYouTube: isYT
      };
      setSelectedVideo(sharedVideo);
    }
  }, []);

  const finalizeVideo = (url: string) => {
    let cleanUrl = url.trim().replace(/["']/g, "");
    const isYT = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
    
    // Se for YouTube, tentamos pegar a thumbnail do YT
    let thumb = 'https://images.unsplash.com/photo-1551817670-49658e4587ba?q=80&w=400&h=711&auto=format&fit=crop';
    if (isYT) {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = cleanUrl.match(regExp);
      if (match && match[2].length === 11) {
        thumb = `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
      }
    }

    const newVideo: Video = {
      id: 'vid-' + Date.now(),
      title: 'VLOG PARA HELO ❤️',
      thumbnail: thumb,
      channelName: 'Nicolas & Helo',
      channelAvatar: MICKEY_AVATAR,
      views: '0 visualizações',
      postedAt: 'agora mesmo',
      duration: isYT ? 'YT' : '4K',
      videoUrl: cleanUrl,
      description: 'Vídeo enviado com muito carinho através do HeloTube.',
      isVertical: true, // A maioria dos vídeos de celular são verticais
      isYouTube: isYT
    };

    const updated = [newVideo, ...videos];
    setVideos(updated);
    localStorage.setItem('helotube_videos', JSON.stringify(updated));
    
    setIsUploadModalOpen(false);
    setLastUploadedVideo(newVideo);
    setSelectedVideo(newVideo);
    setPastedUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert("🚨 ESSE VÍDEO É GIGANTE (900MB)!\n\nNenhum site aceita esse tamanho direto. Por favor:\n1. Suba o vídeo no YouTube (como não listado).\n2. Cole o link do YouTube aqui no HeloTube.\n\nÉ a única forma de funcionar!");
      return;
    }

    try {
      setUploadProgress(1);
      const isVertical = await checkIsVertical(file);
      const result = await uploadVideoToCloudinary(file, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, (p) => setUploadProgress(p));
      
      const newVideo: Video = {
        id: 'vid-' + Date.now(),
        title: 'VLOG PARA HELO ❤️',
        thumbnail: isVertical ? 'https://images.unsplash.com/photo-1551817670-49658e4587ba?q=80&w=400&h=711&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280&h=720&auto=format&fit=crop',
        channelName: 'Nicolas & Helo',
        channelAvatar: MICKEY_AVATAR,
        views: '0 visualizações',
        postedAt: 'agora mesmo',
        duration: '4K',
        videoUrl: result.secure_url,
        description: 'Vídeo enviado via Cloudinary.',
        isVertical: isVertical,
        isYouTube: false
      };
      const updated = [newVideo, ...videos];
      setVideos(updated);
      localStorage.setItem('helotube_videos', JSON.stringify(updated));
      setUploadProgress(null);
      setIsUploadModalOpen(false);
      setLastUploadedVideo(newVideo);
      setSelectedVideo(newVideo);
    } catch (err: any) {
      alert("Erro ao subir. Tente usar o link do YouTube!");
      setUploadProgress(null);
    }
  };

  const copyLinkToClipboard = (video: Video) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?vurl=${encodeURIComponent(video.videoUrl || '')}&title=${encodeURIComponent(video.title)}&vert=${video.isVertical}`;
    navigator.clipboard.writeText(shareUrl);
    alert("LINK COPIADO! Mande no WhatsApp da Helo agora!");
    setLastUploadedVideo(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
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
          <div className="p-4 md:p-6 max-w-[2200px] mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar sticky top-14 bg-[#0f0f0f] z-30 pt-2">
               {["Tudo", "Amor", "Vlogs", "Shorts"].map(cat => (
                 <button key={cat} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-[#272727] hover:bg-[#3f3f3f] transition-all">{cat}</button>
               ))}
            </div>

            <div className={`grid gap-x-4 gap-y-10 mt-6 ${sidebarSection === 'shorts' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              {videos.filter(v => sidebarSection === 'shorts' ? v.isVertical : true).map((video) => (
                <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
              ))}
              {videos.length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-600">
                   <p className="text-xl font-black uppercase italic">HeloTube está vazio...</p>
                   <button onClick={() => setIsUploadModalOpen(true)} className="mt-4 text-pink-500 font-bold hover:underline">Clique para postar o vídeo de 900MB!</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* SUCESSO */}
      {lastUploadedVideo && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1e1e1e] p-8 rounded-[2rem] border-2 border-pink-500 text-center max-w-sm shadow-2xl animate-fade-in">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-black mb-2 text-pink-500 italic">CONSEGUIMOS!</h2>
            <p className="text-zinc-400 text-sm mb-6">Seu vídeo de 900MB agora está no HeloTube.</p>
            <button onClick={() => copyLinkToClipboard(lastUploadedVideo)} className="w-full bg-pink-500 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-pink-600">COPIAR LINK DA HELO</button>
          </div>
        </div>
      )}

      {/* MODAL DE UPLOAD - SOLUÇÃO YOUTUBE */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/98 z-[80] flex items-center justify-center p-4">
          <div className="bg-[#181818] w-full max-w-lg rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900">
              <h2 className="text-pink-500 font-black italic uppercase">POSTAR VÍDEO DE 900MB</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-zinc-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-pink-500/10 p-6 rounded-3xl border border-pink-500/30">
                <p className="text-pink-500 font-black text-[10px] uppercase mb-4 tracking-widest">Opção Recomendada para Vídeos Grandes</p>
                <ol className="text-zinc-400 text-xs space-y-3 mb-6 font-medium">
                  <li>1. Suba seu vídeo de 900MB no <b>YouTube</b> (como não listado).</li>
                  <li>2. Copie o link do vídeo do YouTube.</li>
                  <li>3. Cole o link aqui embaixo:</li>
                </ol>
                <input 
                  type="text" 
                  placeholder="Cole o link do YouTube aqui..."
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-sm outline-none focus:border-pink-500 mb-4"
                />
                <button 
                  onClick={() => finalizeVideo(pastedUrl)}
                  disabled={!pastedUrl}
                  className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 disabled:opacity-30"
                >
                  PUBLICAR NO HELOTUBE
                </button>
              </div>

              <div className="text-center">
                <p className="text-zinc-700 text-[9px] font-black uppercase mb-4">Ou tente arquivo pequeno (máx 100MB)</p>
                <label className="inline-block px-8 py-2 rounded-full cursor-pointer bg-zinc-900 text-zinc-500 border border-zinc-800 text-[10px] font-bold">
                  {uploadProgress ? `ENVIANDO ${uploadProgress}%` : 'SUBIR ARQUIVO'}
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
