import { AMENITY_LABELS } from '@/constants/business';
import { Badge } from '../../components/ui/Badge';

// Comodidades del negocio como etiquetas.
export function AmenityList({ amenities, className = 'flex flex-wrap gap-2' }: { amenities: string[]; className?: string }) {
  return (
    <ul className={className} aria-label="Comodidades">
      {amenities.map((a) => (
        <li key={a}><Badge tone="brand">{AMENITY_LABELS[a] ?? a}</Badge></li>
      ))}
    </ul>
  );
}
