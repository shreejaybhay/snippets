"use client";

import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/nightOwl";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  readOnly = false,
  className,
}) => {
  // Map common language names to Prism language definitions
  const languageMap: { [key: string]: any } = {
    javascript: languages.javascript,
    typescript: languages.typescript,
    python: languages.python,
    java: languages.java,
    cpp: languages.cpp,
    c: languages.c,
    csharp: languages.csharp,
    ruby: languages.ruby,
    php: languages.php,
    go: languages.go,
    rust: languages.rust,
    swift: languages.swift,
    kotlin: languages.kotlin,
    sql: languages.sql,
    html: languages.html,
    css: languages.css,
    json: languages.json,
    yaml: languages.yaml,
    markdown: languages.markdown,
    shell: languages.bash,
    bash: languages.bash,
    plaintext: languages.plain,
  };

  const getLanguage = (lang: string) => {
    const normalizedLang = lang.toLowerCase();
    return languageMap[normalizedLang] || languages.plain;
  };

  return (
    <div
      className={cn(
        "relative rounded-md border dark:border-zinc-800",
        "bg-zinc-50 dark:bg-zinc-900",
        className
      )}
    >
      <Editor
        value={value}
        onValueChange={onChange || (() => {})}
        highlight={code =>
          highlight(code, getLanguage(language), language)
            .tokens
            .map(line => 
              line
                .map(token => 
                  `<span class="${token.props.className}">${token.content}</span>`
                )
                .join('')
            )
            .join('\n')
        }
        padding={16}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          minHeight: '100px',
          ...theme.plain,
        }}
        textareaClassName={cn(
          "focus:outline-none focus:ring-0 focus:border-0",
          readOnly && "cursor-default"
        )}
        readOnly={readOnly}
      />
    </div>
  );
};

export default CodeEditor;
