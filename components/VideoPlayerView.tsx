
import React, { useEffect, useState } from 'react';
import { Video } from '../types';

interface VideoPlayerViewProps {
  video: Video;
  onClose: () => void;
  relatedVideos: Video[];
  onVideoClick: (v: Video) => void;
}

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ video, onClose, relatedVideos, onVideoClick }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
  }, [video]);

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
  };

  return (
    <div className="pt-16 pb-10 px-4 md:px-8 max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2">
        <div className={`relative w-full bg-black rounded-xl overflow-hidden shadow-2xl ${video.isVertical ? 'max-w-[380px] mx-auto aspect-[9/16]' : 'aspect-video'}`}>
           {video.isYouTube ? (
             <iframe
               src={getYouTubeEmbedUrl(video.videoUrl || '')}
               className="w-full h-full"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             ></iframe>
           ) : (
             <>
               {loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                    <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-zinc-500 font-black text-[10px] uppercase">Processando vídeo de 900MB...</p>
                 </div>
               )}
               <video 
                 key={video.videoUrl}
                 src={video.videoUrl} 
                 controls 
                 autoPlay 
                 onLoadedData={() => setLoading(false)}
                 className="w-full h-full object-contain"
               />
             </>
           )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">{video.title}</h1>
          <button onClick={onClose} className="text-zinc-500 text-xs uppercase font-black hover:text-white transition-colors">Fechar X</button>
        </div>

        <div className="flex items-center gap-4 mt-6 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
          <img src={video.channelAvatar} className="w-12 h-12 rounded-full border border-pink-500/20 shadow-lg" alt="" />
          <div className="flex-1">
            <p className="font-black text-sm">Nicolas & Helo</p>
            <p className="text-zinc-500 text-xs italic">Um vídeo especial para você</p>
          </div>
          <div className="bg-pink-600 text-white px-6 py-2 rounded-full font-black text-xs">V.I.P</div>
        </div>

        <div className="mt-6 p-6 bg-zinc-900/30 rounded-2xl text-sm text-zinc-400 leading-relaxed border border-white/5">
          {video.description}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Outros Vídeos</p>
        {relatedVideos.map((v) => (
          <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => onVideoClick(v)}>
            <div className={`relative flex-shrink-0 ${v.isVertical ? 'w-20 aspect-[9/16]' : 'w-32 aspect-video'} rounded-lg overflow-hidden bg-zinc-800`}>
              <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-xs font-bold line-clamp-2 group-hover:text-pink-500 transition-colors">{v.title}</h4>
              <p className="text-[10px] text-zinc-500 mt-1">Canal Nicolas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayerView;
