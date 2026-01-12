
import React, { useEffect, useState, useRef } from 'react';
import MathText from './MathText';
// import { renderMath } from '../utils/mathHelpers'; // Unused now

export default function Quiz({ quizState, onAnswer, onNext, onRetry }) {
    const { questions, currentIndex, isCompleted } = quizState;
    const currentQ = questions[currentIndex];

    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '...', tag: '...' }
    const [showNext, setShowNext] = useState(false);

    // Reset state on new question
    useEffect(() => {
        setSelectedOption(null);
        setFeedback(null);
        setShowNext(false);
    }, [currentIndex, currentQ]);

    // renderMath hooks removed as MathText handles it

    if (!currentQ) return null;

    const handleOptionClick = (idx) => {
        if (showNext) return; // Prevent clicking after correct

        setSelectedOption(idx);
        const isCorrect = onAnswer(idx);

        if (isCorrect) {
            setFeedback({ type: 'success', message: '✅ 回答正确！' });
            setShowNext(true);
        } else {
            // Find specific feedback
            const analysis = (currentQ.option_analysis || []).find(a => a.idx === idx);
            const tag = analysis ? analysis.tag : '错误';
            const msg = analysis ? analysis.feedback : (currentQ.explanation || '请仔细思考...');

            setFeedback({ type: 'error', message: msg, tag: tag });
        }
    };

    const isKnowledgeCheck = currentQ.type === 'knowledge';

    const sectionTitle = isKnowledgeCheck
        ? `Part 1: 知识点诊脉`
        : `Part 2: 解题引导`;

    const globalProgress = `进度 ${currentIndex + 1} / ${questions.length}`;

    return (
        <div className="glass-panel fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{sectionTitle}</h3>
                    <span className="text-sm text-gray-500 font-mono">{globalProgress}</span>
                </div>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                    {currentQ.knowledgePoint || '综合'}
                </span>
            </div>

            <div className="question-card">
                <MathText className="text-lg mb-4" content={currentQ.question} />
            </div>

            <div className="options-list">
                {currentQ.options.map((opt, idx) => {
                    let className = "option";
                    if (selectedOption === idx) {
                        if (feedback?.type === 'success') className += " correct";
                        if (feedback?.type === 'error') className += " wrong";
                    }

                    return (
                        <div key={idx} style={{ position: 'relative' }}>
                            {/* Error Toast Bubble */}
                            {selectedOption === idx && feedback?.type === 'error' && (
                                <div className="fade-in" style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '10px',
                                    background: '#c53030',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    marginBottom: '8px',
                                    zIndex: 10,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <strong>🚫 {feedback.tag}: </strong>
                                    <MathText content={feedback.message} />
                                    <div style={{
                                        position: 'absolute', bottom: '-6px', left: '20px',
                                        width: '0', height: '0',
                                        borderLeft: '6px solid transparent',
                                        borderRight: '6px solid transparent',
                                        borderTop: '6px solid #c53030'
                                    }}></div>
                                </div>
                            )}

                            <div
                                className={className}
                                onClick={() => handleOptionClick(idx)}
                            >
                                <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                                <MathText content={opt.replace(/^[A-H][.、]\s*/, '')} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Next Button */}
            {showNext && (
                <div className="mt-6 text-center fade-in">
                    <div className="mb-2 text-green-600 font-bold">
                        <MathText content={currentQ.explanation || '解析正确'} />
                    </div>
                    <button className="btn" onClick={onNext}>
                        下一步 ▶️
                    </button>
                </div>
            )}
        </div>
    );
}
