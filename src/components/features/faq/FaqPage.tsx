'use client';
import React, { useState } from 'react';
import faqData from '@/data/faq.json';


interface FaqSection {
    title: string;
    questions: {
        question: string;
        answer: string;
    }[];
}

export const FaqPage: React.FC = () => {
    const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

    const toggleQuestion = (sectionIndex: number, questionIndex: number) => {
        const key = `${sectionIndex}-${questionIndex}`;
        setOpenQuestions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const renderAnswer = (answer: string) => {
        // Reemplazar las etiquetas img con el componente Image de Next.js
        const processedAnswer = answer.replace(
            /<img([^>]*)src="([^"]*)"([^>]*)>/g,
            (match, before, src, after) => {
                const widthMatch = after.match(/width="([^"]*)"/);
                const width = widthMatch ? widthMatch[1] : '100%';
                const altMatch = after.match(/alt="([^"]*)"/);
                const alt = altMatch ? altMatch[1] : '';
                const classMatch = after.match(/class="([^"]*)"/);
                const className = classMatch ? classMatch[1] : '';

                return `<div class="${className}"><Image src="${src}" alt="${alt}" width={${width}} height={300} /></div>`;
            }
        );

        return (
            <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: processedAnswer }}
            />
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Preguntas Frecuentes</h1>

            <div className="space-y-8">
                {(faqData.sections as FaqSection[]).map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-[#1A1A2E] rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold p-4 bg-[#16213E] rounded-t-lg text-blue-400">
                            {section.title}
                        </h2>

                        <div className="divide-y divide-[#16213E]">
                            {section.questions.map((item, questionIndex) => {
                                const key = `${sectionIndex}-${questionIndex}`;
                                const isOpen = openQuestions[key];

                                return (
                                    <div key={questionIndex} className="p-4">
                                        <button
                                            onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                                            className="flex justify-between items-center w-full text-left"
                                        >
                                            <span className="font-medium text-white">
                                                {item.question}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-blue-400 transform transition-transform ${isOpen ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        <div
                                            className={`mt-2 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                                                }`}
                                        >
                                            {renderAnswer(item.answer)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 