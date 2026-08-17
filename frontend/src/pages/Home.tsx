import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Droplets, 
  Zap, 
  Leaf, 
  Calculator, 
  TrendingUp, 
  Shield,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  X,
  Send,
  Volume2,
  VolumeX
} from 'lucide-react';
import heroImage from '@/assets/hero-water.jpg';
import Navbar from '@/components/Navbar';
import SplashScreen from '@/components/SplashScreen';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Home = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! 🌧 I'm your Jal Rakshak AI assistant. I can help you understand rainwater harvesting, calculate your water savings potential, and guide you through the assessment process. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if TTS is supported
  const isTtsSupported = () => {
    return 'speechSynthesis' in window;
  };

  // Speak text using TTS
  const speakText = (text: string) => {
    if (!ttsEnabled || !isTtsSupported()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Select a voice (prefer female voices for better clarity)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || voice.name.includes('Google UK English Female')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop TTS
  const stopTts = () => {
    if (isTtsSupported()) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle TTS
  const toggleTts = () => {
    if (ttsEnabled) {
      stopTts();
    }
    setTtsEnabled(!ttsEnabled);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage.trim());
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Speak the response if TTS is enabled
      speakText(aiResponse);
    }, 1000 + Math.random() * 1000);
  };

  const getAIResponse = (question: string): string => {
    const lower = question.toLowerCase();
    
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hello! 👋 Welcome to JalSanrakshak AI. I can help you learn about rainwater harvesting, explain how our assessment works, or answer any questions about water conservation. What would you like to know?";
    }
    
    if (lower.includes('roof') && (lower.includes('area') || lower.includes('measure'))) {
      return "📐 To measure your roof area, you can:\n\n1. Use our Google Earth integration (available in the assessment)\n2. Measure length × width of your roof manually\n3. Check your building plan documents\n\nFor flat roofs, it's simply length × width. For sloped roofs, measure the horizontal projection area.";
    }
    
    if (lower.includes('cost') || lower.includes('price') || lower.includes('expensive')) {
      return "💰 Rainwater harvesting system costs typically range from ₹30,000 to ₹1,50,000 depending on:\n\n• Roof area and collection capacity\n• Type of storage tank (underground/overhead)\n• Filtration system quality\n• Installation complexity\n\nMost systems pay for themselves within 3-5 years through water bill savings!";
    }
    
    if (lower.includes('how') && lower.includes('work')) {
      return "🔧 Rainwater harvesting works in 4 simple steps:\n\n1. **Collection**: Rain falls on your rooftop\n2. **Transport**: Gutters and pipes channel water\n3. **Filtration**: First-flush diverters remove debris\n4. **Storage**: Clean water stored in tanks\n\nOur AI assessment analyzes your specific location, roof type, and rainfall data to design the optimal system for you.";
    }
    
    if (lower.includes('benefit') || lower.includes('advantage') || lower.includes('why')) {
      return "🌟 Key benefits of rainwater harvesting:\n\n• Reduce water bills by 30-50%\n• Decrease dependence on municipal supply\n• Recharge groundwater levels\n• Reduce urban flooding\n• Get government subsidies and tax benefits\n• Improve water quality for non-drinking uses\n\nStart your assessment to see personalized benefits!";
    }
    
    if (lower.includes('assess') || lower.includes('start') || lower.includes('begin')) {
      return "📋 Our assessment process is simple:\n\n1. Enter basic details (name, location)\n2. Provide property measurements\n3. Specify roof type and condition\n4. Review and submit\n\nOur AI then analyzes rainfall patterns, soil conditions, and your property to generate a comprehensive report with recommendations!\n\nClick 'Start Assessment' to begin.";
    }
    
    return "That's a great question! 🤔 While I can help with general information about rainwater harvesting, our detailed assessment tool can provide personalized answers based on your specific location and property. Would you like to:\n\n1. Start a free assessment\n2. Learn about system costs\n3. Understand how RWH works\n4. Know the benefits\n\nJust ask me anything!";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const features = [
    {
      icon: <Droplets className="h-6 w-6" />,
      title: "Rainfall Analysis",
      description: "AI-powered analysis of local rainfall patterns using meteorological data for accurate water harvesting estimates."
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Smart Calculations",
      description: "Machine learning models calculate optimal tank sizes, costs, and ROI specific to your property."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "ROI Projections",
      description: "Detailed cost-benefit analysis with break-even timeline and long-term savings projections."
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Environmental Impact",
      description: "Track your contribution to water conservation and groundwater recharge."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description: "Get comprehensive reports within minutes using our advanced assessment engine."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Comprehensive Reports",
      description: "Detailed analysis with cost-benefit projections and installation guidance."
    }
  ];

  const benefits = [
    "Calculate annual harvestable water potential",
    "Get customized system recommendations",
    "Analyze cost-benefit with payback period",
    "Understand local soil and groundwater conditions",
    "Generate detailed PDF reports",
    "Access Google Earth integration for measurements"
  ];

  const stats = [
    { value: "40%", label: "Water Bills Reduction" },
    { value: "15L", label: "Average Daily Savings" },
    { value: "₹50K", label: "Typical System Cost" },
    { value: "5 Years", label: "Average Payback" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Chatbot FAB */}
      {!chatbotOpen && (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-50 hover:scale-110 transition-transform duration-200"
          onClick={() => setChatbotOpen(true)}
          title="Chat with Jal Rakshak AI"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chatbot Modal */}
      {chatbotOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Jal Rakshak AI Assistant</h3>
              <p className="text-blue-100 text-sm">Smart Rooftop Monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              {/* TTS Toggle Button */}
              {isTtsSupported() && (
                <button
                  onClick={toggleTts}
                  className={`p-2 rounded-full transition-colors ${
                    ttsEnabled 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={ttsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => {
                  stopTts();
                  setChatbotOpen(false);
                }}
                className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about rainwater harvesting..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Powered by Advanced AI
              </p>
              {isTtsSupported() && (
                <p className="text-xs text-gray-500">
                  TTS: {ttsEnabled ? 'ON' : 'OFF'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Navbar />
      
      {/* ===================== HERO SECTION ===================== */}
      <section className="hero-gradient relative pt-28 pb-20 min-h-[92vh] flex items-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm text-white/90">
                <Droplets className="h-4 w-4 text-cyan-300" />
                <span>AI-Powered Water Conservation</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                Smart{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Rainwater
                </span>
                <br />
                Harvesting
              </h1>

              <p className="text-lg lg:text-xl text-blue-100/80 leading-relaxed max-w-xl">
                Unlock your water conservation potential with AI. 
                Get personalized feasibility reports, cost analysis, and 
                technical blueprints — in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/assessment">
                  <Button size="xl" className="group bg-white text-blue-900 hover:bg-blue-50 rounded-full h-14 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto">
                    <Droplets className="mr-2 h-5 w-5 text-blue-600" />
                    Start Free Assessment
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button size="xl" className="rounded-full h-14 px-8 text-base font-medium bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-md transition-all duration-300">
                  <Zap className="mr-2 h-5 w-5 text-cyan-300" />
                  See Demo
                </Button>
              </div>
              
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                    <div className="text-sm text-blue-200/70 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Splash Screen */}
            <div className="relative lg:h-[550px] flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm transform transition-transform duration-700 hover:scale-[1.02]">
                <SplashScreen 
                  autoPlay={true}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative floating blobs */}
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-blue-400/15 rounded-full blur-2xl animate-pulse" 
                   style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section className="py-24 bg-gray-50/80 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Features</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Powered by{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Advanced AI
              </span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Our intelligent system analyzes multiple data sources to provide accurate, 
              personalized rainwater harvesting recommendations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BENEFITS SECTION ===================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-3">Benefits</p>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                  What You'll{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Discover
                  </span>
                </h2>
              </div>
              <p className="text-lg text-gray-500 leading-relaxed">
                Get comprehensive insights about your rainwater harvesting potential 
                with our detailed assessment and recommendations.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group p-3 rounded-xl hover:bg-blue-50/50 transition-colors duration-300">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/assessment">
                <Button size="lg" className="group rounded-full h-13 px-8 font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 mt-4">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            {/* Environmental Impact Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl" />
              <Card className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardHeader className="pt-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-green-600" />
                    </div>
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  {[
                    { label: 'CO₂ Reduction', value: '2.5 tons/year', color: 'text-green-600' },
                    { label: 'Water Saved', value: '15,000L/year', color: 'text-blue-600' },
                    { label: 'Energy Savings', value: '₹8,000/year', color: 'text-amber-600' },
                    { label: 'Groundwater Recharge', value: 'High Impact', color: 'text-cyan-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className={`font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="cta-gradient py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%200v30M0%2015h30%22%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%220.03%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Ready to Save Water{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                and Money?
              </span>
            </h2>
            <p className="text-xl text-blue-200/80 leading-relaxed">
              Start your personalized rainwater harvesting assessment today. 
              It takes just 5 minutes to get comprehensive recommendations.
            </p>
            <Link to="/assessment">
              <Button size="xl" className="group bg-white text-blue-900 hover:bg-blue-50 rounded-full h-14 px-10 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 mt-4">
                <Droplets className="mr-2 h-5 w-5 text-blue-600" />
                Start Your Assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating water droplets */}
        <div className="absolute top-10 left-10 w-4 h-6 bg-white/20 rounded-full water-drop" />
        <div className="absolute top-20 right-20 w-3 h-5 bg-white/15 rounded-full water-drop" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-5 h-7 bg-white/20 rounded-full water-drop" 
             style={{ animationDelay: '2s' }} />
      </section>
    </div>
  );
};

export default Home;