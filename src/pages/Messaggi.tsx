import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatView, ConversationList } from '@/components/ChatView';
import BottomDock from '@/components/BottomDock';
import Footer from '@/components/legal/Footer';

const Messaggi = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<{ userId: string; userName: string } | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {activeChat ? (
          <div className="h-[calc(100vh-160px)]">
            <ChatView
              otherUserId={activeChat.userId}
              otherUserName={activeChat.userName}
              onBack={() => setActiveChat(null)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/diario')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">Messaggi</h1>
              </div>
            </motion.header>

            <ConversationList
              onSelectConversation={(userId, userName) => setActiveChat({ userId, userName })}
            />
          </>
        )}
      </div>

      <BottomDock />
      <Footer />
    </div>
  );
};

export default Messaggi;
