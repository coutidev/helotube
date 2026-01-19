
import React, { useEffect, useState } from 'react';
import { Video, Comment } from '../types';
import { generateVideoComments, generateVideoDescription } from '../services/geminiService';

interface VideoPlayerViewProps {
  video: Video;
  onClose: () => void;
  relatedVideos: Video[];
  onVideoClick: (v: Video) => void;
}

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ video, onClose, relatedVideos, onVideoClick }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [description, setDescription] = useState<string>('Carregando descrição...');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      const [aiComments, aiDescription] = await Promise.all([
        generateVideoComments(video.title),
        generateVideoDescription(video.title)
      ]);
      setComments(aiComments);
      setDescription(aiDescription);
    };
    loadContent();
    window.scrollTo(0, 0);
  }, [video]);

  const handleShare = () => {
    if (!video.videoUrl) return;
    
    // Gerar link compatível com Vercel ou Localhost
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?vurl=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}&vert=${video.isVertical}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  return (
    <div className="pt-16 pb-10 px-4 md:px-8 max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className={`w-full bg-black rounded-xl overflow-hidden shadow-2xl ${video.isVertical ? 'max-w-[400px] mx-auto aspect-[9/16]' : 'aspect-video'}`}>
           <video 
             key={video.videoUrl}
             src={video.videoUrl} 
             controls 
             autoPlay 
             className="w-full h-full object-contain"
           />
        </div>

        <h1 className="text-xl font-bold mt-4 mb-2">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <img src={video.channelAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div className="flex flex-col">
              <span className="font-bold">{video.channelName}</span>
              <span className="text-xs text-gray-400">1.2M inscritos</span>
            </div>
            <button className="bg-white text-black px-4 py-2 rounded-full font-bold ml-4 hover:bg-zinc-200 transition-colors">Inscrever-se</button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className={`flex items-center gap-2 ${copySuccess ? 'bg-green-600' : 'bg-[#272727]'} px-6 py-2 rounded-full hover:bg-[#3f3f3f] transition-all font-bold text-sm`}
            >
              {copySuccess ? (
                <>
                  <svg className="w-5 h-5 fill-white animate-bounce" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  LINK COPIADO!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M11.733 8.267L11.733 3L21 11.133L11.733 19.267L11.733 14C5.133 14 1.467 18.267 1.467 22.8C2.8 16.533 6.667 10.267 11.733 8.267Z"/>
                  </svg>
                  COMPARTILHAR
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#272727] rounded-xl p-4 mt-4 transition-all">
          <div className="text-sm font-bold mb-1">{video.views} • {video.postedAt}</div>
          <div className={`text-sm whitespace-pre-wrap leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>{description}</div>
          <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-2 text-sm font-black text-white hover:underline">
            {isDescriptionExpanded ? 'Mostrar menos' : '...mais'}
          </button>
        </div>

        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-bold">{comments.length} Comentários</h3>
          <div className="flex gap-4 items-center mb-6">
             <img src={video.channelAvatar} className="w-10 h-10 rounded-full" alt="" />
             <input type="text" placeholder="Adicione um comentário..." className="bg-transparent border-b border-zinc-700 w-full py-2 outline-none focus:border-white transition-colors text-sm" />
          </div>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 animate-fade-in">
              <img src={comment.avatar} className="w-10 h-10 rounded-full" alt="" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">{comment.author}</span>
                  <span className="text-[10px] text-gray-500">{comment.time}</span>
                </div>
                <p className="text-sm leading-relaxed">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1 cursor-pointer">
                      <svg className="w-4 h-4 fill-zinc-400" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                      <span className="text-[10px] text-zinc-400">{comment.likes}</span>
                   </div>
                   <svg className="w-4 h-4 fill-zinc-400 cursor-pointer" viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L8.83 23l6.59-6.59c.37-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-black text-zinc-500 text-[10px] tracking-widest mb-2 uppercase">Próximos Vídeos</h3>
        {relatedVideos.map((v) => (
          <div key={v.id} className="flex gap-3 cursor-pointer group" onClick={() => onVideoClick(v)}>
            <div className={`relative flex-shrink-0 ${v.isVertical ? 'w-24 aspect-[9/16]' : 'w-44 aspect-video'} rounded-lg overflow-hidden bg-zinc-800`}>
              <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
              <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 rounded font-bold text-blue-400">4K</div>
            </div>
            <div className="flex flex-col gap-1 py-1">
              <h4 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{v.title}</h4>
              <p className="text-[10px] text-zinc-500 font-medium">{v.channelName}</p>
              <p className="text-[10px] text-zinc-500">{v.views} • {v.postedAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayerView;
