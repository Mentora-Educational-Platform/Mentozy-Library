import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookLogo, doodleBorder, doodleShadow, doodleHover, StarDoodle, CatDoodle } from '../components/Doodles';
import { Upload, BookOpen, PenTool, Image as ImageIcon, FileText, CheckCircle, Bold, Italic, Underline, List, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [category, setCategory] = useState('Story');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [penName, setPenName] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('5');
  const [publishedBooks, setPublishedBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data) setPublishedBooks(data);
    };
    fetchBooks();
  }, []);

  // Load draft from Doodle Writing Board
  useEffect(() => {
    const draftTitle = sessionStorage.getItem('mentozy_draft_title');
    const draftStory = sessionStorage.getItem('mentozy_draft_story');
    if (draftTitle) {
      setTitle(draftTitle);
      sessionStorage.removeItem('mentozy_draft_title');
    }
    if (draftStory) {
      setStory(draftStory);
      sessionStorage.removeItem('mentozy_draft_story');
      toast.success('Loaded draft from your Doodle Writing Board! 🎉');
    }
  }, []);


  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = story.substring(start, end);
    const newText = story.substring(0, start) + prefix + selectedText + suffix + story.substring(end);
    setStory(newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error('Please enter a title');
    setIsPublishModalOpen(true);
  };

  const confirmPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penName) return toast.error('Please enter a pen name');
    
    setIsPublishing(true);
    try {
      let coverUrl = 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400&q=80'; // Default
      let scriptUrl = '';

      // Upload Cover
      if (coverFile) {
        const coverName = `covers/${Date.now()}-${coverFile.name}`;
        const { data: coverData, error: coverError } = await supabase.storage.from('library_files').upload(coverName, coverFile);
        if (!coverError && coverData) {
          const { data } = supabase.storage.from('library_files').getPublicUrl(coverName);
          coverUrl = data.publicUrl;
        }
      }

      // Upload Script
      if (scriptFile) {
        const scriptName = `scripts/${Date.now()}-${scriptFile.name}`;
        const { data: scriptData, error: scriptError } = await supabase.storage.from('library_files').upload(scriptName, scriptFile);
        if (!scriptError && scriptData) {
          const { data } = supabase.storage.from('library_files').getPublicUrl(scriptName);
          scriptUrl = data.publicUrl;
        }
      }

      // Insert into database
      const newBook = {
        title,
        category,
        story,
        pen_name: penName,
        description,
        is_paid: isPaid,
        price: isPaid ? parseFloat(price) || 0 : 0,
        cover_url: coverUrl,
        script_url: scriptUrl
      };

      const { error: dbError } = await supabase.from('books').insert([newBook]);

      if (dbError) throw dbError;

      setPublishedBooks([newBook, ...publishedBooks]);

      toast.success(`"${title}" has been published to the library!`);
      setTitle('');
      setStory('');
      setCoverFile(null);
      setScriptFile(null);
      setPenName('');
      setDescription('');
      setIsPublishModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="pt-24 pb-32 bg-[#fffdfa] min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <StarDoodle className="absolute top-20 left-10 w-12 h-12" />
          <StarDoodle className="absolute bottom-40 right-20 w-16 h-16" />
      </div>

      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-[#fffdfa]/80 backdrop-blur-sm border-b-2 border-black">
        <a href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter cursor-pointer">
          <BookLogo className="w-8 h-8" />
          mentozy.blook.
        </a>
        <div className="flex items-center gap-4 font-bold">
          <div className={`px-4 py-1 bg-[#fbcfe8] text-sm ${doodleBorder}`}>Dashboard</div>
        </div>
      </nav>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">Creator Studio</h1>
            <p className="text-xl font-bold text-gray-600">Write, upload, and share your stories with the world.</p>
          </div>
          <div className="hidden md:block">
            <CatDoodle className="w-24 h-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`col-span-1 md:col-span-2 bg-white p-8 ${doodleBorder} ${doodleShadow}`}
          >
            <form onSubmit={handlePublishClick} className="space-y-8">
              
              <div>
                <label className="block text-xl font-black mb-3">Book Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={`w-full px-4 py-4 bg-[#fef08a]/20 outline-none font-bold text-lg ${doodleBorder} focus:bg-[#fef08a] transition-colors`}
                  placeholder="The Amazing Adventures of..."
                />
              </div>

              <div>
                <label className="block text-xl font-black mb-3">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={`w-full px-4 py-4 bg-white outline-none font-bold text-lg ${doodleBorder}`}
                >
                  <option>Story</option>
                  <option>Illustration</option>
                  <option>Comic</option>
                  <option>Script</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="flex items-center gap-2 text-xl font-black">
                    <PenTool className="w-6 h-6" /> Write Your Story
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (title) sessionStorage.setItem('mentozy_draft_title', title);
                      navigate('/writing-board');
                    }}
                    className={`px-4 py-2 bg-[#fbcfe8] text-black font-black text-xs uppercase tracking-wider ${doodleBorder} ${doodleHover} ${doodleShadow}`}
                  >
                    ✍️ Open Immersive Doodle Writing Board
                  </button>
                </div>
                <div className={`bg-white ${doodleBorder} overflow-hidden flex flex-col focus-within:ring-4 ring-[#fef08a]/50 transition-shadow`}>
                  {/* Toolbar */}
                  <div className="bg-[#f3f4f6] border-b-2 border-black p-2 flex gap-2 overflow-x-auto">
                    <button type="button" onClick={() => insertFormatting('**', '**')} className={`p-2 hover:bg-[#fef08a] border-2 border-transparent hover:border-black rounded-lg transition-colors`} title="Bold">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormatting('*', '*')} className={`p-2 hover:bg-[#fef08a] border-2 border-transparent hover:border-black rounded-lg transition-colors`} title="Italic">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormatting('__', '__')} className={`p-2 hover:bg-[#fef08a] border-2 border-transparent hover:border-black rounded-lg transition-colors`} title="Underline">
                      <Underline className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormatting('\n- ')} className={`p-2 hover:bg-[#fef08a] border-2 border-transparent hover:border-black rounded-lg transition-colors`} title="List">
                      <List className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormatting('[Link Text](', ')')} className={`p-2 hover:bg-[#fef08a] border-2 border-transparent hover:border-black rounded-lg transition-colors`} title="Link">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Lined Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={story}
                    onChange={e => setStory(e.target.value)}
                    rows={12}
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                      lineHeight: '32px',
                      paddingTop: '8px'
                    }}
                    className={`w-full px-4 outline-none font-medium text-lg resize-y min-h-[300px] bg-transparent`}
                    placeholder="Once upon a time..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className={`w-full py-5 bg-[#bbf7d0] text-black font-black text-2xl flex items-center justify-center gap-3 ${doodleBorder} ${doodleHover}`}
              >
                {isPublishing ? 'Publishing...' : 'Publish to Library'} <BookOpen className="w-6 h-6" />
              </button>

            </form>
          </motion.div>

          {/* Sidebar Uploads */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 space-y-6"
          >
            {/* Cover Upload */}
            <div className={`bg-[#bfdbfe] p-6 ${doodleBorder} ${doodleShadow}`}>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" /> Cover Art
              </h3>
              <div className={`bg-white border-2 border-black border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-bold text-sm">Click to upload cover image</p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>
              {coverFile && <p className="mt-3 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600"/> {coverFile.name}</p>}
            </div>

            {/* Script Upload */}
            <div className={`bg-[#e9d5ff] p-6 ${doodleBorder} ${doodleShadow}`}>
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" /> Attach Script
              </h3>
              <div className={`bg-white border-2 border-black border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-bold text-sm">Upload PDF or DOCX</p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={e => setScriptFile(e.target.files?.[0] || null)}
                />
              </div>
              {scriptFile && <p className="mt-3 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600"/> {scriptFile.name}</p>}
            </div>

          </motion.div>
        </div>

        {/* My Published Books */}
        <div className="mt-20 border-t-4 border-black pt-16">
          <h2 className="text-4xl font-black mb-10 flex items-center gap-4">
            <BookOpen className="w-10 h-10" /> My Published Library
          </h2>
          {publishedBooks.length === 0 ? (
            <div className={`p-10 text-center bg-[#fef08a] ${doodleBorder} shadow-[8px_8px_0px_#000] max-w-2xl mx-auto`}>
              <h3 className="text-2xl font-black mb-2">No books published yet!</h3>
              <p className="text-lg text-gray-700 font-bold">Your published stories and scripts will appear here once you share them with the world.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {publishedBooks.map((book, idx) => (
                <div key={idx} className={`bg-white p-4 flex flex-col ${doodleBorder} shadow-[6px_6px_0px_#000] hover:-translate-y-2 hover:shadow-[10px_10px_0px_#000] transition-all cursor-pointer`}>
                  <div className={`w-full aspect-[3/4] bg-cover bg-center border-2 border-black mb-4 relative`} style={{backgroundImage: `url(${book.cover_url})`}}>
                    <div className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-1">
                      {book.script_url ? <FileText className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                    </div>
                  </div>
                  <h4 className="font-black text-sm line-clamp-1">{book.title}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{book.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Publish Details Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsPublishModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20, rotate: -2 }}
              className={`relative bg-[#fffdfa] p-8 w-full max-w-lg ${doodleBorder} shadow-[10px_10px_0px_#000] max-h-[90vh] overflow-y-auto`}
            >
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className={`absolute -right-3 -top-3 w-10 h-10 bg-[#fbcfe8] text-black flex items-center justify-center z-20 ${doodleBorder} hover:scale-110 transition-transform font-bold`}
              >
                x
              </button>

              <h3 className="text-3xl font-black mb-6 text-center">Final Details 🎨</h3>

              <form onSubmit={confirmPublish} className="space-y-6">
                <div>
                  <label className="block text-lg font-bold mb-2">Pen Name / Author Name</label>
                  <input
                    type="text"
                    required
                    value={penName}
                    onChange={e => setPenName(e.target.value)}
                    className={`w-full px-4 py-3 bg-white outline-none font-medium ${doodleBorder}`}
                    placeholder="e.g. Jane Sketcho"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-2">Short Description</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={`w-full px-4 py-3 bg-white outline-none font-medium ${doodleBorder} resize-none`}
                    placeholder="What is this book about?"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3">Pricing</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`flex-1 py-3 font-bold transition-all ${doodleBorder} ${!isPaid ? 'bg-[#bbf7d0] shadow-[4px_4px_0px_#000] -translate-y-1' : 'bg-white hover:bg-gray-50'}`}
                    >
                      Free 🎁
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`flex-1 py-3 font-bold transition-all ${doodleBorder} ${isPaid ? 'bg-[#fef08a] shadow-[4px_4px_0px_#000] -translate-y-1' : 'bg-white hover:bg-gray-50'}`}
                    >
                      Paid 💎
                    </button>
                  </div>
                </div>

                {isPaid && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-lg font-bold mb-2">Price ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className={`w-full px-4 py-3 bg-white outline-none font-medium ${doodleBorder}`}
                      placeholder="5.00"
                    />
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`w-full py-4 bg-black text-white font-black text-xl flex items-center justify-center gap-2 ${doodleBorder} ${doodleHover} disabled:opacity-50 mt-4`}
                >
                  {isPublishing ? 'Publishing...' : 'Confirm Publish'} <BookOpen className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
