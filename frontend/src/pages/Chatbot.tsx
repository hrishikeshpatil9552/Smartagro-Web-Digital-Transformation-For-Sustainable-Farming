import { useEffect } from "react";
import AgriChatbot from "../components/AgriChatbot";

interface ChatbotProps {
  onBack?: () => void;
}

const Chatbot = ({ onBack }: ChatbotProps = {}) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'ArrowUp') {
        onBack?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-4 flex items-center justify-center space-x-3">
            <span>🤖</span>
            <span>AI Farming Assistant</span>
          </h1>
          <p className="text-xl text-gray-600">Get instant answers to your farming questions from our AI assistant</p>
        </div>

        {/* Chatbot */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
          <AgriChatbot />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;