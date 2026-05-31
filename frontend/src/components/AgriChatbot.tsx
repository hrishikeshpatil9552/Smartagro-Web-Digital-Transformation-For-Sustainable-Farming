import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, MicOff, Plus, X, File, Image as ImageIcon } from 'lucide-react';
import { sendChatMessage } from '../services/chatbotService';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  file?: {
    name: string;
    type: string;
    url: string;
  };
}

// Function to format markdown-like text to HTML
const formatResponseText = (text: string) => {
  // Replace markdown-style formatting with HTML
  let formattedText = text
    // Replace **bold** with <strong> tags
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Replace *italic* with <em> tags
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Replace `code` with <code> tags
    .replace(/`(.*?)`/g, '<code class="bg-green-100 px-1 rounded text-sm">$1</code>')
    // Replace ### headers with <h3> tags
    .replace(/### (.*?)(\n|$)/g, '<h3 class="font-bold text-green-700 mt-2 mb-1">$1</h3>')
    // Replace ## headers with <h2> tags
    .replace(/## (.*?)(\n|$)/g, '<h2 class="font-bold text-green-700 mt-3 mb-2 text-lg">$1</h2>')
    // Replace # headers with <h1> tags
    .replace(/^# (.*?)(\n|$)/gm, '<h1 class="font-bold text-green-700 mt-3 mb-2 text-xl">$1</h1>')
    // Replace numbered lists
    .replace(/^\d+\. (.*?)(\n|$)/gm, '<div class="flex items-start ml-4 mb-1"><span class="text-green-600 font-bold mr-2">•</span>$1</div>')
    // Replace bullet points
    .replace(/^\* (.*?)(\n|$)/gm, '<div class="flex items-start ml-4 mb-1"><span class="text-green-600 font-bold mr-2">•</span>$1</div>')
    // Replace double line breaks with paragraph breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    // Replace single line breaks with line breaks
    .replace(/\n/g, '<br />');
  
  // Wrap the entire text in paragraphs
  return `<p class="mb-2 text-gray-800">${formattedText}</p>`;
};

const AgriChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI farming assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    'Crop recommendations',
    'Weather advice',
    'Pest control',
    'Fertilizer guidance'
  ];

  const getChatbotResponse = async (userMessage: string, imageFile?: File): Promise<string> => {
    try {
      const response = await sendChatMessage(userMessage, imageFile);
      return response.response;
    } catch (error) {
      console.error('Chatbot Error:', error);
      return 'I\'m having trouble processing your question right now. Please try asking again or consult with our agricultural experts.';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      file: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      } : undefined
    };

    const currentInput = inputText;
    const currentFile = selectedFile;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedFile(null);
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: 'Thinking...',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await getChatbotResponse(currentInput, currentFile);
      
      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } catch (error) {
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  // Voice recording functionality with speech-to-text
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'mr-IN', name: 'मराठी (Marathi)' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)' }
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = selectedLanguage;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        alert('Speech recognition failed. Please try again.');
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [selectedLanguage]);

  const startRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    
    // Update language before starting
    recognition.lang = selectedLanguage;
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  // File upload functionality
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setShowFileUpload(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    // --- CHANGED LINE: Increased width to make chatbot look much bigger ---
    <div 
      className="bg-white rounded-2xl border-4 border-gray-200 flex flex-col shadow-lg w-11/12 mx-auto"
      style={{ height: '98vh', maxHeight: '98vh', minHeight: '700px' }}
    >
      {/* Chat Header - Fixed Height */}
      <div 
        className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl flex items-center justify-center space-x-2"
        style={{ height: '60px', minHeight: '60px', maxHeight: '60px' }}
      >
        <Bot className="w-5 h-5" />
        <span className="font-semibold text-2xl">AgriBot Assistant</span>
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="p-4 overflow-y-auto space-y-3 bg-gray-50"
        style={{ 
          height: 'calc(100% - 240px)', 
          scrollBehavior: 'smooth'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-green-600" />}
                <div className="flex-1">
                  {message.sender === 'bot' ? (
                    // Use dangerouslySetInnerHTML for bot messages to render HTML
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: formatResponseText(message.text) }}
                    />
                  ) : (
                    // Regular text for user messages
                    <span className="text-sm">{message.text}</span>
                  )}
                  {message.file && (
                    <div className="mt-2 p-2 bg-white/20 rounded flex items-center space-x-2">
                      {message.file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <File className="w-4 h-4" />
                      )}
                      <span className="text-xs truncate max-w-[150px]">{message.file.name}</span>
                    </div>
                  )}
                </div>
                {message.sender === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0 text-green-100" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies - Fixed Height */}
      <div 
        className="px-4 pb-2 bg-white"
        style={{ height: '60px', minHeight: '60px', maxHeight: '60px' }}
      >
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="px-4 pb-2 bg-white">
          <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <File className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm text-gray-700 truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area - Fixed Height */}
      <div 
        className="p-4 border-t border-gray-200 bg-white rounded-b-2xl"
        style={{ height: '80px', minHeight: '80px', maxHeight: '80px' }}
      >
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors"
            title="Upload file"
          >
            <Plus className="w-10 h-10" />
          </button>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs border-none focus:outline-none"
            title="Select language for voice input"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'} p-3 rounded-lg hover:bg-gray-200 transition-colors`}
            title={isRecording ? "Stop recording" : `Start voice recording in ${languages.find(l => l.code === selectedLanguage)?.name}`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-10 h-10" />}
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isLoading ? 'AI is thinking...' : 'Ask about farming...'}
            disabled={isLoading}
            className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm disabled:bg-gray-100"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputText.trim() && !selectedFile)}
            className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-12 h-10" />
            )}
          </button>
        </div>
        
        {/* File Upload Options (shown when + is clicked) */}
        {showFileUpload && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Upload a file</span>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-xs">Image</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <File className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs">Document</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriChatbot;

















// import { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User } from 'lucide-react';

// interface Message {
//   id: string;
//   text: string;
//   sender: 'user' | 'bot';
//   timestamp: Date;
// }

// const AgriChatbot = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       text: 'Hello! I\'m your AI farming assistant. How can I help you today?',
//       sender: 'bot',
//       timestamp: new Date()
//     }
//   ]);
//   const [inputText, setInputText] = useState('');
//   const messagesContainerRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     if (messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const quickReplies = [
//     'Crop recommendations',
//     'Weather advice',
//     'Pest control',
//     'Fertilizer guidance'
//   ];

//   const [isLoading, setIsLoading] = useState(false);

//   const getGeminiResponse = async (userMessage: string): Promise<string> => {
//     const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.replace(/"/g, '');
    
//     if (!API_KEY) {
//       return 'Sorry, I\'m having trouble connecting. Please try again later.';
//     }

//     const prompt = `You are an expert agricultural consultant and farming assistant. Answer the following farming question in a helpful, practical, and farmer-friendly way. Keep responses concise but informative.

// Question: ${userMessage}

// Provide practical advice that farmers can easily understand and implement.`;

//     try {
//       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{
//               text: prompt
//             }]
//           }]
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to get response');
//       }

//       const result = await response.json();
      
//       if (result.candidates && result.candidates[0] && result.candidates[0].content) {
//         return result.candidates[0].content.parts[0].text;
//       } else {
//         throw new Error('Invalid response format');
//       }
//     } catch (error) {
//       console.error('Gemini API Error:', error);
//       return 'I\'m having trouble processing your question right now. Please try asking again or consult with our agricultural experts above.';
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!inputText.trim() || isLoading) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text: inputText,
//       sender: 'user',
//       timestamp: new Date()
//     };

