'use client';

import type { SocialPost } from '../../types';

interface Props {
  post: SocialPost;
  className?: string;
  onImageError?: () => void;
}

export function SocialPostMedia({ post, className = 'w-full h-full object-cover', onImageError }: Props) {
  if (!post.media_url) return null;

  if (post.media_type === 'VIDEO') {
    return (
      <video
        src={post.media_url}
        poster={post.thumbnail_url || undefined}
        muted
        playsInline
        loop
        controls={false}
        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
        onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
        className={className}
        style={{ display: 'block' }}
      />
    );
  }

  return (
    <img
      src={post.media_url}
      alt=""
      className={className}
      onError={onImageError}
    />
  );
}
