// Questo file non ha bisogno di "use client" perché renderizza solo un Client Component
import RegisterForm from '@/components/RegisterForm'; // Assicurati il percorso corretto

export const metadata = {
  title: 'Registrazione - TalentWeave',
  description: 'Crea il tuo account su TalentWeawe.',
};

export default function RegisterPage() {
  return (
    <main>
      <RegisterForm />
    </main>
  );
}