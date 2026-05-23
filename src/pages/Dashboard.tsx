import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookLogo, doodleBorder, doodleShadow, doodleHover, StarDoodle, CatDoodle } from '../components/Doodles';
import { Upload, BookOpen, PenTool, Image as ImageIcon, FileText, CheckCircle, Bold, Italic, Underline, List, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('mentozy_creator_unlocked') === 'true');
  const [authEmail, setAuthEmail] = useState('');
  const [isAuthLogin, setIsAuthLogin] = useState(false); // defaults to Sign Up first
  const [verificationStep, setVerificationStep] = useState(1); // 1 = Code check, 2 = Email sign up / login

  const handleUnlockCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCode = accessCode.trim().toUpperCase();
    const isValid = /^MZ\d{9}VK$/.test(cleanedCode);
    
    if (isValid) {
      setVerificationStep(2);
      toast.success('Access code verified! Please complete email authentication.');
    } else {
      toast.error('Invalid access code! Code must start with MZ, end with VK, and have exactly 9 digits in between (e.g., MZ507788855VK).');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return toast.error('Please enter your email');
    
    const cleanedCode = accessCode.trim().toUpperCase();
    setIsPublishing(true);
    
    try {
      if (isAuthLogin) {
        // Log in using Email and Student Access Code (as password)
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: cleanedCode
        });
        if (error) {
          throw new Error(error.message || 'Incorrect email or student code.');
        }
        toast.success('Welcome back! Creator access unlocked. 🎉');
      } else {
        // Sign up using Email and Student Access Code (as password)
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: cleanedCode
        });
        if (error) {
          throw new Error(error.message || 'Signup failed.');
        }
        toast.success('Account created! Creator access unlocked. 🎉');
      }
      
      localStorage.setItem('mentozy_creator_unlocked', 'true');
      localStorage.setItem('mentozy_student_code', cleanedCode);
      setIsUnlocked(true);
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLock = () => {
    localStorage.removeItem('mentozy_creator_unlocked');
    localStorage.removeItem('mentozy_student_code');
    setIsUnlocked(false);
    setAccessCode('');
    setAuthEmail('');
    setVerificationStep(1);
    toast.success('Creator Studio locked.');
  };

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
  const [drafts, setDrafts] = useState<any[]>(() => {
    const saved = localStorage.getItem('mentozy_user_drafts');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-save drafts state to localStorage
  useEffect(() => {
    localStorage.setItem('mentozy_user_drafts', JSON.stringify(drafts));
  }, [drafts]);

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
    const draftCoverUrl = sessionStorage.getItem('mentozy_draft_cover_url');
    const draftCoverBg = sessionStorage.getItem('mentozy_draft_cover_bg');
    const draftCategory = sessionStorage.getItem('mentozy_draft_category');
    const draftDescription = sessionStorage.getItem('mentozy_draft_description');
    const draftPenName = sessionStorage.getItem('mentozy_draft_pen_name');
    
    if (draftTitle || draftStory) {
      const activeTitle = draftTitle || '';
      const activeStory = draftStory || '';
      
      setTitle(activeTitle);
      setStory(activeStory);
      if (draftCategory) setCategory(draftCategory);
      if (draftDescription) setDescription(draftDescription);
      if (draftPenName) setPenName(draftPenName);
      
      setDrafts(prev => {
        const existingIdx = prev.findIndex(d => d.title.toLowerCase() === activeTitle.toLowerCase());
        const updatedDraft = {
          id: existingIdx >= 0 ? prev[existingIdx].id : Date.now().toString(),
          title: activeTitle || 'Untitled Draft',
          story: activeStory,
          category: draftCategory || category || 'Story',
          description: draftDescription || description || '',
          cover_url: draftCoverUrl || '',
          cover_bg: draftCoverBg || '',
          pen_name: draftPenName || penName || '',
          updated_at: new Date().toISOString()
        };
        
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = updatedDraft;
          return next;
        } else {
          return [updatedDraft, ...prev];
        }
      });

      sessionStorage.removeItem('mentozy_draft_title');
      sessionStorage.removeItem('mentozy_draft_story');
      sessionStorage.removeItem('mentozy_draft_cover_url');
      sessionStorage.removeItem('mentozy_draft_cover_bg');
      sessionStorage.removeItem('mentozy_draft_category');
      sessionStorage.removeItem('mentozy_draft_description');
      sessionStorage.removeItem('mentozy_draft_pen_name');
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

  const handleSaveDraft = () => {
    if (!title.trim()) {
      return toast.error('Please enter a title for your draft!');
    }
    
    setDrafts(prev => {
      const existingIdx = prev.findIndex(d => d.title.toLowerCase() === title.toLowerCase());
      const updatedDraft = {
        id: existingIdx >= 0 ? prev[existingIdx].id : Date.now().toString(),
        title: title,
        story: story,
        category: category,
        updated_at: new Date().toISOString()
      };
      
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = updatedDraft;
        return next;
      } else {
        return [updatedDraft, ...prev];
      }
    });
    
    toast.success(`Draft "${title}" saved successfully! 📁`);
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
          {isUnlocked && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs bg-[#bbf7d0] px-3 py-1 border-2 border-black font-extrabold uppercase tracking-wide">
                Verified: {localStorage.getItem('mentozy_student_code')} ✅
              </span>
              <button 
                onClick={handleLock}
                className={`px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-black uppercase border-2 border-black ${doodleHover} cursor-pointer`}
                title="Lock Studio"
              >
                Lock Studio 🔒
              </button>
            </div>
          )}
          <div className={`px-4 py-1 bg-[#fbcfe8] text-sm ${doodleBorder}`}>Dashboard</div>
        </div>
      </nav>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        {!isUnlocked ? (
          <div className="max-w-2xl mx-auto mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white p-8 md:p-10 ${doodleBorder} ${doodleShadow} relative overflow-hidden`}
            >
              <div className="absolute top-4 right-4 bg-[#fde047] border-2 border-black rounded-full p-2">
                <span className="text-2xl">🔒</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight">
                Student Access Verification
              </h2>

              <AnimatePresence mode="wait">
                {verificationStep === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-base md:text-lg font-bold text-gray-700 mb-6 leading-relaxed">
                      To write and publish books in the Mentozy Library, you must verify your student credentials. 
                      Only verified students from the Mentozy learning platform can access the Creator Studio.
                    </p>

                    {/* Visual Student Guide Mockup */}
                    <div className="bg-[#f7f5ed] border-2 border-black p-5 mb-8 rounded-xl relative shadow-[4px_4px_0px_#000]">
                      <div className="absolute -top-3 left-4 bg-black text-[#fffdfa] px-3 py-0.5 text-xs font-black uppercase tracking-wider">
                        Student Dashboard Guide
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                        <div className="w-16 h-16 rounded-full border-2 border-black bg-pink-200 flex items-center justify-center text-3xl font-black shadow-[2px_2px_0px_#000]">
                          🎓
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="font-extrabold text-sm text-black">Mentozy Student Status</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Log in to your student account in Mentozy. Copy the student access code shown under your dashboard profile status:
                          </p>
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-black border-dashed font-mono text-xs font-black text-black">
                            Code Format: <span className="text-pink-600">MZ</span>[ 9-Digits ]<span className="text-pink-600">VK</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleUnlockCode} className="space-y-6">
                      <div>
                        <label className="block text-lg font-extrabold text-black mb-2">
                          Enter Student Access Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={13}
                          value={accessCode}
                          onChange={e => setAccessCode(e.target.value)}
                          className={`w-full px-4 py-4 bg-yellow-50/50 uppercase font-mono font-bold text-xl outline-none placeholder:text-gray-400 focus:bg-yellow-50 transition-colors ${doodleBorder}`}
                          placeholder="MZ507788855VK"
                        />
                        <p className="text-xs font-bold text-gray-500 mt-2">
                          * Standard 13-character verified Mentozy student code (Starts with MZ, ends with VK).
                        </p>
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-4 bg-[#bbf7d0] hover:bg-[#86efac] text-black font-black text-xl flex items-center justify-center gap-2 ${doodleBorder} ${doodleShadow} ${doodleHover} transition-all cursor-pointer`}
                      >
                        Verify Code & Next ➔
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-base md:text-lg font-bold text-gray-700 mb-6 leading-relaxed">
                      Your access code has been verified! Now, complete your account setup. Sign up with your email, and you'll be able to log in using this code anytime!
                    </p>

                    {/* Code Verified Card */}
                    <div className="bg-[#bbf7d0]/30 border-2 border-black p-4 mb-6 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_#000]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔑</span>
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wide">Verified Access Code</h4>
                          <span className="font-mono font-extrabold text-base text-black uppercase tracking-wider">{accessCode.trim().toUpperCase()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVerificationStep(1)}
                        className="px-3 py-1 bg-white hover:bg-gray-50 border-2 border-black text-xs font-bold uppercase cursor-pointer"
                      >
                        Edit Code
                      </button>
                    </div>

                    {/* Auth Toggle Tabs */}
                    <div className="flex border-b-2 border-black mb-6">
                      <button
                        type="button"
                        onClick={() => setIsAuthLogin(false)}
                        className={`flex-1 py-3 font-black text-sm uppercase transition-colors ${!isAuthLogin ? 'bg-[#fbcfe8] border-t-2 border-l-2 border-r-2 border-black text-black' : 'text-gray-500 hover:text-black bg-transparent'}`}
                      >
                        New Account (Sign Up) ✍️
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAuthLogin(true)}
                        className={`flex-1 py-3 font-black text-sm uppercase transition-colors ${isAuthLogin ? 'bg-[#fef08a] border-t-2 border-l-2 border-r-2 border-black text-black' : 'text-gray-500 hover:text-black bg-transparent'}`}
                      >
                        Existing Account (Log In) 🔑
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-6">
                      <div>
                        <label className="block text-base font-extrabold text-black mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={e => setAuthEmail(e.target.value)}
                          className={`w-full px-4 py-4 bg-white font-medium text-lg outline-none focus:bg-gray-50 transition-colors ${doodleBorder}`}
                          placeholder="you@awesome.com"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-extrabold text-black mb-2">
                          Your Login Passcode
                        </label>
                        <input
                          type="text"
                          disabled
                          value={accessCode.trim().toUpperCase()}
                          className={`w-full px-4 py-4 bg-gray-100 font-mono font-bold text-lg border-2 border-gray-300 select-none cursor-not-allowed`}
                        />
                        <p className="text-xs font-bold text-gray-500 mt-2">
                          * Your verified student access code serves as your secure account password.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isPublishing}
                        className={`w-full py-4 bg-[#bfdbfe] hover:bg-[#93c5fd] disabled:bg-gray-200 text-black font-black text-xl flex items-center justify-center gap-2 ${doodleBorder} ${doodleShadow} ${doodleHover} transition-all cursor-pointer`}
                      >
                        {isPublishing ? 'Authenticating...' : isAuthLogin ? 'Log In & Unlock 🔓' : 'Register & Unlock 🔓'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          <>
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
                      if (story) sessionStorage.setItem('mentozy_draft_story', story);
                      const matchingDraft = drafts.find(d => d.title.toLowerCase() === title.toLowerCase());
                      if (matchingDraft) {
                        if (matchingDraft.cover_url) sessionStorage.setItem('mentozy_draft_cover_url', matchingDraft.cover_url);
                        if (matchingDraft.cover_bg) sessionStorage.setItem('mentozy_draft_cover_bg', matchingDraft.cover_bg);
                        if (matchingDraft.description) sessionStorage.setItem('mentozy_draft_description', matchingDraft.description);
                        if (matchingDraft.pen_name) sessionStorage.setItem('mentozy_draft_pen_name', matchingDraft.pen_name);
                      }
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

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className={`flex-1 py-5 bg-[#fed7aa] text-black font-black text-2xl flex items-center justify-center gap-3 ${doodleBorder} ${doodleHover}`}
                >
                  Save Draft 📁
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`flex-1 py-5 bg-[#bbf7d0] text-black font-black text-2xl flex items-center justify-center gap-3 ${doodleBorder} ${doodleHover}`}
                >
                  {isPublishing ? 'Publishing...' : 'Publish to Library'} <BookOpen className="w-6 h-6" />
                </button>
              </div>

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

        {/* My Saved Drafts */}
        <div className="mt-20 border-t-4 border-black pt-16">
          <h2 className="text-4xl font-black mb-10 flex items-center gap-4">
            <FileText className="w-10 h-10 text-orange-500" /> My Saved Drafts
          </h2>
          {drafts.length === 0 ? (
            <div className={`p-10 text-center bg-[#fed7aa]/20 ${doodleBorder} shadow-[8px_8px_0px_#000] max-w-2xl mx-auto`}>
              <h3 className="text-2xl font-black mb-2">No drafts saved yet!</h3>
              <p className="text-lg text-gray-700 font-bold">Drafts saved in your Doodle Writing Board or Dashboard will appear here so you can finish them anytime.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((draft) => (
                <div key={draft.id} className={`bg-white p-6 flex flex-col justify-between ${doodleBorder} shadow-[6px_6px_0px_#000] hover:-translate-y-2 hover:shadow-[10px_10px_0px_#000] transition-all`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black bg-[#fef08a] px-2.5 py-1 border border-black uppercase tracking-wider">{draft.category || 'Story'}</span>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(draft.updated_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-black text-xl line-clamp-1 mb-2">{draft.title}</h4>
                    <p className="text-sm font-bold text-gray-500 line-clamp-3 mb-6 bg-gray-50 p-3 border border-black border-dashed min-h-[76px] break-words">
                      {draft.story || 'Empty draft...'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setTitle(draft.title);
                        setStory(draft.story);
                        if (draft.category) setCategory(draft.category);
                        toast.success(`Loaded draft "${draft.title}" into the Creator Studio editor! ✍️`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex-1 py-2 bg-[#bfdbfe] text-black font-black text-xs uppercase tracking-wider ${doodleBorder} ${doodleHover} ${doodleShadow} flex items-center justify-center gap-1 cursor-pointer`}
                    >
                      ✍️ Resume
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the draft "${draft.title}"?`)) {
                          setDrafts(prev => prev.filter(d => d.id !== draft.id));
                          toast.success(`Deleted draft "${draft.title}"`);
                        }
                      }}
                      className={`px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-xs ${doodleBorder} ${doodleHover} cursor-pointer`}
                      title="Delete Draft"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
      </>
    )}
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
