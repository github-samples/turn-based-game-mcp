import { TicTacToePage } from '../page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <TicTacToePage initialGameId={id} />
}
