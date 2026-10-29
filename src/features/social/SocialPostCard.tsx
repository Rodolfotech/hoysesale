'use client';

import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import type { SocialPost } from '../../types';

interface SocialPostCardProps {
  post: SocialPost;
}

export function SocialPostCard({ post }: SocialPostCardProps) {
  const { isAuthenticated } = useAuth();

  const handleInstagramClick = () => {
    if (isAuthenticated && post.permalink) {
      adminApi.trackInstagramClick().catch(() => {});
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden group">
      {post.media_url && (
        <div className="aspect-2/3 overflow-hidden">
          <img
            src={post.media_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4">
        {post.caption && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-3">{post.caption}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {format(new Date(post.timestamp), "dd MMM yyyy", { locale: es })}
          </span>
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInstagramClick}
              className="flex items-center gap-1 text-xs text-neon-cyan hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Ver en Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