//     const currentInput = inputText;
//     setMessages(prev => [...prev, userMessage]);
//     setInputText('');
//     setIsLoading(true);

//     // Add typing indicator
//     const typingMessage: Message = {
//       id: 'typing',
//       text: 'Thinking...',
//       sender: 'bot',
//       timestamp: new Date()
//     };
//     setMessages(prev => [...prev, typingMessage]);

//     try {
//       const response = await getGeminiResponse(currentInput);
      
//       // Remove typing indicator and add real response
//       setMessages(prev => {
//         const filtered = prev.filter(msg => msg.id !== 'typing');
//         return [...filtered, {
//           id: (Date.now() + 1).toString(),
//           text: response,
//           sender: 'bot',
//           timestamp: new Date()
//         }];
//       });
//     } catch (error) {
//       // Remove typing indicator and add error message
//       setMessages(prev => {
//         const filtered = prev.filter(msg => msg.id !== 'typing');
//         return [...filtered, {
//           id: (Date.now() + 1).toString(),
//           text: 'Sorry, I encountered an error. Please try again.',
//           sender: 'bot',
//           timestamp: new Date()
//         }];
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleQuickReply = (reply: string) => {
//     setInputText(reply);
//   };

//   return (
//     <div 
//       className="bg-white rounded-2xl border-2 border-gray-200 flex flex-col"
//       style={{ height: '300px', maxHeight: '300px', minHeight: '300px' }}
//     >
//       {/* Chat Header - Fixed Height */}
//       <div 
//         className="bg-green-600 text-white p-4 rounded-t-2xl flex items-center  justify-center space-x-2"
//         style={{ height: '60px', minHeight: '60px', maxHeight: '60px' }}
//       >
//         <Bot className="w-5 h-5" />
//         <span className="font-semibold text-2xl">AgriBot Assistant</span>
//       </div>

//       {/* Messages Area - Scrollable */}
//       <div 
//         ref={messagesContainerRef}
//         className="p-4 overflow-y-auto space-y-3"
//         style={{ 
//           height: '100px', 
//           minHeight: '100px', 
//           maxHeight: '100px',
//           scrollBehavior: 'smooth'
//         }}
//       >
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`max-w-xs px-4 py-2 rounded-lg ${
//                 message.sender === 'user'
//                   ? 'bg-green-600 text-white'
//                   : 'bg-gray-100 text-gray-800'
//               }`}
//             >
//               <div className="flex items-start space-x-2">
//                 {message.sender === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
//                 <span className="text-sm">{message.text}</span>
//                 {message.sender === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Replies - Fixed Height */}
//       <div 
//         className="px-4 pb-2"
//         style={{ height: '60px', minHeight: '60px', maxHeight: '60px' }}
//       >
//         <div className="flex flex-wrap gap-2">
//           {quickReplies.map((reply) => (
//             <button
//               key={reply}
//               onClick={() => handleQuickReply(reply)}
//               className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors"
//             >
//               {reply}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Input Area - Fixed Height */}
//       <div 
//         className="p-4 border-t border-gray-200"
//         style={{ height: '80px', minHeight: '80px', maxHeight: '80px' }}
//       >
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder={isLoading ? 'AI is thinking...' : 'Ask about farming...'}
//             disabled={isLoading}
//             className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm disabled:bg-gray-100"
//           />
//           <button
//             onClick={handleSendMessage}
//             disabled={isLoading || !inputText.trim()}
//             className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? (
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//             ) : (
//               <Send className="w-4 h-4" />
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AgriChatbot;