import { permanentRedirect } from 'next/navigation';

// La política de cookies ahora es una sección de la política de privacidad. Se mantiene la URL para enlaces antiguos.
export default function Route() {
  permanentRedirect('/privacidad#cookies');
}
