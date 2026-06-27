import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const MarkdownRenderer = ({ content }) => {
    const [selectedImage, setSelectedImage] = React.useState(null);

    return (
        <>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ node, ...props }) => (
                        <h1 className="mt-6 mb-4 text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-sage-800 border-b-2 border-sand-200 pb-2 leading-tight" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="mt-6 mb-3 text-xl sm:text-2xl md:text-3xl font-serif font-bold text-sage-700 leading-tight" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="mt-5 mb-2.5 text-lg sm:text-xl md:text-2xl font-serif font-semibold text-sage-600 leading-snug" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                        <h4 className="mt-4 mb-2 text-base sm:text-lg md:text-xl font-serif font-medium text-sage-600 leading-snug" {...props} />
                    ),

                    // Paragraphs and Text
                    p: ({ node, ...props }) => (
                        <p className="mb-3.5 text-charcoal leading-relaxed font-sans text-sm sm:text-base md:text-lg" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                        <strong className="font-bold text-sage-900" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                        <em className="text-charcoal-light font-serif italic" {...props} />
                    ),

                    // Lists
                    ul: ({ node, ...props }) => (
                        <ul className="mb-4 ml-4 sm:ml-6 list-disc marker:text-sage-500 space-y-1.5" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="mb-4 ml-4 sm:ml-6 list-decimal marker:text-sage-600 marker:font-bold space-y-1.5" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="pl-1 text-charcoal leading-relaxed text-sm sm:text-base md:text-lg" {...props} />
                    ),

                    // Blockquotes & Alerts
                    blockquote: ({ node, children, ...props }) => {
                        // Extract text content to check for alerts
                        const content = React.Children.toArray(children).find(c => typeof c === 'object' && c.props && c.props.children);
                        const firstChild = content ? content.props.children : null;
                        const text = typeof firstChild === 'string' ? firstChild : '';

                        if (text.startsWith('[!INFO]') || text.startsWith('[!NOTE]')) {
                            return (
                                <div className="my-4 p-4 sm:p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-sm flex gap-3 sm:gap-4 items-start">
                                    <div className="p-2 bg-blue-500 rounded-xl text-white shrink-0 shadow-sm"><Info size={16} className="sm:w-5 sm:h-5" /></div>
                                    <div className="flex-1 min-w-0 prose-compact">
                                        <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-0.5 sm:mb-1">Observation</span>
                                        <div className="text-blue-900 font-medium leading-relaxed text-xs sm:text-sm md:text-base">
                                            {React.Children.map(children, (child, i) => {
                                                if (i === 0 && typeof firstChild === 'string') {
                                                    return firstChild.replace(/^\[!(INFO|NOTE)\]\s*/, '');
                                                }
                                                return child;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (text.startsWith('[!WARNING]') || text.startsWith('[!CAUTION]')) {
                            return (
                                <div className="my-4 p-4 sm:p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl shadow-sm flex gap-3 sm:gap-4 items-start">
                                    <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0 shadow-sm"><AlertTriangle size={16} className="sm:w-5 sm:h-5" /></div>
                                    <div className="flex-1 min-w-0 prose-compact">
                                        <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-0.5 sm:mb-1">Cautionary Advice</span>
                                        <div className="text-amber-900 font-bold leading-relaxed text-xs sm:text-sm md:text-base">
                                            {React.Children.map(children, (child, i) => {
                                                if (i === 0 && typeof firstChild === 'string') {
                                                    return firstChild.replace(/^\[!(WARNING|CAUTION)\]\s*/, '');
                                                }
                                                return child;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (text.startsWith('[!DANGER]') || text.startsWith('[!IMPORTANT]')) {
                            const isDanger = text.startsWith('[!DANGER]');
                            return (
                                <div className={`my-4 p-4 sm:p-6 ${isDanger ? 'bg-terracotta-50 border-terracotta-500 animate-pulse-subtle' : 'bg-neutral-50 border-neutral-900'} border-l-4 rounded-r-2xl shadow-md flex gap-3 sm:gap-4 items-start`}>
                                    <div className={`p-2 ${isDanger ? 'bg-terracotta-600' : 'bg-neutral-900'} rounded-xl text-white shrink-0 shadow-sm`}>
                                        {isDanger ? <ShieldAlert size={16} className="sm:w-5 sm:h-5" /> : <AlertCircle size={16} className="sm:w-5 sm:h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0 prose-compact">
                                        <span className={`text-[9px] sm:text-[10px] font-black ${isDanger ? 'text-terracotta-600' : 'text-neutral-900'} uppercase tracking-[0.2em] block mb-0.5 sm:mb-1`}>
                                            {isDanger ? 'Critical Safety Danger' : 'Essential Protocol'}
                                        </span>
                                        <div className={`${isDanger ? 'text-terracotta-900' : 'text-neutral-900'} font-black text-sm sm:text-base md:text-lg leading-snug`}>
                                            {React.Children.map(children, (child, i) => {
                                                if (i === 0 && typeof firstChild === 'string') {
                                                    return firstChild.replace(/^\[!(DANGER|IMPORTANT)\]\s*/, '');
                                                }
                                                return child;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return <blockquote className="my-4 pl-4 pr-3 py-3 sm:pl-6 sm:pr-4 sm:py-4 bg-sand-100 border-l-4 border-terracotta-400 rounded-r-lg italic text-charcoal-light shadow-sm text-xs sm:text-sm md:text-base" {...props} />;
                    },

                    // Code
                    code: ({ node, inline, className, children, ...props }) => {
                        return inline ? (
                            <code className="bg-sand-200 text-terracotta-800 px-1 py-0.5 rounded font-mono text-xs sm:text-sm" {...props}>
                                {children}
                            </code>
                        ) : (
                            <div className="my-4 rounded-lg overflow-hidden shadow-md bg-charcoal-dark">
                                <code className="block p-3 sm:p-4 text-sand-100 font-mono text-xs sm:text-sm overflow-x-auto" {...props}>
                                    {children}
                                </code>
                            </div>
                        );
                    },

                    // Tables
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6 rounded-lg shadow-sm border border-sand-300 w-full no-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-sage-100 text-sage-800" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                        <tbody className="bg-white divide-y divide-sand-200" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                        <tr className="hover:bg-sand-50 transition-colors" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="px-3 py-2 sm:px-6 sm:py-3 font-serif font-bold text-xs sm:text-sm uppercase tracking-wider" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-normal text-charcoal text-xs sm:text-sm" {...props} />
                    ),

                    // Links
                    a: ({ node, ...props }) => (
                        <a className="text-terracotta-600 hover:text-terracotta-800 underline decoration-terracotta-300 underline-offset-2 transition-colors font-semibold" {...props} />
                    ),

                    // Horizontal Rule
                    hr: ({ node, ...props }) => (
                        <hr className="my-6 border-sand-300" {...props} />
                    ),

                    // Images
                    img: ({ node, src, alt, title, ...props }) => (
                        <div className="my-6 group relative cursor-pointer" onClick={() => setSelectedImage({ src, alt, title })}>
                            <div className="relative overflow-hidden rounded-xl shadow-lg border-2 sm:border-4 border-white">
                                <img
                                    src={src}
                                    alt={alt}
                                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                    {...props}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                        <Maximize2 size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                            </div>
                            {title && <p className="text-center text-xs sm:text-sm text-charcoal-light mt-2.5 italic font-serif">{title}</p>}
                        </div>
                    )
                }}
            >
                {content}
            </ReactMarkdown>

            {/* Markdown Image Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-[210]"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={32} />
                        </button>

                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {selectedImage.title && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mt-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white text-center max-w-2xl"
                            >
                                <p className="font-serif italic">{selectedImage.title}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MarkdownRenderer;
