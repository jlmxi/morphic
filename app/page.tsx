import { Chat } from '@/components/chat';
import { generateId } from '@/lib/utils/generate-id';

export default async function Page() {
  const id = generateId()
  return <Chat id={id} />
}
