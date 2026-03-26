import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function parseMarkdown(text: string): React.ReactNode {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-primary" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-primary" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-md font-semibold mt-2 mb-1 text-primary/80" {...props} />,
        h4: ({node, ...props}) => <h4 className="font-semibold mt-2 mb-1 text-primary/80" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-purple-300" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
        li: ({node, ...props}) => <li className="" {...props} />,
        p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
        code: ({node, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '')
          const inline = !match && !text.includes('\n')
          return inline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-pink-300 font-mono" {...props}>
              {children}
            </code>
          ) : (
            <pre className="bg-muted p-3 flex rounded-md my-3 overflow-x-auto text-sm text-slate-300 font-mono">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          )
        },
        table: ({node, ...props}) => (
          <div className="overflow-x-auto my-4 rounded-md border border-border">
            <table className="w-full text-sm border-collapse" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-muted text-muted-foreground" {...props} />,
        th: ({node, ...props}) => <th className="border-b border-border p-3 text-left font-semibold" {...props} />,
        td: ({node, ...props}) => <td className="border-b border-border/50 p-3" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  )
}
