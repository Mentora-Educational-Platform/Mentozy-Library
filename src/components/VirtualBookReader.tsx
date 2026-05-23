import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ArrowRight, X, BookOpen, Heart, Share2, CornerDownRight 
} from 'lucide-react';
import { 
  BeeDoodle, CatDoodle, StarDoodle, BookLogo, 
  doodleBorder
} from './Doodles';

interface VirtualBookReaderProps {
  book: {
    id: string;
    title: string;
    pen_name: string;
    story: string;
    cover_url?: string;
    description?: string;
    category?: string;
  };
  onClose: () => void;
}

interface Page {
  title: string;
  chapterTitle?: string;
  contentHtml: string;
}

// Convert markdown to clean, styled HTML (with custom doodle support)
const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 class="text-xl md:text-2xl font-black text-black mt-4 mb-3 border-b-2 border-black border-dashed pb-1">${trimmed.substring(4)}</h3>`;
    } else if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2 class="text-2xl font-black text-black mt-5 mb-3">${trimmed.substring(3)}</h2>`;
    } else if (trimmed.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1 class="text-3xl font-black text-black mt-6 mb-4">${trimmed.substring(2)}</h1>`;
    } else if (trimmed === '---') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<hr class="my-6 border-t-2 border-black border-dashed"/>';
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul class="list-disc pl-5 my-3 space-y-2 font-bold">'; inList = true; }
      let itemText = trimmed.substring(2);
      itemText = itemText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      itemText = itemText.replace(/\*(.*?)\*/g, '<i>$1</i>');
      html += `<li>${itemText}</li>`;
    } else if (trimmed === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<div class="h-4"></div>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      let paraText = line;
      paraText = paraText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      paraText = paraText.replace(/\*(.*?)\*/g, '<i>$1</i>');
      paraText = paraText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 underline font-bold">$1</a>');
      
      // Inline SVGs matching the writing board doodles
      paraText = paraText.replace(/⭐/g, '<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-7 h-7 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 50 10 Q 55 45 90 50 Q 55 55 50 90 Q 45 55 10 50 Q 45 45 50 10 Z" fill="#fef08a"/></svg></span>');
      paraText = paraText.replace(/🐱/g, '<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-8 h-7 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 80" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 20 60 Q 50 30 80 60" fill="#bfdbfe" /><circle cx="25" cy="50" r="14" fill="#bfdbfe" /><path d="M 15 45 L 10 25 L 25 40" fill="#bfdbfe" /><path d="M 25 40 L 35 25 L 35 45" fill="#bfdbfe" /><path d="M 18 52 Q 21 55 24 52" /><path d="M 28 52 Q 31 55 34 52" /><circle cx="28" cy="48" r="1.5" fill="#000" /></svg></span>');
      paraText = paraText.replace(/🐝/g, '<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-7 h-7 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="50" cy="50" rx="20" ry="15" fill="#fde047" /><path d="M 40 37 Q 45 50 40 63" /><path d="M 50 35 Q 55 50 50 65" /><path d="M 45 35 Q 30 10 50 20 Q 60 30 55 35" fill="#fff" /><circle cx="30" cy="50" r="8" fill="#fff" /><circle cx="28" cy="48" r="1.5" fill="#000" /></svg></span>');
      
      html += `<p class="mb-4 leading-relaxed font-bold text-gray-800">${paraText}</p>`;
    }
  });

  if (inList) { html += '</ul>'; }
  return html;
};

// Smart story layout page-splitting function
const splitStoryIntoPages = (storyText: string): Page[] => {
  if (!storyText) {
    return [{ title: 'Blank Page', contentHtml: '<p class="text-xl font-bold text-gray-500">This book has no pages yet...</p>' }];
  }

  // Split by markdown horizontal rules: \n---\n or \n--- or <hr/>
  const rawSections = storyText.split(/(?:\r?\n---\r?\n|<hr\s*\/?>|\r?\n---(?:\r?\n|$))/g);
  const pages: Page[] = [];

  rawSections.forEach((section) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    // Parse out chapter title if present at the start (e.g., ### Chapter 1: Title)
    let chapterTitle = '';
    let remainingText = trimmed;

    const headingMatch = trimmed.match(/^(?:###|##|#)\s+(.+?)(?:\r?\n|$)/);
    if (headingMatch) {
      chapterTitle = headingMatch[1];
      // Remove the heading line
      remainingText = trimmed.replace(/^(?:###|##|#)\s+.+?(?:\r?\n|$)/, '').trim();
    }

    // Split remaining text into paragraphs to prevent page overflowing
    const paragraphs = remainingText.split(/(?:\r?\n){2,}/);
    let currentPageHtml = '';
    let pageWordCount = 0;
    let partCount = 1;

    paragraphs.forEach((para) => {
      const paraTrimmed = para.trim();
      if (!paraTrimmed) return;

      const paraHtml = convertMarkdownToHtml(paraTrimmed);
      const paraWords = paraTrimmed.split(/\s+/).length;

      // If adding this paragraph exceeds character limits (approx ~700-800 characters) or word count limit (~150 words),
      // split it to a new page to guarantee fit inside skeuomorphic sheets.
      if (currentPageHtml.length > 0 && (currentPageHtml.length + paraHtml.length > 850 || pageWordCount + paraWords > 180)) {
        pages.push({
          title: chapterTitle ? `${chapterTitle} (Part ${partCount})` : `Page ${pages.length + 1}`,
          chapterTitle: partCount === 1 ? chapterTitle : undefined,
          contentHtml: currentPageHtml,
        });
        currentPageHtml = paraHtml;
        pageWordCount = paraWords;
        partCount++;
      } else {
        currentPageHtml += paraHtml;
        pageWordCount += paraWords;
      }
    });

    if (currentPageHtml) {
      pages.push({
        title: chapterTitle ? (partCount > 1 ? `${chapterTitle} (Part ${partCount})` : chapterTitle) : `Page ${pages.length + 1}`,
        chapterTitle: partCount === 1 ? chapterTitle : undefined,
        contentHtml: currentPageHtml,
      });
    }
  });

  return pages.length > 0 ? pages : [{ title: 'Blank Page', contentHtml: '<p class="text-xl font-bold text-gray-500">This book has no pages yet...</p>' }];
};

export default function VirtualBookReader({ book, onClose }: VirtualBookReaderProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0 represents the Closed Cover
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Initialize and split book contents
  useEffect(() => {
    const splitPages = splitStoryIntoPages(book.story);
    setPages(splitPages);
    setCurrentPage(0); // Reset to closed cover whenever book changes
  }, [book]);

  // Handle mobile responsiveness check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages, currentPage, isMobile]);

  const handleNext = () => {
    if (currentPage === 0) {
      // Cover page opens to first spread
      setDirection('next');
      setCurrentPage(1);
    } else {
      const step = isMobile ? 1 : 2;
      if (currentPage + step <= pages.length) {
        setDirection('next');
        setCurrentPage(currentPage + step);
      }
    }
  };

  const handlePrev = () => {
    if (currentPage === 0) return;
    
    setDirection('prev');
    if (currentPage === 1) {
      setCurrentPage(0); // Closes book cover
    } else {
      const step = isMobile ? 1 : 2;
      setCurrentPage(Math.max(1, currentPage - step));
    }
  };

  // Animate variants for flip transitions
  const pageFlipVariants: any = {
    initial: (dir: 'next' | 'prev') => ({
      rotateY: dir === 'next' ? 45 : -45,
      opacity: 0,
      scale: 0.98,
      transformPerspective: 1200
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeInOut' }
    },
    exit: (dir: 'next' | 'prev') => ({
      rotateY: dir === 'next' ? -45 : 45,
      opacity: 0,
      scale: 0.98,
      transformPerspective: 1200,
      transition: { duration: 0.7, ease: 'easeInOut' }
    })
  };

  // Determine current active display pages
  const leftPageIndex = currentPage - 1; // 0-indexed page inside array
  const rightPageIndex = currentPage;   // 0-indexed page inside array

  const hasNext = currentPage === 0 
    ? pages.length > 0 
    : (isMobile ? currentPage < pages.length : currentPage + 1 < pages.length);

  const hasPrev = currentPage > 0;

  return (
    <div className="fixed inset-0 z-[120] bg-zinc-950/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden font-sans">
      
      {/* Decorative Doodles floating in background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <StarDoodle className="absolute top-10 left-10 w-24 h-24 text-white" />
        <StarDoodle className="absolute bottom-10 right-10 w-32 h-32 text-white" />
        <BeeDoodle className="absolute top-1/4 right-10 w-20 h-20 text-white" />
        <CatDoodle className="absolute bottom-1/4 left-10 w-28 h-28 text-white" />
      </div>

      {/* Top Header bar */}
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto z-50">
        <div className="flex items-center gap-3">
          <BookLogo className="w-10 h-10 bg-white border-2 border-black rounded-lg p-1" />
          <div>
            <h2 className="text-white font-black text-lg md:text-xl leading-none uppercase">{book.title}</h2>
            <p className="text-zinc-400 font-bold text-xs md:text-sm mt-1">Written by {book.pen_name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-12 h-12 bg-pink-300 text-black flex items-center justify-center font-black text-xl hover:scale-105 active:scale-95 transition-transform ${doodleBorder} border-2 border-black cursor-pointer shadow-[3px_3px_0px_#000]`}
          title="Close book"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Main Interactive Book Spread Workspace */}
      <main className="flex-1 flex items-center justify-center my-6 relative w-full max-w-6xl mx-auto">
        
        {/* Previous page arrow */}
        <div className="absolute left-0 md:left-4 z-40">
          {hasPrev && (
            <button
              onClick={handlePrev}
              className={`w-12 h-12 md:w-16 md:h-16 bg-[#fed7aa] text-black flex items-center justify-center font-black rounded-full border-3 border-black cursor-pointer shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] transition-all`}
            >
              <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
            </button>
          )}
        </div>

        {/* The Skeuomorphic Book Wrapper */}
        <div className="relative w-full max-w-4xl h-[70vh] md:h-[65vh] flex items-center justify-center z-10">
          
          <AnimatePresence mode="wait" custom={direction}>
            {currentPage === 0 ? (
              
              /* ================= CLOSED BOOK COVER PAGE ================= */
              <motion.div
                key="book-cover"
                custom={direction}
                variants={pageFlipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={handleNext}
                className={`relative w-[280px] sm:w-[320px] md:w-[380px] h-[95%] bg-[#ec4899] cursor-pointer ${doodleBorder} border-[4px] border-black flex flex-col justify-between p-6 md:p-8 select-none text-left`}
                style={{
                  backgroundImage: book.cover_url ? `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 10%, transparent 15%), url(${book.cover_url})` : 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 8%), repeating-linear-gradient(45deg, #fbcfe8, #fbcfe8 20px, #ec4899 20px, #ec4899 40px)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: '15px 15px 0px #000, inset 5px 0px 10px rgba(0,0,0,0.3)'
                }}
              >
                {/* Book spine decorative ridge (to look thick) */}
                <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/40 to-transparent"></div>

                <div className="space-y-4 relative z-10 bg-black/75 p-5 border-2 border-white rounded-xl backdrop-blur-sm shadow-lg text-white">
                  <span className="text-[10px] font-black bg-pink-500 text-white px-2.5 py-1 border border-white uppercase tracking-wider">
                    {book.category || 'Doodle Story'}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight text-yellow-300 font-serif tracking-tight uppercase line-clamp-3">
                    {book.title}
                  </h1>
                  <p className="text-sm font-bold text-pink-200">
                    By <span className="underline decoration-pink-400 font-black text-white">{book.pen_name}</span>
                  </p>
                </div>

                <div className="space-y-4 relative z-10">
                  {book.description && (
                    <div className="bg-white border-2 border-black p-4 text-black text-xs md:text-sm font-bold shadow-[4px_4px_0px_#000] rotate-1 relative rounded-lg line-clamp-3 leading-relaxed">
                      <div className="absolute -top-2.5 left-4 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                      {book.description}
                    </div>
                  )}

                  <button
                    className={`w-full py-3.5 bg-[#bbf7d0] text-black font-black text-lg md:text-xl flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all`}
                  >
                    Open Story <BookOpen className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

            ) : (

              /* ================= OPEN BOOK SPREAD PAGE ================= */
              <motion.div
                key="open-book-spread"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="relative w-full h-[98%] bg-[#854d0e] rounded-2xl p-2 select-none border-4 border-black flex shadow-[20px_20px_0px_#000]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #a16207 0%, #713f12 100%)',
                }}
              >
                {/* Ribbon bookmark hanging down */}
                <div 
                  className="absolute top-0 left-[50%] -translate-x-[50%] w-6 h-36 bg-pink-500 border-2 border-t-0 border-black rounded-b-lg shadow-md z-30 transform -rotate-2"
                  style={{ display: isMobile ? 'none' : 'block' }}
                >
                  <div className="absolute bottom-2 left-0 right-0 h-3 bg-pink-600/40 rounded-b-lg"></div>
                </div>

                {/* Simulated Stacked Sheets behind (gives skeuomorphic thick pages depth effect) */}
                <div className="absolute right-3 bottom-0 w-[96%] h-2 bg-white/90 border-b-2 border-black rounded-b transform translate-y-1 z-0 shadow-sm"></div>
                <div className="absolute right-5 bottom-0 w-[92%] h-4 bg-white/70 border-b-2 border-black rounded-b transform translate-y-2 z-0 opacity-70"></div>

                {/* Left Page Sheet */}
                {(!isMobile || leftPageIndex < pages.length) && (
                  <motion.div 
                    key={`left-sheet-${currentPage}`}
                    initial={
                      direction === 'prev' 
                        ? { rotateY: 25, opacity: 0.85 } 
                        : { opacity: 0.9 }
                    }
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.85, ease: 'easeInOut' }}
                    style={{ 
                      transformOrigin: 'right center', 
                      transformPerspective: 1000,
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 27px, #e5e7eb 28px)',
                      lineHeight: '28px',
                      paddingTop: '28px',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      boxShadow: 'inset -15px 0px 30px rgba(0,0,0,0.06)'
                    }}
                    className={`flex-1 h-full bg-[#fffefc] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden text-left border-r-2 border-dashed border-gray-300`}
                  >
                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto pr-1 select-text scrollbar-thin">
                      {pages[leftPageIndex]?.chapterTitle && (
                        <div className="flex items-center gap-2 mb-4 text-[#ec4899] font-black uppercase text-xs md:text-sm tracking-wider">
                          <CornerDownRight className="w-4 h-4 text-black stroke-[3]" />
                          {pages[leftPageIndex].chapterTitle}
                        </div>
                      )}
                      <div 
                        className="text-sm md:text-base select-text" 
                        dangerouslySetInnerHTML={{ __html: pages[leftPageIndex]?.contentHtml || '' }}
                      />
                    </div>

                    {/* Left Page Bottom Footer (Page Number) */}
                    <footer className="mt-4 pt-2 border-t border-black/10 flex justify-between items-center z-10 font-bold text-xs text-gray-500 uppercase bg-[#fffefc]">
                      <span>{book.title}</span>
                      <span className="bg-yellow-100 border border-black rounded-full px-2 py-0.5 text-black">
                        Page {leftPageIndex + 1}
                      </span>
                    </footer>
                  </motion.div>
                )}

                {/* Center Spine Binding Ridge */}
                {!isMobile && (
                  <div className="w-5 bg-gradient-to-r from-black/20 via-black/5 to-black/20 border-l border-r border-black/10 h-full relative z-20 shadow-inner">
                    {/* Ring Binder Rings! */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[75%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                  </div>
                )}

                {/* Right Page Sheet (Only shown on Desktop, or on Mobile if no Left page) */}
                {!isMobile && (
                  <motion.div 
                    key={`right-sheet-${currentPage}`}
                    initial={
                      direction === 'next' 
                        ? { rotateY: -25, opacity: 0.85 } 
                        : { opacity: 0.9 }
                    }
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.85, ease: 'easeInOut' }}
                    style={{ 
                      transformOrigin: 'left center', 
                      transformPerspective: 1000,
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 27px, #e5e7eb 28px)',
                      lineHeight: '28px',
                      paddingTop: '28px',
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      boxShadow: 'inset 15px 0px 30px rgba(0,0,0,0.06)'
                    }}
                    className={`flex-1 h-full bg-[#fffefc] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden text-left`}
                  >
                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto pr-1 select-text scrollbar-thin">
                      {rightPageIndex < pages.length ? (
                        <>
                          {pages[rightPageIndex]?.chapterTitle && (
                            <div className="flex items-center gap-2 mb-4 text-[#ec4899] font-black uppercase text-xs md:text-sm tracking-wider">
                              <CornerDownRight className="w-4 h-4 text-black stroke-[3]" />
                              {pages[rightPageIndex].chapterTitle}
                            </div>
                          )}
                          <div 
                            className="text-sm md:text-base select-text" 
                            dangerouslySetInnerHTML={{ __html: pages[rightPageIndex]?.contentHtml || '' }}
                          />
                        </>
                      ) : (
                        /* Back cover details inside right sheet if last page is single */
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-yellow-50/20 border-2 border-black border-dashed rounded-xl">
                          <BookLogo className="w-14 h-14 mb-4" />
                          <h3 className="text-xl font-black mb-2 uppercase">The End</h3>
                          <p className="text-sm font-bold text-gray-500 max-w-xs leading-relaxed">
                            Thank you for reading "{book.title}"! Give this story a like or share it with fellow doodle lovers.
                          </p>
                          <div className="flex gap-3 mt-6">
                            <button className="p-3 bg-pink-100 hover:bg-pink-200 border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_#000]">
                              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                            </button>
                            <button className="p-3 bg-white hover:bg-gray-100 border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_#000]">
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Page Bottom Footer (Page Number) */}
                    <footer className="mt-4 pt-2 border-t border-black/10 flex justify-between items-center z-10 font-bold text-xs text-gray-500 uppercase bg-[#fffefc]">
                      <span className="bg-yellow-100 border border-black rounded-full px-2 py-0.5 text-black">
                        {rightPageIndex < pages.length ? `Page ${rightPageIndex + 1}` : 'FIN'}
                      </span>
                      <span>{book.pen_name}</span>
                    </footer>
                  </motion.div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Next page arrow */}
        <div className="absolute right-0 md:right-4 z-40">
          {hasNext && (
            <button
              onClick={handleNext}
              className={`w-12 h-12 md:w-16 md:h-16 bg-[#bbf7d0] text-black flex items-center justify-center font-black rounded-full border-3 border-black cursor-pointer shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] transition-all`}
            >
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
            </button>
          )}
        </div>

      </main>

      {/* Bottom status bar indicator */}
      <footer className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl mx-auto z-50 text-white gap-3 border-t border-white/20 pt-4 mt-auto">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span>📚 {pages.length} Pages parsed</span>
          {currentPage > 0 && (
            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 border border-zinc-700 rounded-full">
              Spread {isMobile ? `${currentPage} / ${pages.length}` : `${currentPage}-${Math.min(pages.length, currentPage + 1)} / ${pages.length}`}
            </span>
          )}
        </div>

        {/* Small quick navigation dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-md hide-scrollbar py-2 px-1">
          <button
            onClick={() => setCurrentPage(0)}
            className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${currentPage === 0 ? 'bg-pink-500 scale-125' : 'bg-zinc-600 hover:bg-zinc-400'}`}
            title="Cover Page"
          />
          {Array.from({ length: Math.ceil(pages.length / (isMobile ? 1 : 2)) }).map((_, index) => {
            const pageTarget = isMobile ? index + 1 : index * 2 + 1;
            const isActive = isMobile 
              ? currentPage === pageTarget 
              : (currentPage === pageTarget || currentPage === pageTarget + 1);

            return (
              <button
                key={index}
                onClick={() => {
                  setDirection(pageTarget > currentPage ? 'next' : 'prev');
                  setCurrentPage(pageTarget);
                }}
                className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${isActive ? 'bg-[#bbf7d0] scale-125' : 'bg-zinc-600 hover:bg-zinc-400'}`}
                title={`Spread ${pageTarget}`}
              />
            );
          })}
        </div>

        <div className="hidden md:flex gap-4 font-bold text-sm text-zinc-400 items-center">
          <span>💡 Use Left/Right arrow keys to flip</span>
        </div>
      </footer>

    </div>
  );
}
