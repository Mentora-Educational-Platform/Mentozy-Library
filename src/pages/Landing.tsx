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
import VirtualBookReader from '../components/VirtualBookReader';

const categories = ['All', 'UX/UI', 'Illustration', 'Typography', 'Web Design'];

export default function Landing() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewResource, setPreviewResource] = useState<any>(null);
  const [readingResource, setReadingResource] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]); // Initialize empty resources
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Fetch Books and handle custom shared book query
  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data) {
        setResources(data);
        
        // Parse URL query parameter for pre-loaded book sharing
        const params = new URLSearchParams(window.location.search);
        const sharedBookId = params.get('book');
        if (sharedBookId) {
          const sharedBook = data.find(b => b.id === sharedBookId);
          if (sharedBook) {
            setSelectedBookId(sharedBookId);
            setReadingResource(sharedBook);
          }
        }
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

  const activeBook = filteredItems.find(item => item.id === selectedBookId) || filteredItems[0];
  const otherBooks = filteredItems.filter(item => item.id !== (activeBook?.id));

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
              <Link 
                to="/dashboard"
                className={`px-6 py-2 bg-black text-white font-bold ${doodleBorder} hover:scale-105 transition-transform flex items-center justify-center`}
              >
                Publish Now ↗
              </Link>
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
              <div className="relative">
                  {/* Decorative Sleeping Cat above the shelf */}
                  <div className="absolute top-[-50px] right-[5%] z-20 hidden md:block">
                      <CatDoodle className="w-24 h-24" />
                  </div>

                  {filteredItems.length > 0 && activeBook ? (
                      <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 max-w-6xl mx-auto px-2 md:px-6">
                          {/* 1. LEFT SIDE: Featured Book flat cover + metadata */}
                          <div className={`flex-[1.2] flex flex-col md:flex-row gap-6 md:gap-8 items-center bg-[#fffdfa] p-6 md:p-8 ${doodleBorder} ${doodleShadow} relative`}>
                              
                              {/* 3D Flat Cover wrapper */}
                              <div className="relative flex-shrink-0" style={{ perspective: '1000px' }}>
                                  <motion.div
                                      key={activeBook.id}
                                      initial={{ opacity: 0, rotateY: 30, scale: 0.95 }}
                                      animate={{ opacity: 1, rotateY: -10, scale: 1 }}
                                      transition={{ duration: 0.6, ease: 'easeOut' }}
                                      className="relative group w-[180px] h-[250px] md:w-[230px] md:h-[320px] rounded-r-lg border-4 border-black transition-all cursor-pointer hover:shadow-[16px_16px_0px_#000]"
                                      style={{
                                          transformStyle: 'preserve-3d',
                                          boxShadow: '10px 10px 0px #000, 15px 15px 25px rgba(0,0,0,0.15)',
                                          background: activeBook.cover_bg || 'linear-gradient(135deg, #fbcfe8, #ec4899)'
                                      }}
                                      onClick={() => {
                                          if (activeBook.script_url) {
                                              window.open(activeBook.script_url, '_blank');
                                          } else if (activeBook.story) {
                                              setReadingResource(activeBook);
                                          } else {
                                              toast.error('No content available for this book.');
                                          }
                                      }}
                                  >
                                      {/* Left spine shadow binding crease */}
                                      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/25 to-transparent border-r border-black/15 z-10 rounded-l-xs"></div>
                                      
                                      {/* Image Cover if URL exists */}
                                      {activeBook.cover_url ? (
                                          <div 
                                              className="absolute inset-0 bg-cover bg-center rounded-r-xs flex flex-col justify-end p-4"
                                              style={{ backgroundImage: `url(${activeBook.cover_url})` }}
                                          >
                                              <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors rounded-r-xs"></div>
                                              <div className="relative z-10 bg-white/95 border-2 border-black p-2 shadow-[2px_2px_0px_#000]">
                                                  <h4 className="text-xs font-black text-black leading-tight truncate uppercase">{activeBook.title}</h4>
                                                  <p className="text-[9px] font-bold text-gray-500 uppercase truncate mt-0.5">{activeBook.pen_name}</p>
                                              </div>
                                          </div>
                                      ) : (
                                          /* Typography Cover if no URL */
                                          <div className="absolute inset-0 flex flex-col justify-between p-5 text-black">
                                              <div className="flex flex-col gap-1">
                                                  <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 w-max rounded-full">{activeBook.category}</span>
                                              </div>
                                              <div className="my-auto">
                                                  <h4 className="text-xl md:text-2xl font-black uppercase leading-tight tracking-tight border-b-2 border-black pb-2 line-clamp-3 select-none">{activeBook.title}</h4>
                                                  <p className="text-xs font-bold uppercase mt-2 select-none">By {activeBook.pen_name}</p>
                                              </div>
                                              <div className="flex justify-between items-center text-[10px] font-black uppercase select-none">
                                                  <span>Mentozy Library</span>
                                                  <span>Vol. 1</span>
                                              </div>
                                          </div>
                                      )}

                                      {/* Neon Bookmark ribbon hanging out of bottom */}
                                      <div className="absolute bottom-[-16px] left-8 w-4 h-6 bg-[#ec4899] border-2 border-black rounded-b-md transform -skew-x-12 z-20 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"></div>
                                  </motion.div>
                              </div>

                              {/* Book Details Column */}
                              <div className="flex-1 flex flex-col justify-center w-full">
                                  <div className="flex items-center gap-3 mb-3">
                                      <span className="px-3 py-1 font-black text-xs uppercase bg-[#bfdbfe] border-2 border-black shadow-[2px_2px_0px_#000]">
                                          {activeBook.category}
                                      </span>
                                      {activeBook.script_url && (
                                          <span className="px-3 py-1 font-black text-xs uppercase bg-[#bbf7d0] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1">
                                              <FileText className="w-3 h-3" /> PDF
                                          </span>
                                      )}
                                  </div>

                                  <h3 className="text-2xl md:text-3xl font-black text-black uppercase leading-tight mb-2">
                                      {activeBook.title}
                                  </h3>
                                  <p className="text-sm font-bold text-gray-500 uppercase mb-4 border-b-2 border-black border-dashed pb-2">
                                      Published by {activeBook.pen_name}
                                  </p>

                                  <p className="text-xs md:text-sm text-gray-600 font-medium line-clamp-4 mb-6 leading-relaxed bg-black/5 p-3 rounded-lg border-2 border-black border-dashed">
                                      {activeBook.description || "An enchanting interactive sketchbook story written and published by our creator. Dive into their wonderful doodle world today!"}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3">
                                      <button 
                                          onClick={() => {
                                              if (activeBook.script_url) {
                                                  window.open(activeBook.script_url, '_blank');
                                              } else if (activeBook.story) {
                                                  setReadingResource(activeBook);
                                              } else {
                                                  toast.error('No content available for this book.');
                                              }
                                          }}
                                          className={`flex-1 min-w-[140px] py-3 bg-[#fef08a] hover:bg-[#fde047] text-black font-black text-base flex items-center justify-center gap-2 ${doodleBorder} ${doodleShadow} ${doodleHover} transition-transform cursor-pointer`}
                                      >
                                          <BookOpen className="w-5 h-5" /> READ NOW
                                      </button>
                                      
                                      <button 
                                          onClick={() => toast.success('Added to your favorite shelf! ❤️')}
                                          className={`px-4 py-3 bg-white hover:bg-gray-50 text-black flex items-center justify-center ${doodleBorder} ${doodleShadow} ${doodleHover} transition-transform cursor-pointer`}
                                          title="Favorite"
                                      >
                                          <Heart className="w-5 h-5 hover:fill-rose-500 hover:text-rose-500 transition-colors" />
                                      </button>

                                      <button 
                                          onClick={() => {
                                              const shareUrl = `${window.location.origin}${window.location.pathname}?book=${activeBook.id}`;
                                              navigator.clipboard.writeText(shareUrl);
                                              toast.success('Shareable book link copied to clipboard! 🔗');
                                          }}
                                          className={`px-4 py-3 bg-white hover:bg-gray-50 text-black flex items-center justify-center ${doodleBorder} ${doodleShadow} ${doodleHover} transition-transform cursor-pointer`}
                                          title="Share"
                                      >
                                          <Share2 className="w-5 h-5" />
                                      </button>
                                  </div>
                              </div>
                          </div>

                          {/* 2. RIGHT SIDE: 3D Spines Rack standing on a shelf */}
                          <div className={`flex-1 flex flex-col justify-between bg-[#f7f5ed] border-4 border-black p-4 relative ${doodleShadow}`}>
                              <div className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 px-2 border-b-2 border-black/10 pb-2">
                                  📚 More Books on Shelf ({otherBooks.length})
                              </div>

                              {/* Spines flexbox row with horizontal scroll */}
                              <div className="flex gap-4 items-end overflow-x-auto py-6 px-4 min-h-[300px] scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
                                  {otherBooks.map((item, index) => {
                                      const bgColor = getPastelColor(index);
                                      const spineBg = item.cover_bg || `linear-gradient(to bottom, ${bgColor}, ${bgColor})`;

                                      return (
                                          <div 
                                              key={item.id}
                                              className="relative group cursor-pointer flex-shrink-0 transition-all duration-300"
                                              style={{ perspective: '800px' }}
                                              onClick={() => setSelectedBookId(item.id)}
                                          >
                                              {/* 3D Spine Book */}
                                              <div 
                                                  className="w-[45px] md:w-[58px] h-[200px] md:h-[275px] border-2 border-black rounded-xs transition-all duration-300 group-hover:translate-z-[12px] group-hover:rotateY(-10deg) group-hover:scale-105 select-none relative"
                                                  style={{
                                                      transformStyle: 'preserve-3d',
                                                      transformOrigin: 'left center',
                                                      transform: 'rotateY(-28deg) rotateX(1deg) translateZ(0)',
                                                      background: spineBg,
                                                      boxShadow: '3px 5px 0px #000, 6px 10px 12px rgba(0,0,0,0.18)'
                                                  }}
                                              >
                                                  {/* Spine hinge crease line */}
                                                  <div className="absolute left-2.5 top-0 bottom-0 w-[2px] bg-black/15 shadow-[1px_0_1px_rgba(255,255,255,0.15)] z-10"></div>
                                                  
                                                  {/* Paper pages top sliver */}
                                                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 border-b border-black/25 z-10 rounded-t-xs"></div>
                                                  
                                                  {/* Paper pages bottom sliver */}
                                                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100 border-t border-black/25 z-10 rounded-b-xs"></div>
                                                  
                                                  {/* Cylindrical lighting overlay gradient */}
                                                  <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-white/20 rounded-xs pointer-events-none"></div>

                                                  {/* Vertical Text writing-mode */}
                                                  <div 
                                                      className="flex items-center justify-between h-full py-5 px-1.5 text-white font-extrabold text-[10px] md:text-[11px] uppercase tracking-wide leading-none whitespace-nowrap select-none"
                                                      style={{
                                                          writingMode: 'vertical-rl',
                                                          transform: 'rotate(180deg)',
                                                          textShadow: '1px 1px 2px rgba(0,0,0,0.4)'
                                                      }}
                                                  >
                                                      <span className="truncate max-h-[110px] md:max-h-[160px]">
                                                          {item.title}
                                                      </span>
                                                      <span className="mx-1 opacity-60">•</span>
                                                      <span className="truncate opacity-80 text-[8px] md:text-[9px]">
                                                          {item.pen_name}
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                      )
                                  })}

                                  {otherBooks.length === 0 && (
                                      <div className="w-full flex flex-col items-center justify-center text-center p-6 bg-black/5 rounded-lg border-2 border-dashed border-black/20 my-auto py-12">
                                          <BookOpen className="w-8 h-8 text-black/30 mb-2" />
                                          <p className="text-xs font-black uppercase text-black/50">Only one book published in this shelf!</p>
                                      </div>
                                  )}
                              </div>

                              {/* Physical Wood Board Shelf under the spines */}
                              <div className="w-[108%] -ml-[4%] h-5 bg-[#e6c280] border-t-4 border-b-4 border-black relative z-10 shadow-[0_5px_10px_rgba(0,0,0,0.15)] flex items-center">
                                  <div className="absolute left-1/4 right-1/4 h-[2px] bg-black/10"></div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className={`text-center py-20 bg-white ${doodleBorder} ${doodleShadow} max-w-2xl mx-auto`}>
                          <Search className="w-12 h-12 text-black mx-auto mb-6" />
                          <h3 className="text-3xl font-black text-black mb-4">Nothing found</h3>
                          <p className="text-xl text-gray-600 font-medium mb-6">Looks like this category has no books. Try another tab or add some books!</p>
                      </div>
                  )}

                  {/* Physical Wood Board Shelf under the whole dual area */}
                  {filteredItems.length > 0 && activeBook && (
                      <div className="w-[110%] -ml-[5%] h-6 bg-[#d97706]/20 border-t-4 border-black mt-8 relative opacity-100 flex items-center">
                          <div className="absolute top-2 left-0 w-full h-[3px] bg-black rounded-full"></div>
                          <div className="absolute top-3 left-2 w-[98%] h-[2px] bg-black rounded-full transform -rotate-[0.2deg]"></div>
                      </div>
                  )}
            </div>
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
                    <VirtualBookReader 
                      book={readingResource} 
                      onClose={() => setReadingResource(null)} 
                    />
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
