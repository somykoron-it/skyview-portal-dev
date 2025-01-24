import { Message } from "@/types/chat";
import { TypeAnimation } from "react-type-animation";
import ReactMarkdown from "react-markdown";

interface MessageContentProps {
  message: Message;
  isCurrentUser: boolean;
}

function formatContent(content: string) {
  // Replace [REF]...[/REF] with a cleaner format
  return content.replace(/\[REF\](.*?)\[\/REF\]/g, (_, p1) => {
    // Extract section and page info if present
    const match = p1.match(/(Section .+?, Page \d+):(.*)/);
    if (match) {
      const [, reference, quote] = match;
      return `📄 *${reference}*\n> ${quote.trim()}`;
    }
    // If no specific format, just return the reference with a marker
    return `📄 *Reference:*\n> ${p1.trim()}`;
  });
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const formattedContent = formatContent(message.content);

  if (isCurrentUser) {
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <TypeAnimation
        sequence={[formattedContent]}
        wrapper="div"
        cursor={false}
        repeat={0}
        speed={90}
        className="whitespace-pre-wrap"
      />
    </div>
  );
}