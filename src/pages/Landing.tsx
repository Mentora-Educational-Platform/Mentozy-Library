import { useState, useEffect } from 'react';
import { BookOpen, Search, Download, Heart, Share2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  BeeDoodle, CatDoodle, StarDoodle, BookLogo, 
  doodleBorder, doodleShadow, doodleHover, pastelColors, getPastelColor 
} from '../components/Doodles';

const categories = ['All', 'UX/UI', 'Illustration', 'Typography', 'Web Design'];

export default function Landing() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewResource, setPreviewResource] = useState<any>(null);
  const [readingResource, setReadingResource] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]); // Initialize empty resources

  // Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data) {
        setResources(data);
      }
    };
    fetchBooks();
  }, []);

  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else { 
        toast.success('Welcome back!'); 
        setIsAuthOpen(false); 
        navigate('/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else { 
        toast.success('Signed up successfully!'); 
        setIsAuthOpen(false);
        navigate('/dashboard');
      }
    }
  };

  const filteredItems = resources.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 pb-32 bg-[#fffdfa] min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
        {/* Background Doodles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <StarDoodle className="absolute top-20 left-10 w-12 h-12" />
            <StarDoodle className="absolute top-40 right-20 w-8 h-8" />
            <StarDoodle className="absolute bottom-40 left-1/4 w-16 h-16" />
            <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-black" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M 10 50 Q 30 10 50 50 T 90 50" />
            </svg>
        </div>

        {/* Navbar */}
        <AnimatePresence>
          {!readingResource && (
            <motion.nav 
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-[#fffdfa]/80 backdrop-blur-sm border-b-2 border-black"
            >
              <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter cursor-pointer">
                <BookLogo className="w-8 h-8" />
                mentozy.blook.
              </Link>
              <div className="hidden md:flex gap-8 font-bold text-lg">
                <Link to="/dashboard" className="hover:text-pink-500 transition-colors">Dashboard</Link>
                <Link to="/how-it-works" className="hover:text-blue-500 transition-colors">How it Works</Link>
                <a href="#" className="hover:text-yellow-500 transition-colors">Download</a>
              </div>
              <button 
                onClick={() => setIsAuthOpen(true)}
                className={`px-6 py-2 bg-black text-white font-bold ${doodleBorder} hover:scale-105 transition-transform`}
              >
                Publish Now ↗
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-6 relative z-10 mt-10">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-5xl mx-auto mb-20 relative"
            >
                <div className={`inline-flex items-center gap-2 px-6 py-2 bg-[#fef08a] text-black font-bold text-sm mb-6 ${doodleBorder} ${doodleShadow}`}>
                    ✨ Discover Amazing Stories
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-left uppercase leading-[0.9] tracking-tight mb-10">
                  Books &<br/>Smarter Reads
                </h1>

                <div className="flex justify-center items-end gap-1 md:gap-4 my-16 flex-wrap">
                    <span className="text-7xl md:text-[9rem] font-serif font-black text-black tracking-tighter">B</span>
                    <div className={`w-8 h-20 md:w-16 md:h-40 ${pastelColors[0]} ${doodleBorder} transform -rotate-2 shadow-sm`}></div>
                    <div className={`w-8 h-20 md:w-16 md:h-36 ${pastelColors[1]} ${doodleBorder} transform rotate-2 shadow-sm`}></div>
                    <span className="text-7xl md:text-[9rem] font-serif font-black text-black tracking-tighter">L</span>
                    <div className={`w-8 h-16 md:w-16 md:h-48 ${pastelColors[2]} ${doodleBorder} transform -rotate-1 shadow-sm`}></div>
                    <div className={`w-8 h-20 md:w-16 md:h-32 ${pastelColors[5]} ${doodleBorder} transform rotate-3 shadow-sm`}></div>
                    <span className="text-7xl md:text-[9rem] font-serif font-black text-black tracking-tighter">K</span>
                    <div className="-ml-2 md:-ml-8 pb-4 md:pb-10 z-10"><BeeDoodle className="w-16 h-16 md:w-28 md:h-28" /></div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start text-left mt-20 border-t-[3px] border-black pt-10">
                  <div className="max-w-md">
                    <div className={`inline-block px-3 py-1 mb-4 text-xs font-bold bg-[#fbcfe8] border-2 border-black rounded-full`}>
                      🌟 Community Driven
                    </div>
                    <h2 className="text-4xl font-black uppercase leading-tight">
                      Share & Discover<br/>Amazing Books
                    </h2>
                  </div>
                  <div className="max-w-sm mt-6 md:mt-0 font-medium text-lg text-gray-700">
                    Join our vibrant community of creators and readers. Write your own stories, upload beautiful cover art, and explore a growing library of unique sketchbooks and comics.
                    <br/><br/>
                    <Link to="/dashboard" className="inline-block bg-black text-white px-6 py-3 font-bold rounded-full hover:scale-105 transition-transform text-sm">
                      Go to Creator Dashboard ↗
                    </Link>
                  </div>
                </div>
            </motion.div>

            {/* Library Shelf Section */}
            <div className="mt-32">
              <h3 className="text-4xl font-black mb-10 text-center uppercase">Explore The Collection</h3>
              
              {/* Search and Filter */}
              <div className={`flex flex-col md:flex-row gap-4 items-center bg-white p-4 ${doodleBorder} ${doodleShadow} max-w-4xl mx-auto mb-16`}>
                  <div className="relative flex-1 w-full border-b-2 md:border-b-0 md:border-r-2 border-black pb-4 md:pb-0 md:pr-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
                      <input
                          type="text"
                          placeholder="Search books, tags..."
                          className="w-full pl-14 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-black font-bold text-lg placeholder:text-gray-400"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar px-2">
                      {categories.map((category, idx) => (
                          <button
                              key={category}
                              onClick={() => setActiveCategory(category)}
                              className={`px-5 py-2 whitespace-nowrap font-bold transition-all ${doodleBorder} ${activeCategory === category
                                  ? `${pastelColors[idx % pastelColors.length]} text-black`
                                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                  }`}
                          >
                              {category}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Shelves */}
              <div className="space-y-16 md:space-y-24 relative">
                  {/* Decorative Sleeping Cat on the first shelf */}
                  <div className="absolute top-[-50px] right-[5%] z-20 hidden md:block">
                      <CatDoodle className="w-24 h-24" />
                  </div>

                  {Array.from({ length: Math.ceil(filteredItems.length / 4) }).map((_, shelfIndex) => {
                      const shelfItems = filteredItems.slice(shelfIndex * 4, (shelfIndex + 1) * 4);
                      return (
                          <div key={shelfIndex} className="relative pt-4 pb-0 px-2 md:px-10">
                              <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-12 lg:gap-16 items-end">
                                  {shelfItems.map((item, index) => {
                                      const bgColor = getPastelColor(index + shelfIndex * 4);

                                      return (
                                          <motion.div
                                              key={item.id}
                                              initial={{ opacity: 0, y: 20 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.4, delay: index * 0.1 }}
                                              className={`group relative w-[160px] h-[220px] md:w-[200px] md:h-[280px] bg-white ${doodleBorder} shadow-[6px_6px_0px_#000] hover:-translate-y-4 hover:-translate-x-1 hover:shadow-[12px_12px_0px_#000] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer`}
                                              onClick={() => setPreviewResource(item)}
                                          >
                                              {/* Spine */}
                                              <div className={`absolute left-0 top-0 bottom-0 w-6 ${bgColor} border-r-2 border-black flex items-center justify-center`}>
                                                <div className="w-1 h-full bg-black/10 mx-auto"></div>
                                              </div>

                                              {/* Cover Image/Pattern */}
                                              <div className="ml-6 flex-1 bg-cover bg-center border-b-2 border-black relative" style={{backgroundImage: `url(${item.cover_url})`}}>
                                                <div className="absolute inset-0 bg-white/40"></div>
                                                <div className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-1">
                                                  {item.script_url?.endsWith('pdf') ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                                </div>
                                              </div>

                                              <div className="ml-6 p-3 bg-white h-[90px] flex flex-col justify-between">
                                                  <h3 className="text-sm font-black text-black leading-tight line-clamp-2">
                                                      {item.title}
                                                  </h3>
                                                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                                                      {item.pen_name}
                                                  </p>
                                              </div>

                                              {/* Actions Overlay */}
                                              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 z-20">
                                                  <button className={`w-full py-2 bg-[#bbf7d0] text-black text-sm font-bold flex items-center justify-center gap-2 ${doodleBorder}`}>
                                                      <Download className="w-4 h-4" /> Read It
                                                  </button>
                                                  <div className="flex gap-2 w-full">
                                                      <button className={`flex-1 py-2 flex items-center justify-center ${doodleBorder} bg-white text-black`}>
                                                          <Heart className="w-4 h-4 hover:fill-rose-500 hover:text-rose-500" />
                                                      </button>
                                                      <button className={`flex-1 py-2 bg-white text-black flex items-center justify-center ${doodleBorder}`}>
                                                          <Share2 className="w-4 h-4" />
                                                      </button>
                                                  </div>
                                              </div>
                                          </motion.div>
                                      )
                                  })}
                              </div>
                              
                              {/* The Sketchy Shelf Line */}
                              <div className="w-[110%] -ml-[5%] h-4 mt-2 relative opacity-100">
                                  <div className="absolute top-2 left-0 w-full h-[3px] bg-black rounded-full"></div>
                                  <div className="absolute top-3 left-2 w-[98%] h-[2px] bg-black rounded-full transform -rotate-[0.2deg]"></div>
                                  <div className="absolute top-1 left-4 w-[95%] h-[1px] bg-black rounded-full transform rotate-[0.1deg]"></div>
                              </div>
                          </div>
                      );
                  })}
              </div>

              {filteredItems.length === 0 && (
                  <div className={`text-center py-20 bg-white ${doodleBorder} ${doodleShadow} max-w-2xl mx-auto`}>
                      <Search className="w-12 h-12 text-black mx-auto mb-6" />
                      <h3 className="text-3xl font-black text-black mb-4">Nothing found</h3>
                      <p className="text-xl text-gray-600 font-medium mb-6">Looks like this section is empty. Try a different search!</p>
                  </div>
              )}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewResource && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setPreviewResource(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20, rotate: -2 }}
                            className={`relative bg-[#fffdfa] p-8 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row gap-8 max-h-[90vh] ${doodleBorder} shadow-[15px_15px_0px_#000]`}
                        >
                            <button
                                onClick={() => setPreviewResource(null)}
                                className={`absolute -right-3 -top-3 w-12 h-12 bg-[#fbcfe8] text-black flex items-center justify-center z-20 ${doodleBorder} hover:scale-110 transition-transform`}
                            >
                                x
                            </button>

                            <div className={`w-full md:w-1/2 aspect-[3/4] bg-cover bg-center ${doodleBorder}`} style={{backgroundImage: `url(${previewResource.cover_url})`}}>
                            </div>

                            <div className="w-full md:w-1/2 flex flex-col justify-center">
                                <div className="inline-block px-3 py-1 mb-4 text-sm font-bold bg-[#bfdbfe] border-2 border-black w-max">
                                  {previewResource.category}
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black mb-4 leading-none">{previewResource.title}</h3>
                                <p className="text-xl font-bold text-gray-600 mb-8 border-b-4 border-black border-dashed pb-6">
                                    By {previewResource.pen_name}
                                </p>
                                
                                <p className="text-lg mb-8">
                                  {previewResource.description || `A fantastic resource for learning and exploring the world of ${previewResource.category}. Perfect for beginners and advanced readers alike!`}
                                </p>

                                <div className="flex items-center gap-4 mt-auto">
                                    <button 
                                      onClick={() => {
                                        if (previewResource.script_url) {
                                            window.open(previewResource.script_url, '_blank');
                                        } else if (previewResource.story) {
                                            setReadingResource(previewResource);
                                            setPreviewResource(null);
                                        } else {
                                            toast.error('No content available for this book.');
                                        }
                                      }}
                                      className={`flex-1 py-4 bg-[#fef08a] text-black font-black text-xl flex items-center justify-center gap-3 ${doodleBorder} ${doodleHover}`}
                                    >
                                        <Download className="w-6 h-6" />
                                        Read Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reading Modal */}
            <AnimatePresence>
                {readingResource && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setReadingResource(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative bg-[#fffdfa] p-8 md:p-12 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 ${doodleBorder} shadow-[15px_15px_0px_#000]`}
                            style={{
                              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                              lineHeight: '32px',
                              paddingTop: '32px'
                            }}
                        >
                            <button
                                onClick={() => setReadingResource(null)}
                                className={`fixed top-6 right-6 md:absolute md:-right-3 md:-top-3 w-12 h-12 bg-[#fbcfe8] text-black flex items-center justify-center z-50 ${doodleBorder} hover:scale-110 transition-transform font-bold text-xl`}
                            >
                                x
                            </button>

                            <div className="bg-white/80 backdrop-blur-sm p-6 mb-8 border-b-4 border-black border-dashed inline-block self-start">
                              <h2 className="text-4xl md:text-5xl font-black mb-2">{readingResource.title}</h2>
                              <p className="text-xl font-bold text-gray-600">By {readingResource.pen_name}</p>
                            </div>

                            <div className="font-medium text-lg md:text-xl whitespace-pre-wrap px-4">
                              {readingResource.story}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AnimatePresence>
                {isAuthOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsAuthOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20, rotate: 2 }}
                            className={`relative bg-[#fffdfa] p-8 w-full max-w-md ${doodleBorder} shadow-[10px_10px_0px_#000]`}
                        >
                            <button
                                onClick={() => setIsAuthOpen(false)}
                                className={`absolute -right-3 -top-3 w-10 h-10 bg-[#fbcfe8] text-black flex items-center justify-center z-20 ${doodleBorder} hover:scale-110 transition-transform font-bold`}
                            >
                                x
                            </button>

                            <h3 className="text-3xl font-black mb-6 text-center">
                                {isLogin ? 'Welcome Back!' : 'Join the Club!'}
                            </h3>

                            <form onSubmit={handleAuth} className="space-y-6">
                                <div>
                                    <label className="block text-lg font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className={`w-full px-4 py-3 bg-white outline-none font-medium ${doodleBorder}`}
                                        placeholder="you@awesome.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg font-bold mb-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className={`w-full px-4 py-3 bg-white outline-none font-medium ${doodleBorder}`}
                                        placeholder="Super secret..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-4 bg-[#bbf7d0] text-black font-black text-xl ${doodleBorder} ${doodleHover}`}
                                >
                                    {isLogin ? 'Log In' : 'Sign Up'}
                                </button>
                            </form>

                            <p className="mt-6 text-center font-bold">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button 
                                  onClick={() => setIsLogin(!isLogin)}
                                  className="text-pink-500 hover:underline underline-offset-4"
                                >
                                  {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    </div>
  );
}
