import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image, Palette, Highlighter, ZoomIn, ZoomOut, CheckSquare, Sparkles,
  FileText, Plus, Trash2, Download, Save, RefreshCw, Star, HelpCircle,
  Scissors, Type, Info, CornerDownRight, BookOpen, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  BeeDoodle, CatDoodle, StarDoodle, BookLogo, 
  doodleBorder, doodleShadow, doodleHover 
} from '../components/Doodles';

interface DocTab {
  id: string;
  title: string;
  content: string;
}

const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '<div>Start writing here...</div>';
  
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${trimmed.substring(4)}</h3>`;
    } else if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${trimmed.substring(3)}</h2>`;
    } else if (trimmed.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${trimmed.substring(2)}</h1>`;
    } else if (trimmed === '---') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<hr/>';
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      let itemText = trimmed.substring(2);
      itemText = itemText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      itemText = itemText.replace(/\*(.*?)\*/g, '<i>$1</i>');
      html += `<li>${itemText}</li>`;
    } else if (trimmed === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<div><br></div>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      let paraText = line;
      paraText = paraText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      paraText = paraText.replace(/\*(.*?)\*/g, '<i>$1</i>');
      paraText = paraText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 underline font-bold">$1</a>');
      paraText = paraText.replace(/⭐/g, '<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-10 h-10 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 50 10 Q 55 45 90 50 Q 55 55 50 90 Q 45 55 10 50 Q 45 45 50 10 Z" fill="#fef08a"/></svg></span>');
      paraText = paraText.replace(/🐱/g, '<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-12 h-10 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 80" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 20 60 Q 50 30 80 60" fill="#bfdbfe" /><circle cx="25" cy="50" r="14" fill="#bfdbfe" /><path d="M 15 45 L 10 25 L 25 40" fill="#bfdbfe" /><path d="M 25 40 L 35 25 L 35 45" fill="#bfdbfe" /><path d="M 18 52 Q 21 55 24 52" /><path d="M 28 52 Q 31 55 34 52" /><circle cx="28" cy="48" r="1.5" fill="#000" /></svg></span>');
      paraText = paraText.replace(/🐝/g, '<span contenteditable="false" style="display:inline-block; vertical-align:middle; margin:0 4px;" class="w-10 h-10 transform hover:scale-125 transition-transform"><svg viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="50" cy="50" rx="20" ry="15" fill="#fde047" /><path d="M 40 37 Q 45 50 40 63" /><path d="M 50 35 Q 55 50 50 65" /><path d="M 45 35 Q 30 10 50 20 Q 60 30 55 35" fill="#fff" /><circle cx="30" cy="50" r="8" fill="#fff" /><circle cx="28" cy="48" r="1.5" fill="#000" /></svg></span>');
      
      html += `<div>${paraText}</div>`;
    }
  });

  if (inList) { html += '</ul>'; }
  return html;
};

export default function WritingBoard() {
  const navigate = useNavigate();

  useEffect(() => {
    const isUnlocked = localStorage.getItem('mentozy_creator_unlocked') === 'true';
    if (!isUnlocked) {
      toast.error('Verification Required! Please enter your Mentozy Student Access Code first.');
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // Pages State (treated as Book tabs)
  const [tabs, setTabs] = useState<DocTab[]>(() => {
    const savedTabs = localStorage.getItem('mentozy_board_tabs');
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs);
      } catch (e) {
        console.error("Failed to parse saved tabs", e);
      }
    }
    return [
      { id: '1', title: 'Chapter 1: The Sketch', content: '<div>Once upon a time, in a world made entirely of doodles and crayon strokes, there lived a small ink drop named Inky...</div><div><br></div><div>Inky loved exploring the margins of notebooks. Every page was a new adventure, full of grid-lines, sketches of sleeping cats, and stars that hovered in the background...</div>' },
      { id: '2', title: 'Chapter 2: The Outline', content: '<h3>Inky the Inkdrop</h3><ul><li><b>Role:</b> Protagonist</li><li><b>Hobbies:</b> Running along lines, splashing onto margins</li><li><b>Favorite color:</b> Deep Violet</li></ul><h3>Catty the Sketch Cat</h3><ul><li><b>Role:</b> Wise Companion</li><li><b>Hobbies:</b> Napping on the top shelf, purring in monochrome</li></ul>' }
    ];
  });
  
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem('mentozy_board_title') || 'My Awesome Story';
  });
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

  // Immersive Skeuomorphic Book States
  const [currentPage, setCurrentPage] = useState<number>(0); // 0 = Cover Designer, 1 = Pages 1-2, 3 = Pages 3-4...
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [activeEditSide, setActiveEditSide] = useState<'left' | 'right'>('left');

  // Double Editor Refs
  const leftEditorRef = useRef<HTMLDivElement>(null);
  const rightEditorRef = useRef<HTMLDivElement>(null);

  // Book Cover Properties State
  const [coverUrl, setCoverUrl] = useState<string>(() => {
    return localStorage.getItem('mentozy_board_cover_url') || 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400&q=80';
  });
  const [coverBg, setCoverBg] = useState<string>(() => {
    return localStorage.getItem('mentozy_board_cover_bg') || 'linear-gradient(45deg, #fbcfe8, #fbcfe8 20px, #ec4899 20px, #ec4899 40px)';
  });
  const [category, setCategory] = useState<string>(() => {
    return localStorage.getItem('mentozy_board_category') || 'Story';
  });
  const [description, setDescription] = useState<string>(() => {
    return localStorage.getItem('mentozy_board_description') || 'A lovely doodle story in the making...';
  });
  const [penName, setPenName] = useState<string>(() => {
    return localStorage.getItem('mentozy_board_pen_name') || 'Doodle Creator';
  });

  // Cover Background Colors & Stripes Presets
  const coverBgOptions = [
    { name: 'Pink Stripes', value: 'linear-gradient(45deg, #fbcfe8, #fbcfe8 20px, #ec4899 20px, #ec4899 40px)' },
    { name: 'Blue Sky', value: 'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)' },
    { name: 'Mint Green', value: 'linear-gradient(to right, #bbf7d0, #10b981)' },
    { name: 'Sunset Yellow', value: 'linear-gradient(to bottom, #fef08a, #f59e0b)' },
    { name: 'Royal Purple', value: 'linear-gradient(to right, #e9d5ff, #8b5cf6)' },
    { name: 'Velvet Red', value: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
    { name: 'Slate Dark', value: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' },
    { name: 'Emerald', value: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)' }
  ];

  // Font family options
  const fonts = [
    { name: 'Inter', css: 'font-sans' },
    { name: 'Playfair Display', css: 'font-serif' },
    { name: 'Courier Prime', css: 'font-mono' },
    { name: 'Comic Neue', css: '"Comic Sans MS", cursive' },
    { name: 'Outfit', css: '"Outfit", sans-serif' }
  ];

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('mentozy_board_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('mentozy_board_title', docTitle);
  }, [docTitle]);

  useEffect(() => {
    localStorage.setItem('mentozy_board_cover_url', coverUrl);
  }, [coverUrl]);

  useEffect(() => {
    localStorage.setItem('mentozy_board_cover_bg', coverBg);
  }, [coverBg]);

  useEffect(() => {
    localStorage.setItem('mentozy_board_category', category);
  }, [category]);

  useEffect(() => {
    localStorage.setItem('mentozy_board_description', description);
  }, [description]);

  useEffect(() => {
    localStorage.setItem('mentozy_board_pen_name', penName);
  }, [penName]);

  // Load / Import from Dashboard (passed via sessionStorage)
  useEffect(() => {
    const importTitle = sessionStorage.getItem('mentozy_draft_title');
    const importStory = sessionStorage.getItem('mentozy_draft_story');
    const importCoverUrl = sessionStorage.getItem('mentozy_draft_cover_url');
    const importCoverBg = sessionStorage.getItem('mentozy_draft_cover_bg');
    const importCategory = sessionStorage.getItem('mentozy_draft_category');
    const importDescription = sessionStorage.getItem('mentozy_draft_description');
    const importPenName = sessionStorage.getItem('mentozy_draft_pen_name');

    if (importTitle) {
      setDocTitle(importTitle);
      sessionStorage.removeItem('mentozy_draft_title');
    }
    if (importCoverUrl) {
      setCoverUrl(importCoverUrl);
      sessionStorage.removeItem('mentozy_draft_cover_url');
    }
    if (importCoverBg) {
      setCoverBg(importCoverBg);
      sessionStorage.removeItem('mentozy_draft_cover_bg');
    }
    if (importCategory) {
      setCategory(importCategory);
      sessionStorage.removeItem('mentozy_draft_category');
    }
    if (importDescription) {
      setDescription(importDescription);
      sessionStorage.removeItem('mentozy_draft_description');
    }
    if (importPenName) {
      setPenName(importPenName);
      sessionStorage.removeItem('mentozy_draft_pen_name');
    }

    if (importStory) {
      sessionStorage.removeItem('mentozy_draft_story');

      // Reconstruct tabs from the consolidated markdown
      const sections = importStory.split(/\n\s*---\s*\n|\n---\n/);
      const parsedTabs: DocTab[] = [];

      sections.forEach((section, idx) => {
        const trimmedSection = section.trim();
        if (!trimmedSection) return;

        let tabTitle = `Chapter ${idx + 1}`;
        let contentMarkdown = trimmedSection;

        const headerMatch = trimmedSection.match(/^###\s+(.+)$/m);
        if (headerMatch) {
          tabTitle = headerMatch[1].trim();
          contentMarkdown = trimmedSection.replace(/^###\s+.+$/m, '').trim();
        }

        const htmlContent = convertMarkdownToHtml(contentMarkdown);
        parsedTabs.push({
          id: (Date.now() + idx).toString(),
          title: tabTitle,
          content: htmlContent
        });
      });

      if (parsedTabs.length > 0) {
        setTabs(parsedTabs);
        toast.success('Successfully imported draft into the Writing Board! 📝');
      }
    }
  }, []);

  // Sync double-page editor content on current page or tab count changes (prevents typing cursor jumps)
  useEffect(() => {
    const leftIdx = currentPage - 1;
    const rightIdx = currentPage;

    if (leftEditorRef.current && leftIdx >= 0 && leftIdx < tabs.length) {
      leftEditorRef.current.innerHTML = tabs[leftIdx].content;
    }
    if (rightEditorRef.current && rightIdx >= 0 && rightIdx < tabs.length) {
      rightEditorRef.current.innerHTML = tabs[rightIdx].content;
    }
  }, [currentPage, tabs.length]);

  // Sync typing inside Left Page Editor
  const handleLeftContentChange = () => {
    if (leftEditorRef.current) {
      const newHtml = leftEditorRef.current.innerHTML;
      const leftIdx = currentPage - 1;
      if (leftIdx >= 0 && leftIdx < tabs.length) {
        setTabs(prev => prev.map((t, i) => i === leftIdx ? { ...t, content: newHtml } : t));
      }
    }
  };

  // Sync typing inside Right Page Editor
  const handleRightContentChange = () => {
    if (rightEditorRef.current) {
      const newHtml = rightEditorRef.current.innerHTML;
      const rightIdx = currentPage;
      if (rightIdx >= 0 && rightIdx < tabs.length) {
        setTabs(prev => prev.map((t, i) => i === rightIdx ? { ...t, content: newHtml } : t));
      }
    }
  };

  // Run native rich text formatting commands on currently active editor side
  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (activeEditSide === 'left') {
      handleLeftContentChange();
      leftEditorRef.current?.focus();
    } else {
      handleRightContentChange();
      rightEditorRef.current?.focus();
    }
  };

  // Add new tab/page
  const handleAddTab = () => {
    const newId = Date.now().toString();
    const newTab: DocTab = {
      id: newId,
      title: `Page ${tabs.length + 1}`,
      content: '<div>Start writing here...</div>'
    };
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    
    // Jump to new spread
    const pageNum = updatedTabs.length;
    const targetPage = pageNum % 2 === 0 ? pageNum - 1 : pageNum;
    setDirection('next');
    setCurrentPage(targetPage);
    toast.success('New inside page added to your book! 📝');
  };

  // Delete page
  const handleDeleteTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      toast.error('Your book must have at least one inside page!');
      return;
    }
    
    if (confirm('Are you sure you want to delete this page?')) {
      const filtered = tabs.filter(t => t.id !== id);
      setTabs(filtered);

      // Adjust currentPage if it goes out of bounds
      if (currentPage > filtered.length) {
        const targetPage = filtered.length % 2 === 0 ? filtered.length - 1 : filtered.length;
        setCurrentPage(Math.max(1, targetPage));
      }
      toast.success('Page deleted from book');
    }
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
    let fullContent = `Mentozy Library Document: ${docTitle}\nAuthor: ${penName}\nCategory: ${category}\nDescription: ${description}\n========================================\n\n`;
    tabs.forEach((t, i) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = t.content;
      const cleanText = tempDiv.innerText || tempDiv.textContent || '';
      fullContent += `Page ${i+1}: ${t.title}\n----------------------------------------\n${cleanText}\n\n`;
    });

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}_draft.txt`;
    link.click();
    toast.success('Book exported as Text!');
    closeMenus();
  };

  const nodeToMarkdown = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Recursively process children
    let childrenContent = '';
    element.childNodes.forEach(child => {
      childrenContent += nodeToMarkdown(child);
    });

    switch (tagName) {
      case 'h1':
        return `\n# ${childrenContent.trim()}\n\n`;
      case 'h2':
        return `\n## ${childrenContent.trim()}\n\n`;
      case 'h3':
        return `\n### ${childrenContent.trim()}\n\n`;
      case 'h4':
        return `\n#### ${childrenContent.trim()}\n\n`;
      case 'b':
      case 'strong':
        return `**${childrenContent}**`;
      case 'i':
      case 'em':
        return `*${childrenContent}*`;
      case 'u':
        return `__${childrenContent}__`;
      case 's':
      case 'del':
      case 'strike':
        return `~~${childrenContent}~~`;
      case 'br':
        return '\n';
      case 'p':
      case 'div':
        if (childrenContent.trim() === '' && element.querySelector('br')) {
          return '\n';
        }
        return `${childrenContent}\n`;
      case 'li':
        return `- ${childrenContent.trim()}\n`;
      case 'ul':
      case 'ol':
        return `\n${childrenContent}\n`;
      case 'hr':
        return '\n---\n';
      case 'span':
        if (element.classList.contains('transform') || element.querySelector('svg')) {
          if (element.innerHTML.includes('fill="#fef08a"') || element.innerHTML.includes('Star Stamp') || element.innerHTML.includes('star')) {
            return '⭐';
          } else if (element.innerHTML.includes('fill="#bfdbfe"') || element.innerHTML.includes('Cat Stamp') || element.innerHTML.includes('cat')) {
            return '🐱';
          } else if (element.innerHTML.includes('fill="#fde047"') || element.innerHTML.includes('Bee Stamp') || element.innerHTML.includes('bee')) {
            return '🐝';
          }
        }
        return childrenContent;
      case 'a':
        const href = element.getAttribute('href') || '';
        return `[${childrenContent}](${href})`;
      case 'img':
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || 'image';
        return `![${alt}](${src})`;
      default:
        return childrenContent;
    }
  };

  const handleSaveToDashboard = () => {
    // Collect all stories into a consolidated clean Markdown/text draft
    let finalStory = '';
    tabs.forEach((t, index) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = t.content;
      const cleanMarkdown = nodeToMarkdown(tempDiv).trim();

      // Format as Markdown with headers and page separators
      finalStory += `### ${t.title}\n\n${cleanMarkdown}\n\n${index < tabs.length - 1 ? '---\n\n' : ''}`;
    });

    // Save in sessionStorage so dashboard can load it automatically
    sessionStorage.setItem('mentozy_draft_title', docTitle);
    sessionStorage.setItem('mentozy_draft_story', finalStory.trim());
    sessionStorage.setItem('mentozy_draft_cover_url', coverUrl);
    sessionStorage.setItem('mentozy_draft_cover_bg', coverBg);
    sessionStorage.setItem('mentozy_draft_category', category);
    sessionStorage.setItem('mentozy_draft_description', description);
    sessionStorage.setItem('mentozy_draft_pen_name', penName);

    toast.success('Draft saved successfully! Returning to Dashboard... 📁');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  // Navigations
  const handleNext = () => {
    if (currentPage === 0) {
      setDirection('next');
      setCurrentPage(1);
    } else {
      if (currentPage + 2 <= tabs.length) {
        setDirection('next');
        setCurrentPage(currentPage + 2);
      } else if (currentPage + 1 <= tabs.length) {
        setDirection('next');
        setCurrentPage(currentPage + 2); // Triggers "The End" view
      }
    }
  };

  const handlePrev = () => {
    if (currentPage === 0) return;
    setDirection('prev');
    if (currentPage === 1) {
      setCurrentPage(0);
    } else {
      setCurrentPage(Math.max(1, currentPage - 2));
    }
  };

  const leftIdx = currentPage - 1;
  const rightIdx = currentPage;

  const hasNext = currentPage === 0 
    ? tabs.length > 0 
    : (currentPage < tabs.length);

  const hasPrev = currentPage > 0;

  return (
    <div className="bg-[#f0ede6] min-h-screen font-sans flex flex-col relative overflow-hidden select-none" onClick={closeMenus}>
      
      {/* 1. TOP HEADER (Star, Title, Share, Save) */}
      <header className="bg-[#fffdfa] border-b-4 border-black px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-40 relative">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`w-12 h-12 bg-white text-black flex items-center justify-center ${doodleBorder} hover:bg-gray-100 ${doodleShadow} transition-all cursor-pointer`}
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
                className="focus:outline-none cursor-pointer"
              >
                <Star className={`w-6 h-6 transition-all hover:scale-125 ${isFavorite ? 'fill-[#fef08a] text-black' : 'text-gray-400'}`} />
              </button>
            </div>
            
            {/* GOOGLE DOCS STYLE MENU BAR */}
            <div className="flex items-center gap-4 text-sm font-bold text-gray-700 mt-1 pl-1">
              {[
                { name: 'File', items: [
                  { label: 'New Page', action: handleAddTab, icon: <Plus className="w-4 h-4"/> },
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
                    className={`px-3 py-1 rounded transition-colors hover:bg-gray-100 cursor-pointer ${activeMenu === menu.name ? 'bg-black text-white hover:bg-black' : ''}`}
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
                            className={`flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-[#fef08a] transition-all font-bold text-sm cursor-pointer`}
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
              toast.info(`Total Words: ${stats.words} across ${tabs.length} page(s)`);
            }}
            className={`px-5 py-2.5 bg-[#bfdbfe] text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 ${doodleBorder} ${doodleHover} ${doodleShadow} cursor-pointer`}
          >
            <Info className="w-4 h-4" /> Word Count
          </button>
          
          <button 
            onClick={handleSaveToDashboard}
            className={`px-6 py-2.5 bg-[#bbf7d0] text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 ${doodleBorder} ${doodleHover} ${doodleShadow} cursor-pointer`}
          >
            <Save className="w-4 h-4" /> Save & Load to Studio
          </button>
        </div>
      </header>

      {/* 2. RICH TEXT TOOLBAR */}
      <section className="bg-white border-b-4 border-black p-3 flex flex-wrap items-center gap-2 z-30 relative shadow-sm">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('undo')} className="p-2 hover:bg-[#fbcfe8] rounded transition-all hover:scale-110 cursor-pointer" title="Undo">
            <RefreshCw className="w-5 h-5 transform -scale-x-100" />
          </button>
          <button onClick={() => executeCommand('redo')} className="p-2 hover:bg-[#fbcfe8] rounded transition-all hover:scale-110 cursor-pointer" title="Redo">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Text Styles Dropdown */}
        <div className="relative border-r-2 border-black pr-2 flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowStyleDropdown(!showStyleDropdown); }}
            className={`px-3 py-1.5 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50 cursor-pointer`}
          >
            Style <Type className="w-4 h-4"/>
          </button>
          
          {showStyleDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-2 flex flex-col gap-1 w-44 z-50`} onClick={() => setShowStyleDropdown(false)}>
              <button onClick={() => executeCommand('formatBlock', 'p')} className="px-3 py-2 text-left font-normal hover:bg-[#fef08a] cursor-pointer">Normal text</button>
              <button onClick={() => executeCommand('formatBlock', 'h1')} className="px-3 py-2 text-left font-black text-2xl hover:bg-[#fef08a] cursor-pointer">Heading 1</button>
              <button onClick={() => executeCommand('formatBlock', 'h2')} className="px-3 py-2 text-left font-black text-xl hover:bg-[#fef08a] cursor-pointer">Heading 2</button>
              <button onClick={() => executeCommand('formatBlock', 'h3')} className="px-3 py-2 text-left font-bold text-lg hover:bg-[#fef08a] cursor-pointer">Heading 3</button>
            </div>
          )}
        </div>

        {/* Font Family Dropdown */}
        <div className="relative border-r-2 border-black pr-2 flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowFontDropdown(!showFontDropdown); }}
            className={`px-3 py-1.5 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50 min-w-[120px] justify-between cursor-pointer`}
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
                  className={`px-3 py-2 text-left font-bold hover:bg-[#fef08a] cursor-pointer`}
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
              executeCommand('fontSize', '4');
            }} 
            className="p-2 hover:bg-[#bfdbfe] rounded transition-all font-black text-xl cursor-pointer"
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
            className="p-2 hover:bg-[#bfdbfe] rounded transition-all font-black text-xl cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('bold')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all cursor-pointer" title="Bold"><Bold className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('italic')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all cursor-pointer" title="Italic"><Italic className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('underline')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all cursor-pointer" title="Underline"><Underline className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('strikeThrough')} className="p-2 hover:bg-[#bbf7d0] rounded transition-all cursor-pointer" title="Strikethrough"><Strikethrough className="w-5 h-5" /></button>
        </div>

        {/* Colors (Text & Highlight) */}
        <div className="flex items-center gap-2 border-r-2 border-black pr-2">
          {/* Text Color Picker */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTextColorPicker(!showTextColorPicker); setShowBgColorPicker(false); }}
              className="p-2 hover:bg-[#fed7aa] rounded flex items-center gap-1 transition-all cursor-pointer"
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
                    className="w-8 h-8 rounded-full border-2 border-black hover:scale-110 transition-transform shadow-sm cursor-pointer"
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
              className="p-2 hover:bg-[#fed7aa] rounded flex items-center gap-1 transition-all cursor-pointer"
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
                    className="w-8 h-8 rounded-none border-2 border-black hover:scale-110 transition-transform shadow-sm cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alignment Options */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('justifyLeft')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all cursor-pointer" title="Align Left"><AlignLeft className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('justifyCenter')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all cursor-pointer" title="Align Center"><AlignCenter className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('justifyRight')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all cursor-pointer" title="Align Right"><AlignRight className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('justifyFull')} className="p-2 hover:bg-[#e9d5ff] rounded transition-all cursor-pointer" title="Justify"><AlignJustify className="w-5 h-5" /></button>
        </div>

        {/* Lists & Checklists */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2">
          <button onClick={() => executeCommand('insertUnorderedList')} className="p-2 hover:bg-[#bfdbfe] rounded transition-all cursor-pointer" title="Bulleted List"><List className="w-5 h-5" /></button>
          <button onClick={() => executeCommand('insertOrderedList')} className="p-2 hover:bg-[#bfdbfe] rounded transition-all cursor-pointer" title="Numbered List"><ListOrdered className="w-5 h-5" /></button>
          <button onClick={insertChecklist} className="p-2 hover:bg-[#bfdbfe] rounded transition-all cursor-pointer" title="Checklist"><CheckSquare className="w-5 h-5" /></button>
        </div>

        {/* Insert Options */}
        <div className="flex items-center gap-1 border-r-2 border-black pr-2 relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowInsertDropdown(!showInsertDropdown); }}
            className={`px-3 py-1 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50 cursor-pointer`}
          >
            Insert Doodle <Sparkles className="w-4 h-4 text-purple-600" />
          </button>
          {showInsertDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-3 flex flex-col gap-2 w-48 z-50`}>
              <button onClick={() => insertDoodle('star')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#fef08a] w-full text-left font-bold text-sm cursor-pointer">
                <StarDoodle className="w-5 h-5" /> Star Stamp
              </button>
              <button onClick={() => insertDoodle('cat')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#bfdbfe] w-full text-left font-bold text-sm cursor-pointer">
                <CatDoodle className="w-6 h-5" /> Sleepy Cat Stamp
              </button>
              <button onClick={() => insertDoodle('bee')} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#bbf7d0] w-full text-left font-bold text-sm cursor-pointer">
                <BeeDoodle className="w-5 h-5" /> Honeybee Stamp
              </button>
            </div>
          )}
        </div>

        {/* Zoom Selector */}
        <div className="flex items-center gap-2 border-r-2 border-black pr-2 relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowZoomDropdown(!showZoomDropdown); }}
            className={`px-3 py-1 flex items-center gap-2 font-black text-sm ${doodleBorder} bg-white hover:bg-gray-50 cursor-pointer`}
          >
            Zoom {zoom}%
          </button>
          {showZoomDropdown && (
            <div className={`absolute left-0 top-12 bg-white ${doodleBorder} ${doodleShadow} p-2 flex flex-col gap-1 w-24 z-50`} onClick={() => setShowZoomDropdown(false)}>
              {[50, 75, 100, 125, 150, 200].map(z => (
                <button key={z} onClick={() => setZoom(z)} className="px-3 py-1 text-left font-bold hover:bg-[#fef08a] w-full cursor-pointer">{z}%</button>
              ))}
            </div>
          )}
        </div>

        {/* Paper Background Toggle */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPaperStyle(paperStyle === 'lined' ? 'grid' : paperStyle === 'grid' ? 'blank' : 'lined')} 
            className={`px-3 py-1.5 flex items-center gap-2 font-black text-xs ${doodleBorder} bg-[#fbcfe8] hover:scale-105 transition-transform cursor-pointer`}
            title="Toggle Paper Style"
          >
            📝 {paperStyle === 'lined' ? 'Lined' : paperStyle === 'grid' ? 'Grid' : 'Blank'} Paper
          </button>
        </div>

      </section>

      {/* 3. MAIN WORKSPACE (Double page skeuomorphic binder editor) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT SIDEBAR OUTLINE */}
        <aside className="w-full md:w-64 bg-[#fffdfa] border-r-4 border-black flex flex-col p-4 overflow-y-auto z-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-500" /> Book Outline
            </h3>
            <button 
              onClick={handleAddTab}
              className={`p-2 bg-[#bbf7d0] hover:scale-110 transition-transform ${doodleBorder} ${doodleShadow} cursor-pointer`}
              title="Add Page"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {/* Book Cover Outline Element */}
            <div 
              onClick={() => {
                setDirection(currentPage > 0 ? 'prev' : 'next');
                setCurrentPage(0);
              }}
              className={`group p-3 bg-white cursor-pointer transition-all flex items-center gap-3 ${doodleBorder} ${currentPage === 0 ? 'bg-[#fbcfe8] shadow-[4px_4px_0px_#000] -translate-y-1' : 'hover:bg-gray-50 border-gray-400'}`}
            >
              <div className="w-3 h-3 rounded-full bg-pink-500 border border-black"></div>
              <span className="font-black text-sm text-black">📙 Book Cover</span>
            </div>

            {/* Dynamic inside pages sequence */}
            {tabs.map((t, index) => {
              const pageNum = index + 1;
              const activeLeftIdx = currentPage - 1;
              const activeRightIdx = currentPage;
              const isActive = currentPage > 0 && (pageNum === activeLeftIdx + 1 || pageNum === activeRightIdx + 1);
              
              return (
                <div 
                  key={t.id}
                  onClick={() => {
                    const targetPage = pageNum % 2 === 0 ? pageNum - 1 : pageNum;
                    setDirection(targetPage > currentPage ? 'next' : 'prev');
                    setCurrentPage(targetPage);
                  }}
                  className={`group p-3 bg-white cursor-pointer transition-all flex items-center justify-between ${doodleBorder} ${isActive ? 'bg-[#bfdbfe] shadow-[4px_4px_0px_#000] -translate-y-1' : 'hover:bg-gray-50 border-gray-400'}`}
                >
                  <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400">P.{pageNum}</span>
                    <input 
                      type="text" 
                      value={t.title} 
                      onChange={(e) => handleRenameTab(t.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`font-black text-sm bg-transparent border-b border-transparent focus:border-black outline-none w-full ${isActive ? 'text-black font-black' : 'text-gray-600'}`}
                    />
                  </div>
                  
                  <button 
                    onClick={(e) => handleDeleteTab(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 transition-opacity cursor-pointer"
                    title="Delete Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className={`mt-auto p-4 bg-[#fef08a] ${doodleBorder} text-xs font-bold text-gray-700 leading-snug`}>
            ✏️ <b>Protip:</b> Click any page title in the sidebar or book sheet to rename it!
          </div>
        </aside>

        {/* MAIN CANVA SKEUOMORPHIC WOOD SPACE */}
        <main className="flex-1 overflow-auto p-4 md:p-8 flex flex-col justify-center items-center bg-[#5c2d13] relative min-h-[calc(100vh-140px)]">
          
          {/* Back to cover indicator */}
          {currentPage > 0 && (
            <button
              onClick={() => {
                setDirection('prev');
                setCurrentPage(0);
              }}
              className={`absolute top-4 left-6 px-4 py-2 bg-white text-black font-black text-xs uppercase tracking-wider ${doodleBorder} ${doodleHover} ${doodleShadow} cursor-pointer z-30`}
            >
              📙 Cover Designer
            </button>
          )}

          {/* Left Navigation Arrow */}
          <div className="absolute left-4 md:left-8 z-40">
            {hasPrev && (
              <button
                onClick={handlePrev}
                className={`w-12 h-12 md:w-16 md:h-16 bg-[#fed7aa] text-black flex items-center justify-center font-black rounded-full border-3 border-black cursor-pointer shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] transition-all`}
              >
                <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
              </button>
            )}
          </div>

          {/* SKEUOMORPHIC BINDER WRAPPER */}
          <div 
            className="relative w-full max-w-5xl h-[78vh] bg-[#854d0e] rounded-2xl p-3 border-4 border-black flex shadow-[25px_25px_0px_#000]"
            style={{
              backgroundImage: 'radial-gradient(circle, #a16207 0%, #713f12 100%)',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
              perspective: '1200px'
            }}
          >
            {/* Ribbon bookmark hanging down */}
            <div className="absolute top-0 left-[50%] -translate-x-[50%] w-6 h-36 bg-pink-500 border-2 border-t-0 border-black rounded-b-lg shadow-md z-30 transform -rotate-2">
              <div className="absolute bottom-2 left-0 right-0 h-3 bg-pink-600/40 rounded-b-lg"></div>
            </div>

            {/* Pages Stacked Thickness Shadows */}
            <div className="absolute right-3 bottom-0 w-[96%] h-2 bg-white/90 border-b-2 border-black rounded-b transform translate-y-1 z-0 shadow-sm"></div>
            <div className="absolute right-5 bottom-0 w-[92%] h-4 bg-white/70 border-b-2 border-black rounded-b transform translate-y-2 z-0 opacity-70"></div>

            <AnimatePresence mode="wait" custom={direction}>
              {currentPage === 0 ? (
                
                /* ================= SPREAD 0: BOOK COVER DESIGNER ================= */
                <div key="cover-designer-spread" className="w-full h-full flex z-10">
                  
                  {/* Left Settings Panel */}
                  <motion.div 
                    key="cover-settings-sheet"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      boxShadow: 'inset -15px 0px 30px rgba(0,0,0,0.06)'
                    }}
                    className="flex-1 h-full bg-[#fffdfa] p-6 md:p-8 flex flex-col justify-between overflow-y-auto text-left border-r-2 border-dashed border-gray-300"
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 border-b-2 border-black pb-2 mb-4">
                        🎨 Cover Designer Settings
                      </h3>
                      
                      {/* Pen Name */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500">Pen Name / Author</label>
                        <input 
                          type="text"
                          value={penName}
                          onChange={(e) => setPenName(e.target.value)}
                          className={`px-3 py-2 bg-white ${doodleBorder} border-2 border-black font-bold outline-none focus:bg-[#fef08a]/20 w-full text-sm`}
                          placeholder="Doodle Creator"
                        />
                      </div>

                      {/* Cover Image URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500">Cover Image URL</label>
                        <input 
                          type="text"
                          value={coverUrl}
                          onChange={(e) => setCoverUrl(e.target.value)}
                          className={`px-3 py-2 bg-white ${doodleBorder} border-2 border-black font-bold outline-none focus:bg-[#fef08a]/20 w-full text-sm`}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>

                      {/* Category Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500">Category Tag</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`px-3 py-2 bg-white ${doodleBorder} border-2 border-black font-bold outline-none focus:bg-[#fef08a]/20 w-full text-sm cursor-pointer`}
                        >
                          {['Story', 'Education', 'Science', 'Math', 'History', 'Art', 'Nature'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Description / Synopsis */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500">Book Synopsis</label>
                        <textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className={`px-3 py-2 bg-white ${doodleBorder} border-2 border-black font-bold outline-none focus:bg-[#fef08a]/20 w-full text-sm resize-none`}
                          placeholder="A lovely doodle story in the making..."
                        />
                      </div>

                      {/* Color Background Preset Circle Choices */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500">Choose Cover Theme</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {coverBgOptions.map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setCoverBg(opt.value);
                                setCoverUrl(''); // Clear image if selecting preset pattern
                              }}
                              className={`w-8 h-8 rounded-full border-2 border-black hover:scale-110 active:scale-90 transition-all cursor-pointer ${coverBg === opt.value && !coverUrl ? 'ring-2 ring-pink-500 ring-offset-1 scale-110' : ''}`}
                              style={{ background: opt.value }}
                              title={opt.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <footer className="mt-4 pt-2 border-t border-black/10 text-xs font-bold text-gray-400 uppercase">
                      Settings Sheet
                    </footer>
                  </motion.div>

                  {/* Center Metal Spine Binder */}
                  <div className="w-5 bg-gradient-to-r from-black/20 via-black/5 to-black/20 border-l border-r border-black/10 h-full relative z-20 shadow-inner">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[75%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                  </div>

                  {/* Right Hardcover Preview */}
                  <motion.div 
                    key="cover-preview-sheet"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      boxShadow: 'inset 15px 0px 30px rgba(0,0,0,0.06)'
                    }}
                    className="flex-1 h-full bg-[#fffdfa] p-6 md:p-8 flex flex-col justify-center items-center overflow-y-auto"
                  >
                    <div 
                      className={`relative w-[280px] sm:w-[315px] h-[92%] bg-[#ec4899] ${doodleBorder} border-[4px] border-black flex flex-col justify-between p-6 select-none text-left shadow-[8px_8px_0px_#000]`}
                      style={{
                        backgroundImage: coverUrl ? `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 10%, transparent 15%), url(${coverUrl})` : 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 8%), ' + coverBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/35 to-transparent"></div>

                      <div className="space-y-3 relative z-10 bg-black/75 p-4 border-2 border-white rounded-lg backdrop-blur-sm shadow-md text-white">
                        <span className="text-[9px] font-black bg-pink-500 text-white px-2.5 py-0.5 border border-white uppercase tracking-wider">
                          {category || 'Story'}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black leading-tight text-yellow-300 font-serif uppercase tracking-tight line-clamp-2">
                          {docTitle || 'Untitled Book'}
                        </h1>
                        <p className="text-xs font-bold text-pink-200">
                          By <span className="underline decoration-pink-400 font-black text-white">{penName || 'Doodle Creator'}</span>
                        </p>
                      </div>

                      <div className="space-y-3 relative z-10">
                        {description && (
                          <div className="bg-white border-2 border-black p-3 text-black text-xs font-bold shadow-[3px_3px_0px_#000] rotate-1 relative rounded-lg line-clamp-3 leading-relaxed">
                            <div className="absolute -top-2.5 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                            {description}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleNext}
                          className={`w-full py-2.5 bg-[#bbf7d0] text-black font-black text-md flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer`}
                        >
                          Open Book <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>

                </div>

              ) : (

                /* ================= SPREAD 1+: DOUBLE-PAGE CREATOR SHEETS ================= */
                <div key="pages-spread" className="w-full h-full flex z-10">
                  
                  {/* Left Page Sheet */}
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
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      boxShadow: 'inset -15px 0px 30px rgba(0,0,0,0.06)'
                    }}
                    className="flex-1 h-full bg-[#fffefc] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden text-left border-r-2 border-dashed border-gray-300"
                  >
                    {/* Paper background texture */}
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

                    {/* Lined Margin line */}
                    <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-red-300 opacity-60"></div>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto pr-1 select-text scrollbar-thin relative z-10">
                      {/* Chapter Title Edit Header */}
                      <div className="mb-4 pb-1 border-b border-black/10 flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4 text-[#ec4899] stroke-[3]" />
                        <input 
                          type="text"
                          value={tabs[leftIdx]?.title || ''}
                          onChange={(e) => handleRenameTab(tabs[leftIdx].id, e.target.value)}
                          className="font-black text-lg bg-transparent border-b-2 border-transparent hover:border-black focus:border-black outline-none w-full py-0.5"
                          placeholder="Chapter Title..."
                        />
                      </div>

                      {/* Rich Content Editable Area */}
                      <div 
                        ref={leftEditorRef}
                        contentEditable
                        onInput={handleLeftContentChange}
                        onFocus={() => setActiveEditSide('left')}
                        className={`outline-none font-medium text-lg min-h-[400px] relative z-10 w-full break-words select-text`}
                        style={{
                          lineHeight: paperStyle === 'lined' ? '36px' : '28px',
                          fontSize: `${activeSize}px`,
                          fontFamily: fonts.find(f => f.name === activeFont)?.css || 'sans-serif'
                        }}
                      />
                    </div>

                    {/* Left Sheet Footer */}
                    <footer className="mt-4 pt-2 border-t border-black/10 flex justify-between items-center z-10 font-bold text-xs text-gray-400 uppercase bg-[#fffefc]/80 backdrop-blur-xs">
                      <span>{docTitle}</span>
                      <span className="bg-yellow-100 border border-black rounded-full px-2 py-0.5 text-black">
                        Page {leftIdx + 1}
                      </span>
                    </footer>
                  </motion.div>

                  {/* Center Metal Spine Binder */}
                  <div className="w-5 bg-gradient-to-r from-black/20 via-black/5 to-black/20 border-l border-r border-black/10 h-full relative z-20 shadow-inner">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute top-[75%] left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-zinc-800 rounded-full border border-black"></div>
                  </div>

                  {/* Right Page Sheet (Content or back cover "The End") */}
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
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      boxShadow: 'inset 15px 0px 30px rgba(0,0,0,0.06)'
                    }}
                    className="flex-1 h-full bg-[#fffefc] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden text-left"
                  >
                    {/* Paper background texture */}
                    {rightIdx < tabs.length && paperStyle === 'lined' && (
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-40"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #93c5fd 35px, #93c5fd 36px)',
                          lineHeight: '36px',
                          paddingTop: '64px'
                        }}
                      />
                    )}
                    {rightIdx < tabs.length && paperStyle === 'grid' && (
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          backgroundImage: 'linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)',
                          backgroundSize: '24px 24px'
                        }}
                      />
                    )}

                    {/* Lined Margin line */}
                    {rightIdx < tabs.length && (
                      <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-red-300 opacity-60"></div>
                    )}

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto pr-1 select-text scrollbar-thin relative z-10 h-full">
                      {rightIdx < tabs.length ? (
                        <>
                          {/* Chapter Title Edit Header */}
                          <div className="mb-4 pb-1 border-b border-black/10 flex items-center gap-2">
                            <CornerDownRight className="w-4 h-4 text-[#ec4899] stroke-[3]" />
                            <input 
                              type="text"
                              value={tabs[rightIdx]?.title || ''}
                              onChange={(e) => handleRenameTab(tabs[rightIdx].id, e.target.value)}
                              className="font-black text-lg bg-transparent border-b-2 border-transparent hover:border-black focus:border-black outline-none w-full py-0.5"
                              placeholder="Chapter Title..."
                            />
                          </div>

                          {/* Rich Content Editable Area */}
                          <div 
                            ref={rightEditorRef}
                            contentEditable
                            onInput={handleRightContentChange}
                            onFocus={() => setActiveEditSide('right')}
                            className={`outline-none font-medium text-lg min-h-[400px] relative z-10 w-full break-words select-text`}
                            style={{
                              lineHeight: paperStyle === 'lined' ? '36px' : '28px',
                              fontSize: `${activeSize}px`,
                              fontFamily: fonts.find(f => f.name === activeFont)?.css || 'sans-serif'
                            }}
                          />
                        </>
                      ) : (
                        /* Back Cover "The End" Skeuomorphic sheet */
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-yellow-50/20 border-2 border-black border-dashed rounded-xl">
                          <BookLogo className="w-14 h-14 mb-4" />
                          <h3 className="text-xl font-black mb-2 uppercase">The End</h3>
                          <p className="text-sm font-bold text-gray-500 max-w-xs leading-relaxed mb-6">
                            You've reached the end of your book draft! You can add pages to write more or head back to Dashboard to publish it.
                          </p>
                          
                          <button
                            type="button"
                            onClick={handleAddTab}
                            className={`px-5 py-2.5 bg-[#bbf7d0] text-black font-black text-sm uppercase tracking-wider ${doodleBorder} ${doodleHover} ${doodleShadow} flex items-center gap-2 cursor-pointer`}
                          >
                            <Plus className="w-4 h-4" /> Add Page Sheet
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Sheet Footer */}
                    <footer className="mt-4 pt-2 border-t border-black/10 flex justify-between items-center z-10 font-bold text-xs text-gray-500 uppercase bg-[#fffefc]/80 backdrop-blur-xs">
                      <span className="bg-yellow-100 border border-black rounded-full px-2 py-0.5 text-black">
                        {rightIdx < tabs.length ? `Page ${rightIdx + 1}` : 'FIN'}
                      </span>
                      <span>{penName}</span>
                    </footer>
                  </motion.div>

                </div>

              )}
            </AnimatePresence>

          </div>

          {/* Right Navigation Arrow */}
          <div className="absolute right-4 md:right-8 z-40">
            {hasNext && (
              <button
                onClick={handleNext}
                className={`w-12 h-12 md:w-16 md:h-16 bg-[#bbf7d0] text-black flex items-center justify-center font-black rounded-full border-3 border-black cursor-pointer shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] transition-all`}
              >
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Quick-dot page indicators at bottom of desk */}
          <footer className="mt-6 flex items-center gap-1.5 overflow-x-auto max-w-[320px] sm:max-w-md bg-black/40 px-4 py-2 border-2 border-black rounded-full shadow-lg">
            <button
              onClick={() => {
                setDirection(currentPage > 0 ? 'prev' : 'next');
                setCurrentPage(0);
              }}
              className={`w-3.5 h-3.5 rounded-full border border-black transition-all cursor-pointer ${currentPage === 0 ? 'bg-pink-500 scale-125' : 'bg-zinc-400 hover:bg-zinc-200'}`}
              title="Cover Page"
            />
            {Array.from({ length: Math.ceil(tabs.length / 2) }).map((_, index) => {
              const pageTarget = index * 2 + 1;
              const isActive = currentPage === pageTarget || currentPage === pageTarget + 1;

              return (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(pageTarget > currentPage ? 'next' : 'prev');
                    setCurrentPage(pageTarget);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border border-black transition-all cursor-pointer ${isActive ? 'bg-[#bbf7d0] scale-125' : 'bg-zinc-400 hover:bg-zinc-200'}`}
                  title={`Spread ${pageTarget}`}
                />
              );
            })}
          </footer>

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
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
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
                className={`absolute -right-3 -top-3 w-10 h-10 bg-[#fbcfe8] text-black flex items-center justify-center font-black ${doodleBorder} hover:scale-110 transition-transform cursor-pointer`}
              >
                x
              </button>
              
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-2">
                📊 Book Stats
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
                className={`w-full mt-8 py-3 bg-[#bbf7d0] text-black font-black text-lg ${doodleBorder} ${doodleHover} cursor-pointer`}
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
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
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
                className={`absolute -right-3 -top-3 w-10 h-10 bg-[#fbcfe8] text-black flex items-center justify-center font-black ${doodleBorder} hover:scale-110 transition-transform cursor-pointer`}
              >
                x
              </button>
              
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-2">
                📘 Creator Studio Book Guide
              </h3>

              <div className="space-y-4 font-bold text-sm leading-relaxed">
                <p>Welcome to your personal, highly interactive <b>Doodle Book Creator Studio</b>!</p>
                
                <h4 className="font-black text-md text-pink-500 mt-4 uppercase">Features & Operations:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><b>Double-Page Spread:</b> Write your stories side-by-side! If you have an odd page, a beautiful skeuomorphic "The End" page renders automatically.</li>
                  <li><b>Hardcover Cover Designer:</b> At Spread 0, design your book cover (Author name, Image URL, Category, Synopsis, and beautiful stripes/gradients preset themes) which live updates in real-time!</li>
                  <li><b>Focus Sync Toolbar:</b> Focus on either the left or right sheet content, and all formatting (Bold, Italic, Highlight, Font Family, Doodle Stamps) applies instantly to your focused cursor page.</li>
                  <li><b>Outline Table of Contents:</b> Click page links in the Left Outline Sidebar to trigger realistic 3D single-page turns. Add and delete pages with a single click.</li>
                  <li><b>Auto-Save:</b> All book draft elements, page sheets, and cover settings are automatically saved in local drafts so they never get lost.</li>
                  <li><b>Save & Export:</b> Click the green "Save & Load" to carry your entire cover and pages configuration back to the Dashboard Creator Studio!</li>
                </ul>
              </div>

              <button 
                onClick={() => setShowHelpModal(false)}
                className={`w-full mt-8 py-3 bg-[#bfdbfe] text-black font-black text-lg ${doodleBorder} ${doodleHover} cursor-pointer`}
              >
                Let's Design!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
