'use client';

import type { Event } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { EventDetailContent } from './EventDetailContent';

interface Props {
  slug: string;
  onClose: () => void;
  initialEvent?: Event;
}

export function EventDetailModal({ slug, onClose, initialEvent }: Props) {
  return (
    <Modal isOpen onClose={onClose} maxWidth="4xl">
      <EventDetailContent slug={slug} initialEvent={initialEvent} />
    </Modal>
  );
}
