import { redirect } from 'next/navigation';

interface ProfileAliasByIdPageProps {
  params: {
    id: string;
  };
}

export default function ProfileAliasByIdPage({ params }: ProfileAliasByIdPageProps) {
  redirect(`/dashboard/profile/${params.id}`);
}
