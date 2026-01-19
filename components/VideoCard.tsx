
import React from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div className="flex flex-col gap-3 cursor-pointer group" onClick={onClick}>
      <div className={`relative ${video.isVertical ? 'aspect-[9/16] max-w-[240px] mx-auto' : 'aspect-video'} overflow-hidden rounded-xl bg-[#272727]`}>
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 flex gap-1 items-center">
          <div className="bg-blue-600 text-white text-[10px] px-1 rounded font-bold">
            4K
          </div>
          <div className="bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {video.duration}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <img src={video.channelAvatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug group-hover:text-gray-200">
            {video.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            {video.channelName}
            <svg className="w-3 h-3 fill-gray-400" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM10 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/></svg>
          </p>
          <p className="text-gray-400 text-xs">
            {video.views} • {video.postedAt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
