import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Share2,
  Star,
  MoreVertical,
  History,
  MessageSquare,
  Video,
  Lock,
  Check,
  Send,
  X
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [title, setTitle] = useState('Untitled document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInput, setAIInput] = useState('');
  const [aiMessages, setAIMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const formatDoc = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.contentEditable = 'true';
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isLoading) return;

    const documentContent = editorRef.current?.innerText || '';
    const userMessage = aiInput;
    setAIInput('');
    
    setAIMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI('AIzaSyCdYtsfZrO6TCS2o97rqtvE03URBqJBMy0');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const prompt = `You are a professional writer. Please analyze the following text and provide feedback:

      Document text:
      ${documentContent}
      
      User request: ${userMessage}
      
      try to sound less AI and more personal, while sitll remaining professional`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      setAIMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setAIMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while checking your text. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="flex items-center px-4 py-2">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png"
            alt="Google Docs"
            className="w-10 h-10"
          />
          <div className="flex-1 ml-2">
            <div className="flex items-center">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="border-b border-blue-500 outline-none px-1"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-lg cursor-pointer hover:bg-gray-100 px-1 rounded"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title}
                </h1>
              )}
              <button className="ml-4 text-gray-600 hover:text-yellow-500">
                <Star size={20} />
              </button>
            </div>
            <div className="flex space-x-4 mt-2 text-gray-600">
              <button className="hover:bg-gray-100 px-2 py-1 rounded">File</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Edit</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">View</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Insert</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Format</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Tools</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Extensions</button>
              <button className="hover:bg-gray-100 px-2 py-1 rounded">Help</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
              onClick={() => setIsAIOpen(prev => !prev)}
              title="Spelling Check"
            >
              <Check size={20} />
            </button>
            <button className="text-gray-600">
              <History size={20} />
            </button>
            <button className="text-gray-600">
              <MessageSquare size={20} />
            </button>
            <button className="text-gray-600">
              <Video size={20} />
            </button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center">
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-1 px-4 py-1 border-t">
          <button
            onClick={() => formatDoc('bold')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => formatDoc('italic')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => formatDoc('underline')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Underline size={18} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={() => formatDoc('justifyLeft')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => formatDoc('justifyCenter')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => formatDoc('justifyRight')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <AlignRight size={18} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={() => formatDoc('insertUnorderedList')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => formatDoc('insertOrderedList')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ListOrdered size={18} />
          </button>
        </div>
      </header>

      {/* Editor */}
      <div className="flex justify-center bg-gray-100 min-h-[calc(100vh-128px)]">
        <div className="w-[8.5in] bg-white shadow-lg my-4 p-12">
          <div
            ref={editorRef}
            className={`min-h-[11in] outline-none ${
              isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        {/* Spelling Check Window */}
        {isAIOpen && (
          <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Check size={20} className="text-green-500" />
                <h3 className="font-medium">Spelling Check</h3>
              </div>
              <button
                onClick={() => setIsAIOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {aiMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    Checking your text...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAISubmit} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAIInput(e.target.value)}
                  placeholder="Ask for spelling and grammar help..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full disabled:opacity-50"
                  disabled={isLoading}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;