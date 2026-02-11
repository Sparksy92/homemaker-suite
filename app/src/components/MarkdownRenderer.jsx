import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // Headings
                h1: ({ node, ...props }) => (
                    <h1 className="mt-8 mb-6 text-4xl font-serif font-bold text-sage-800 border-b-2 border-sage-200 pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className="mt-8 mb-4 text-3xl font-serif font-bold text-sage-700" {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className="mt-6 mb-3 text-2xl font-serif font-semibold text-sage-600" {...props} />
                ),
                h4: ({ node, ...props }) => (
                    <h4 className="mt-4 mb-2 text-xl font-serif font-medium text-sage-600" {...props} />
                ),

                // Paragraphs and Text
                p: ({ node, ...props }) => (
                    <p className="mb-4 text-charcoal leading-relaxed font-sans text-lg" {...props} />
                ),
                strong: ({ node, ...props }) => (
                    <strong className="font-bold text-sage-900" {...props} />
                ),
                em: ({ node, ...props }) => (
                    <em className="text-charcoal-light font-serif italic" {...props} />
                ),

                // Lists
                ul: ({ node, ...props }) => (
                    <ul className="mb-6 ml-6 list-disc marker:text-sage-500 space-y-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className="mb-6 ml-6 list-decimal marker:text-sage-600 marker:font-bold space-y-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                    <li className="pl-2 text-charcoal leading-relaxed" {...props} />
                ),

                // Blockquotes
                blockquote: ({ node, ...props }) => (
                    <blockquote className="my-6 pl-6 pr-4 py-4 bg-sand-100 border-l-4 border-terracotta-400 rounded-r-lg italic text-charcoal-light shadow-sm" {...props} />
                ),

                // Code
                code: ({ node, inline, className, children, ...props }) => {
                    return inline ? (
                        <code className="bg-sand-200 text-terracotta-800 px-1 py-0.5 rounded font-mono text-sm" {...props}>
                            {children}
                        </code>
                    ) : (
                        <div className="my-6 rounded-lg overflow-hidden shadow-md bg-charcoal-dark">
                            <code className="block p-4 text-sand-100 font-mono text-sm overflow-x-auto" {...props}>
                                {children}
                            </code>
                        </div>
                    );
                },

                // Tables
                table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-8 rounded-lg shadow-sm border border-sand-300">
                        <table className="w-full text-left border-collapse" {...props} />
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
                    <th className="px-6 py-3 font-serif font-bold text-sm uppercase tracking-wider" {...props} />
                ),
                td: ({ node, ...props }) => (
                    <td className="px-6 py-4 whitespace-normal text-charcoal" {...props} />
                ),

                // Links
                a: ({ node, ...props }) => (
                    <a className="text-terracotta-600 hover:text-terracotta-800 underline decoration-terracotta-300 underline-offset-2 transition-colors" {...props} />
                ),

                // Horizontal Rule
                hr: ({ node, ...props }) => (
                    <hr className="my-8 border-sand-300" {...props} />
                ),

                // Images
                img: ({ node, ...props }) => (
                    <div className="my-8">
                        <img className="rounded-lg shadow-md max-h-[500px] w-auto mx-auto border-4 border-white" {...props} />
                        {props.title && <p className="text-center text-sm text-charcoal-light mt-2 italic">{props.title}</p>}
                    </div>
                )
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
