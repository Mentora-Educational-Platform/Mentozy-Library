import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image, Palette, Highlighter, ZoomIn, ZoomOut, CheckSquare, Sparkles,
  FileText, Plus, Trash2, Download, Save, RefreshCw, Star, HelpCircle,
  Scissors, Type, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  BeeDoodle, CatDoodle, StarDoodle, BookLogo, 
  doodleBorder, doodleShadow, doodleHover, getPastelColor 
} from '../components/Doodles';

interface DocTab {
  id: string;
  title: string;
  content: string;
}

export default function WritingBoard() {
  const navigate = useNavigate();
  
  // Tabs State
  const [tabs, setTabs] = useState<DocTab[]>([
    { id: '1', title: 'Chapter 1: The Sketch', content: '<div>Once upon a time, in a world made entirely of doodles and crayon strokes, there lived a small ink drop named Inky...</div><div><br></div><div>Inky loved exploring the margins of notebooks. Every page was a new adventure, full of grid-lines, sketches of sleeping cats, and stars that hovered in the background...</div>' },
    { id: '2', title: 'Character Bios', content: '<h3>Inky the Inkdrop</h3><ul><li><b>Role:</b> Protagonist</li><li><b>Hobbies:</b> Running along lines, splashing onto margins</li><li><b>Favorite color:</b> Deep Violet</li></ul><h3>Catty the Sketch Cat</h3><ul><li><b>Role:</b> Wise Companion</li><li><b>Hobbies:</b> Napping on the top shelf, purring in monochrome</li></ul>' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [docTitle, setDocTitle] = useState<string>('My Awesome Story');
  const [isFavorite, setIsFavorite] = useState<boolean>(true);
  
  // View options
  const [zoom, setZoom] = useState<number>(100);
  const [paperStyle, setPaperStyle] = useState<'lined' | 'grid' | 'blank'>('lined');
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  
  // Tool states & dropdown toggles
  const [activeFont, setActiveFont] = useState<string>('Inter');
  const [activeSize, setActiveSize] = useState<number>(18);
  const [showFontDropdown, setShowFontDropdown] = useState<boolean>(false);
  const [showZoomDropdown, setShowZoomDropdown] = useState<boolean>(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState<boolean>(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState<boolean>(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState<boolean>(false);
  const [showInsertDropdown, setShowInsertDropdown] = useState<boolean>(false);
  
  // Menu bar toggles
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Font family options
  const fonts = [
    { name: 'Inter', css: 'font-sans' },
    { name: 'Playfair Display', css: 'font-serif' },
    { name: 'Courier Prime', css: 'font-mono' },
    { name: 'Comic Neue', css: '"Comic Sans MS", cursive' },
    { name: 'Outfit', css: '"Outfit", sans-serif' }
  ];

  // Load content of active tab into editable div
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = activeTab.content;
    }
  }, [activeTabId]);

  // Sync content from editable div to tabs state
  const handleContentChange = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, content: newHtml } : t));
    }
  };

  // Run native rich text formatting commands
  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  // Add new tab
  const handleAddTab = () => {
    const newId = Date.now().toString();
    const newTab: DocTab = {
      id: newId,
      title: `Tab ${tabs.length + 1}`,
      content: '<div>Start writing here...</div>'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    toast.success('New tab added!');
  };

  // Delete a tab
  const handleDeleteTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      toast.error('You must keep at least one tab!');
      return;
    }
    const filtered = tabs.filter(t => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
    toast.success('Tab deleted');
  };

  // Rename a tab
  const handleRenameTab = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setTabs(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  // Insert Custom Checklist
  const insertChecklist = () => {
    const checklistHtml = `
      <div class="flex items-center gap-3 my-2" contenteditable="false">
        <input type="checkbox" class="w-6 h-6 border-2 border-black rounded-none cursor-pointer accent-[#fbcfe8] hover:scale-105 transition-transform" />
        <span class="font-medium outline-none focus:ring-1 focus:ring-black" contenteditable="true">Checklist Item</span>
      </div>
    `;
    executeCommand('insertHTML', checklistHtml);
  };

  // Insert Stamp Doodles
  const insertDoodle = (doodleType: 'star' | 'cat' | 'bee') => {
    let svgHtml = '';
    if (doodleType === 'star') {
      svgHtml = `<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-10 h-10 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 50 10 Q 55 45 90 50 Q 55 55 50 90 Q 45 55 10 50 Q 45 45 50 10 Z" fill="#fef08a"/></svg></span>`;
    } else if (doodleType === 'cat') {
      svgHtml = `<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-12 h-10 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 80" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 20 60 Q 50 30 80 60" fill="#bfdbfe" /><circle cx="25" cy="50" r="14" fill="#bfdbfe" /><path d="M 15 45 L 10 25 L 25 40" fill="#bfdbfe" /><path d="M 25 40 L 35 25 L 35 45" fill="#bfdbfe" /><path d="M 18 52 Q 21 55 24 52" /><path d="M 28 52 Q 31 55 34 52" /><circle cx="28" cy="48" r="1.5" fill="#000" /></svg></span>`;
    } else if (doodleType === 'bee') {
      svgHtml = `<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-10 h-10 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="50" cy="50" rx="20" ry="15" fill="#fde047" /><path d="M 40 37 Q 45 50 40 63" /><path d="M 50 35 Q 55 50 50 65" /><path d="M 45 35 Q 30 10 50 20 Q 60 30 55 35" fill="#fff" /><circle cx="30" cy="50" r="8" fill="#fff" /><circle cx="28" cy="48" r="1.5" fill="#000" /></svg></span>`;
    }
    executeCommand('insertHTML', svgHtml + '&nbsp;');
    setShowInsertDropdown(false);
    toast.success(`${doodleType} doodle stamped!`);
  };

  // Insert Link Prompt
  const insertLink = () => {
    const url = prompt('Enter the link URL (e.g. https://example.com):');
    if (url) {
      executeCommand('createLink', url);
      toast.success('Link inserted!');
    }
  };

  // Insert Image Prompt
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
      toast.success('Image inserted!');
    }
  };

  // Menu bar functions
  const handleMenuClick = (menuName: string) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const closeMenus = () => {
    setActiveMenu(null);
  };

  // Calculations for stats
  const getStats = () => {
    let totalText = '';
    tabs.forEach(t => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = t.content;
      totalText += ' ' + (tempDiv.innerText || tempDiv.textContent || '');
    });

    const characters = totalText.replace(/\s/g, '').length;
    const words = totalText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const paragraphs = totalText.split('\n').filter(p => p.trim().length > 0).length;
    const readTime = Math.ceil(words / 200); // 200 words per minute average

    return { words, characters, paragraphs, readTime };
  };

  const handleExportText = () => {
    let fullContent = `Mentozy Library Document: ${docTitle}\n========================================\n\n`;
    tabs.forEach((t, i) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = t.content;
      const cleanText = tempDiv.innerText || tempDiv.textContent || '';
      fullContent += `Tab ${i+1}: ${t.title}\n----------------------------------------\n${cleanText}\n\n`;
    });

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}_draft.txt`;
    link.click();
    toast.success('Document exported as Text!');
    closeMenus();
  };

  const handleSaveToDashboard = () => {
    // Collect all stories into a consolidated HTML or Markdown
    let finalStory = '';
    tabs.forEach(t => {
      finalStory += `<h3>${t.title}</h3>\n${t.content}\n<hr/>\n`;
    });

    // Save in sessionStorage so dashboard can load it automatically
    sessionStorage.setItem('mentozy_draft_title', docTitle);
    sessionStorage.setItem('mentozy_draft_story', finalStory);

    toast.success('Draft saved and loaded into Creator Studio!');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="bg-[#f0ede6] min-h-screen font-sans flex flex-col relative overflow-hidden select-none" onClick={closeMenus}>
      
      {/* 1. TOP HEADER (Star, Title, Share, Save) */}
      <header className="bg-[#fffdfa] border-b-4 border-black px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-40 relative">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`w-12 h-12 bg-white text-black flex items-center justify-center ${doodleBorder} hover:bg-gray-100 ${doodleShadow} transition-all`}
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <BookLogo className="w-9 h-9" />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={docTitle} 
                onChange={(e) => setDocTitle(e.target.value)}
                className="font-black text-2xl bg-transparent border-b-2 border-transparent hover:border-black focus:border-black focus:bg-[#fef08a]/20 outline-none px-1 uppercase tracking-tight py-0.5"
                placeholder="Untitled Document"
              />
              <button 
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!');
                }}
                className="focus:outline-none"
              >
                <Star className={`w-6 h-6 transition-all hover:scale-125 ${isFavorite ? 'fill-[#fef08a] text-black' : 'text-gray-400'}`} />
              </button>
            </div>
            
            {/* GOOGLE DOCS STYLE MENU BAR */}
            <div className="flex items-center gap-4 text-sm font-bold text-gray-700 mt-1 pl-1">
              {[
                { name: 'File', items: [
                  { label: 'New Tab/Chapter', action: handleAddTab, icon: <Plus className="w-4 h-4"/> },
                  { label: 'Export as Text (.txt)', action: handleExportText, icon: <Download className="w-4 h-4"/> },
                  { label: 'Save & Close', action: handleSaveToDashboard, icon: <Save className="w-4 h-4"/> },
                  { label: 'Exit to Studio', action: () => navigate('/dashboard'), icon: <ArrowLeft className="w-4 h-4"/> }
                ]},
                { name: 'Edit', items: [
                  { label: 'Undo', action: () => executeCommand('undo'), icon: <RefreshCw className="w-4 h-4 transform -scale-x-100"/> },
                  { label: 'Redo', action: () => executeCommand('redo'), icon: <RefreshCw className="w-4 h-4"/> },
                  { label: 'Clear Formatting', action: () => executeCommand('removeFormat'), icon: <Scissors className="w-4 h-4"/> }
                ]},
                { name: 'View', items: [
                  { label: 'Zoom In (+)', action: () => setZoom(z => Math.min(z + 25, 200)), icon: <ZoomIn className="w-4 h-4"/> },
                  { label: 'Zoom Out (-)', action: () => setZoom(z => Math.max(z - 25, 50)), icon: <ZoomOut className="w-4 h-4"/> },
                  { label: 'Lined Background', action: () => setPaperStyle('lined'), active: paperStyle === 'lined' },
                  { label: 'Grid Background', action: () => setPaperStyle('grid'), active: paperStyle === 'grid' },
                  { label: 'Blank Background', action: () => setPaperStyle('blank'), active: paperStyle === 'blank' }
                ]},
                { name: 'Insert', items: [
                  { label: 'Preset Star Doodle', action: () => insertDoodle('star'), icon: <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> },
                  { label: 'Preset Cat Doodle', action: () => insertDoodle('cat'), icon: <Sparkles className="w-4 h-4 text-blue-500"/> },
                  { label: 'Preset Bee Doodle', action: () => insertDoodle('bee'), icon: <Sparkles className="w-4 h-4 text-yellow-600"/> },
                  { label: 'Insert Link', action: insertLink, icon: <Link2 className="w-4 h-4"/> },
                  { label: 'Insert Image URL', action: insertImage, icon: <Image className="w-4 h-4"/> }
                ]},
                { name: 'Format', items: [
                  { label: 'Bold', action: () => executeCommand('bold'), icon: <Bold className="w-4 h-4"/> },
                  { label: 'Italic', action: () => executeCommand('italic'), icon: <Italic className="w-4 h-4"/> },
                  { label: 'Underline', action: () => executeCommand('underline'), icon: <Underline className="w-4 h-4"/> },
                  { label: 'Strikethrough', action: () => executeCommand('strikeThrough'), icon: <Strikethrough className="w-4 h-4"/> }
                ]},
                { name: 'Tools', items: [
                  { label: 'Word & Page Stats', action: () => { setShowStatsModal(true); closeMenus(); }, icon: <Info className="w-4 h-4"/> }
                ]},
                { name: 'Help', items: [
                  { label: 'Doodle Board Guide', action: () => { setShowHelpModal(true); closeMenus(); }, icon: <HelpCircle className="w-4 h-4"/> }
                ]}
              ].map(menu => (
                <div key={menu.name} className="relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleMenuClick(menu.name)}
                    className={`px-3 py-1 rounded transition-colors hover:bg-gray-100 ${activeMenu === menu.name ? 'bg-black text-white hover:bg-black' : ''}`}
                  >
                    {menu.name}
                  </button>
                  
                  <AnimatePresence>
                    {activeMenu === menu.name && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute left-0 mt-2 bg-white text-black p-2 min-w-[220px] ${doodleBorder} ${doodleShadow} flex flex-col gap-1 z-50`}
                      >
                        {menu.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => { item.action(); closeMenus(); }}
                            className={`flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-[#fef08a] transition-all font-bold text-sm`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.active && <span className="ml-auto text-green-600 font-bold">✓</span>}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button 
            onClick={() => {
              const stats = getStats();
              toast.info(`Total Words: ${stats.words} across ${tabs.length} tab(s)`);
            }}
            className={`px-5 py-2.5 bg-[#bfdbfe] text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 ${doodleBorder} ${doodleHover} ${doodleShadow}`}
          >
            <Info className="w-4 h-4" /> Word Count
          </button>
          
          <button 
            onClick={handleSaveToDashboard}
            className={`px-6 py-2.5 bg-[#bbf7d0] text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 ${doodleBorder} ${doodleHover} ${doodleShadow}`}
          >
            <Save className="w-4 h-4" /> Save & Load to Studio
          </button>
        </div>
      </header>

      {/* 2. RICH TEXT TOOLBAR (Google Docs Mode but Doodle-fied) */}
      <section className="bg-white border-b-4 border-black p-3 flex flex-wrap items-center gap-2 z-30 relative shadow-sm">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('undo')} className="p-2 hover:bg-[#fbcfe8] rounded transition-all hover:scale-110" title="Undo">
            <RefreshCw className="w-5 h-5 transform -scale-x-100" />
          </button>
          <button onClick={() => executeCommand('redo')} className="p-2 hover:bg-[#fbcfe8] rounded transition-all hover:scale-110" title="Redo">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Text Styles Dropdown */}
        <div className="relative border-r-2 border-black pr-2 flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowStyleDropdown(!showStyleDropdown); }}
            className={`px-3 py-1.5 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50`}
          >
            Style <Type className="w-4 h-4"/>
          </button>
          
          {showStyleDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-2 flex flex-col gap-1 w-44 z-50`} onClick={() => setShowStyleDropdown(false)}>
              <button onClick={() => executeCommand('formatBlock', 'p')} className="px-3 py-2 text-left font-normal hover:bg-[#fef08a]">Normal text</button>
              <button onClick={() => executeCommand('formatBlock', 'h1')} className="px-3 py-2 text-left font-black text-2xl hover:bg-[#fef08a]">Heading 1</button>
              <button onClick={() => executeCommand('formatBlock', 'h2')} className="px-3 py-2 text-left font-black text-xl hover:bg-[#fef08a]">Heading 2</button>
              <button onClick={() => executeCommand('formatBlock', 'h3')} className="px-3 py-2 text-left font-bold text-lg hover:bg-[#fef08a]">Heading 3</button>
            </div>
          )}
        </div>

        {/* Font Family Dropdown */}
        <div className="relative border-r-2 border-black pr-2 flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowFontDropdown(!showFontDropdown); }}
            className={`px-3 py-1.5 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50 min-w-[120px] justify-between`}
          >
            <span>{activeFont}</span>
            <span className="text-xs">▼</span>
          </button>
          
          {showFontDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-2 flex flex-col gap-1 w-48 z-50`} onClick={() => setShowFontDropdown(false)}>
              {fonts.map(font => (
                <button 
                  key={font.name}
                  onClick={() => {
                    setActiveFont(font.name);
                    executeCommand('fontName', font.name);
                  }}
                  className={`px-3 py-2 text-left font-bold hover:bg-[#fef08a]`}
                  style={{ fontFamily: font.css.includes('"') ? font.css : 'inherit' }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size Controls */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button 
            onClick={() => {
              const newSize = Math.max(12, activeSize - 2);
              setActiveSize(newSize);
              executeCommand('fontSize', '4'); // Set to default size
            }} 
            className="p-2 hover:bg-[#bfdbfe] rounded transition-all font-black text-xl"
          >
            -
          </button>
          <span className="font-black text-md px-2 bg-gray-100 border-2 border-black py-0.5">{activeSize}</span>
          <button 
            onClick={() => {
              const newSize = Math.min(36, activeSize + 2);
              setActiveSize(newSize);
              executeCommand('fontSize', '6');
            }} 
            className="p-2 hover:bg-[#bfdbfe] rounded transition-all font-black text-xl"
          >
            +
          </button>
        </div>

        {/* Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('bold')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all" title="Bold"><Bold className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('italic')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all" title="Italic"><Italic className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('underline')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all" title="Underline"><Underline className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('strikeThrough')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all" title="Strikethrough"><Strikethrough className="w-5 h-5" /></button>
        </div>

        {/* Colors (Text & Highlight) */}
        <div className="flex items-center gap-2 border-r-2 border-black pr-2">
          {/* Text Color Picker */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTextColorPicker(!showTextColorPicker); setShowBgColorPicker(false); }}
              className="p-2 hover:bg-[#fed7aa] rounded flex items-center gap-1 transition-all"
              title="Text Color"
            >
              <Palette className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black">A</span>
            </button>
            {showTextColorPicker && (
              <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-3 flex flex-wrap gap-2 w-48 z-50`}>
                {['#000000', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'].map(color => (
                  <button 
                    key={color}
                    onClick={() => {
                      executeCommand('foreColor', color);
                      setShowTextColorPicker(false);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-black hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBgColorPicker(!showBgColorPicker); setShowTextColorPicker(false); }}
              className="p-2 hover:bg-[#fed7aa] rounded flex items-center gap-1 transition-all"
              title="Highlight Color"
            >
              <Highlighter className="w-5 h-5 text-yellow-500" />
            </button>
            {showBgColorPicker && (
              <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-3 flex flex-wrap gap-2 w-48 z-50`}>
                {['#ffffff', '#fbcfe8', '#bfdbfe', '#fef08a', '#bbf7d0', '#e9d5ff', '#fed7aa'].map(color => (
                  <button 
                    key={color}
                    onClick={() => {
                      executeCommand('hiliteColor', color);
                      setShowBgColorPicker(false);
                    }}
                    className="w-8 h-8 rounded-none border-2 border-black hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alignment Options */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('justifyLeft')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all" title="Align Left"><AlignLeft className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('justifyCenter')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all" title="Align Center"><AlignCenter className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('justifyRight')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all" title="Align Right"><AlignRight className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('justifyFull')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all" title="Justify"><AlignJustify className="w-5 h-5" /></button>
        </div>

        {/* Lists & Checklists */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('insertUnorderedList')} className="p-2 hover:bg-[#bfdbfe] rounded transition-all" title="Bulleted List"><List className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('insertOrderedList')} className="p-2 hover:bg-[#bfdbfe] rounded transition-all" title="Numbered List"><ListOrdered className="w-5 h-5" /></button>
          <button onClick={insertChecklist} className="p-2 hover:bg-[#bfdbfe] rounded transition-all" title="Checklist"><CheckSquare className="w-5 h-5" /></button>
        </div>

        {/* Insert Options */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2 relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowInsertDropdown(!showInsertDropdown); }}
            className={`px-3 py-1 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50`}
          >
            Insert Doodle <Sparkles className="w-4 h-4 text-purple-600" />
          </button>
          {showInsertDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-3 flex flex-col gap-2 w-48 z-50`}>
              <button onClick={() => insertDoodle('star')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#fef08a] w-full text-left font-bold text-sm">
                <StarDoodle className="w-5 h-5" /> Star Stamp
              </button>
              <button onClick={() => insertDoodle('cat')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#bfdbfe] w-full text-left font-bold text-sm">
                <CatDoodle className="w-6 h-5" /> Sleepy Cat Stamp
              </button>
              <button onClick={() => insertDoodle('bee')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#bbf7d0] w-full text-left font-bold text-sm">
                <BeeDoodle className="w-5 h-5" /> Honeybee Stamp
              </button>
            </div>
          )}
        </div>

        {/* Zoom Selector */}
        <div className="flex items-center gap-2 border-r-2 border-black pr-2 relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowZoomDropdown(!showZoomDropdown); }}
            className={`px-3 py-1 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50`}
          >
            Zoom {zoom}%
          </button>
          {showZoomDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-2 flex flex-col gap-1 w-24 z-50`} onClick={() => setShowZoomDropdown(false)}>
              {[50, 75, 100, 125, 150, 200].map(z => (
                <button key={z} onClick={() => setZoom(z)} className="px-3 py-1 text-left font-bold hover:bg-[#fef08a] w-full">{z}%</button>
              ))}
            </div>
          )}
        </div>

        {/* Paper Background Toggle */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPaperStyle(paperStyle === 'lined' ? 'grid' : paperStyle === 'grid' ? 'blank' : 'lined')} 
            className={`px-3 py-1.5 flex items-center gap-2 font-black text-xs ${doodleBorder} bg-[#fbcfe8] hover:scale-105 transition-transform`}
            title="Toggle Paper Style"
          >
            📝 {paperStyle === 'lined' ? 'Lined' : paperStyle === 'grid' ? 'Grid' : 'Blank'} Paper
          </button>
        </div>

      </section>

      {/* 3. MAIN WORKSPACE (Left Side Tabs Pane & Centered Document Sheet) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT TAB BAR */}
        <aside className="w-full md:w-64 bg-[#fffdfa] border-r-4 border-black flex flex-col p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-500" /> Document Tabs
            </h3>
            <button 
              onClick={handleAddTab}
              className={`p-2 bg-[#bbf7d0] hover:scale-110 transition-transform ${doodleBorder} ${doodleShadow}`}
              title="Add New Chapter/Tab"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {tabs.map((t, index) => {
              const isActive = t.id === activeTabId;
              const pastelColor = getPastelColor(index);
              
              return (
                <div 
                  key={t.id}
                  onClick={() => setActiveTabId(t.id)}
                  className={`group p-4 bg-white cursor-pointer transition-all flex items-center justify-between ${doodleBorder} ${isActive ? `${pastelColor} ${doodleShadow} -translate-y-1` : 'hover:bg-gray-50 border-gray-400'}`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <input 
                      type="text" 
                      value={t.title} 
                      onChange={(e) => handleRenameTab(t.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`font-black text-sm bg-transparent border-b border-transparent focus:border-black outline-none w-full ${isActive ? 'text-black' : 'text-gray-600'}`}
                    />
                  </div>
                  
                  <button 
                    onClick={(e) => handleDeleteTab(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 transition-opacity"
                    title="Delete Tab"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className={`mt-auto p-4 bg-[#fef08a] ${doodleBorder} text-xs font-bold text-gray-700 leading-snug`}>
            ✏️ <b>Protip:</b> Click any tab title to rename it! Double-click check boxes to toggle checklist items.
          </div>
        </aside>

        {/* MAIN CANVA SHEET AREA */}
        <main className="flex-1 overflow-auto p-8 flex justify-center items-start min-h-[calc(100vh-140px)]">
          <motion.div 
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top center',
              width: '850px'
            }}
            transition={{ duration: 0.2 }}
            className={`min-h-[1100px] bg-white relative p-16 flex flex-col ${doodleBorder} shadow-[15px_15px_0px_#000]`}
          >
            {/* Margins */}
            <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-red-400 opacity-60"></div>
            
            {/* Custom paper style textures */}
            {paperStyle === 'lined' && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #93c5fd 35px, #93c5fd 36px)',
                  lineHeight: '36px',
                  paddingTop: '64px'
                }}
              />
            )}

            {paperStyle === 'grid' && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
            )}

            {/* Title display on the physical page */}
            <div className="relative mb-10 pb-4 border-b-2 border-black border-dashed flex justify-between items-end">
              <div>
                <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Book Chapter Draft</span>
                <h2 className="text-3xl font-black">{activeTab.title}</h2>
              </div>
              <span className="text-xs font-bold bg-[#e9d5ff] px-2 py-1 border border-black uppercase">{paperStyle} paper</span>
            </div>

            {/* RICH CONTENT EDITABLE SHEET */}
            <div 
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className={`flex-1 outline-none font-medium text-lg min-h-[800px] relative z-10 w-full break-words`}
              style={{
                lineHeight: paperStyle === 'lined' ? '36px' : '28px',
                fontSize: `${activeSize}px`,
                fontFamily: fonts.find(f => f.name === activeFont)?.css || 'sans-serif'
              }}
            />

            {/* Physical Footer */}
            <div className="mt-16 pt-6 border-t-2 border-gray-200 flex justify-between text-xs font-bold text-gray-400 relative z-10">
              <span>{docTitle}</span>
              <span>Tab page {tabs.findIndex(t => t.id === activeTabId) + 1} of {tabs.length}</span>
            </div>

          </motion.div>
        </main>

      </div>

      {/* 4. STATS MODAL */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowStatsModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 1 }}
              className={`bg-white p-8 w-full max-w-md ${doodleBorder} ${doodleShadow} relative z-[101]`}
            >
              <button 
                onClick={() => setShowStatsModal(false)}
                className={`absolute -right-3 -top-3 w-10 h-10 bg-[#fbcfe8] text-black flex items-center justify-center font-black ${doodleBorder} hover:scale-110 transition-transform`}
              >
                x
              </button>
              
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-2">
                📊 Document Stats
              </h3>

              <div className="space-y-4 font-bold">
                {[
                  { label: 'Words Count', value: getStats().words },
                  { label: 'Characters (no spaces)', value: getStats().characters },
                  { label: 'Paragraphs', value: getStats().paragraphs },
                  { label: 'Estimated Read Time', value: `${getStats().readTime} min` }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between border-b-2 border-black border-dashed pb-2">
                    <span className="text-gray-500">{stat.label}</span>
                    <span className="text-black font-black">{stat.value}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowStatsModal(false)}
                className={`w-full mt-8 py-3 bg-[#bbf7d0] text-black font-black text-lg ${doodleBorder} ${doodleHover}`}
              >
                Awesome!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. HELP GUIDE MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowHelpModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
              className={`bg-white p-8 w-full max-w-lg ${doodleBorder} ${doodleShadow} relative z-[101] max-h-[90vh] overflow-y-auto`}
            >
              <button 
                onClick={() => setShowHelpModal(false)}
                className={`absolute -right-3 -top-3 w-10 h-10 bg-[#fbcfe8] text-black flex items-center justify-center font-black ${doodleBorder} hover:scale-110 transition-transform`}
              >
                x
              </button>
              
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-2">
                📘 Doodle Board Help
              </h3>

              <div className="space-y-4 font-bold text-sm leading-relaxed">
                <p>Welcome to your personal, highly interactive <b>Google-Docs styled hand-drawn editor</b>!</p>
                
                <h4 className="font-black text-md text-pink-500 mt-4 uppercase">Features:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><b>Multiple Tabs:</b> Organize your drafts into multiple chapters, notes, or sections on the left.</li>
                  <li><b>WYSIWYG Editing:</b> Simply select text and click B, I, U, alignment, font type, or change font size to style.</li>
                  <li><b>Stamp Doodles:</b> Click "Insert Doodle" in the toolbar to stamp a custom hand-drawn vector directly into your document!</li>
                  <li><b>Lined Paper backgrounds:</b> Click the Lined/Grid paper toggle to change your sheet type on-the-fly.</li>
                  <li><b>Export Drafts:</b> Under File Menu, click "Export as Text" to save your clean document to your computer.</li>
                  <li><b>Save & Import:</b> Click the green "Save & Load" button at the top-right to automatically carry your entire draft into the Creator Studio to publish it!</li>
                </ul>
              </div>

              <button 
                onClick={() => setShowHelpModal(false)}
                className={`w-full mt-8 py-3 bg-[#bfdbfe] text-black font-black text-lg ${doodleBorder} ${doodleHover}`}
              >
                Let's Write!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
