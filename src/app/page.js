import { redirect } from 'next/navigation';

export default function HomePage() {
  // Esta página siempre redirige a login
  // El middleware se encargará de redirigir a dashboard si ya está autenticado
  redirect('/login');
}
