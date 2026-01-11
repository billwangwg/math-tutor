
import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Lightbulb, AlertTriangle, Flag, Brain } from 'lucide-react';

const ChallengeView = ({ challenge }) => {
    const [showAns, setShowAns] = useState(false);
    const data = challenge || {};

    // Trigger MathJax when answer is toggled
    useEffect(() => {
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            setTimeout(() => {
                window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
            }, 50);
        }
    }, [showAns, challenge]);

    return (
        <div className="glass-panel fade-in" style={{ background: 'rgba(255, 250, 240, 0.8)', borderColor: '#fbd38d' }}>
            <h3 className="flex items-center text-xl font-bold text-orange-600 mb-4">
                <Flag className="mr-2" /> 举一反三
            </h3>
            <p className="font-medium text-lg mb-4">{data.question || '暂无题目'}</p>

            <button
                onClick={() => setShowAns(!showAns)}
                className="text-orange-600 underline font-semibold"
            >
                {showAns ? '隐藏答案' : '查看答案'}
            </button>

            {showAns && (
                <div className="mt-4 p-4 bg-orange-100 rounded text-orange-900 fade-in">
                    <strong>答案：</strong> {data.answer}
                </div>
            )}
        </div>
    );
};

export default function Wizard({ analysisResult, onRestart }) {
    const [currentStep, setCurrentStep] = useState(0);
    // 0: Solution, 1: Deep Analysis, 2: Pitfalls, 3: Challenge, 4: Done

    const [revealedSolutionItems, setRevealedSolutionItems] = useState(1);
    const solutionSteps = analysisResult.finalSolution || [];

    const steps = [
        { icon: CheckCircle, label: "标准解题" },
        { icon: Brain, label: "核心思想" },
        { icon: AlertTriangle, label: "避坑指南" },
        { icon: Flag, label: "举一反三" },
        { icon: CheckCircle, label: "完成" }
    ];

    // Trigger MathJax on updates
    useEffect(() => {
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            setTimeout(() => {
                window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
            }, 50);
        }
    }, [currentStep, revealedSolutionItems]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const revealMoreSolution = () => {
        if (revealedSolutionItems < solutionSteps.length) {
            setRevealedSolutionItems(prev => prev + 1);
        }
    };

    const renderSolutionStep = () => {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6 text-violet-700">标准化解题</h2>
                {solutionSteps.map((step, idx) => {
                    if (idx >= revealedSolutionItems) return null;

                    const isSetup = step.type === 'setup';
                    const isVerify = step.type === 'verification';

                    let bgStyle = {
                        background: 'rgba(255,255,255,0.6)',
                        borderLeftColor: '#805ad5' // purple-600
                    };

                    if (isSetup) bgStyle = { background: 'rgba(233, 216, 253, 0.3)', borderLeftColor: '#805ad5' };
                    if (isVerify) bgStyle = { background: 'rgba(240, 255, 244, 0.5)', borderLeftColor: '#48bb78' };

                    // LaTeX Sanitizer: Force Display Mode
                    let latexContent = step.latex;
                    if (latexContent) {
                        const trimmed = latexContent.trim();
                        // If it doesn't start with $ or $$, wrap it in $$
                        if (!trimmed.startsWith('$') && !trimmed.startsWith('\\[')) {
                            latexContent = `$$${trimmed}$$`;
                        }
                    }

                    return (
                        <div key={idx} className="solution-step fade-in" style={{ ...bgStyle, overflowWrap: 'break-word' }}>
                            <strong style={{ color: isVerify ? '#2f855a' : '#6b46c1' }}>
                                {isVerify ? '🔍 ' : ''}{step.title}
                            </strong>

                            {isSetup && step.items && (
                                <div className="mt-2 bg-white p-2 rounded">
                                    {step.items.map((item, i) => (
                                        <div key={i} className="flex justify-between border-b border-dashed border-gray-200 py-1">
                                            <span className="text-gray-600 font-bold">{item.label}</span>
                                            <span className="font-mono text-violet-600 break-all ml-4 text-right">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isSetup && (
                                <>
                                    <div
                                        className="mt-2 text-gray-700 break-words"
                                        style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                                        dangerouslySetInnerHTML={{ __html: step.content }}
                                    />
                                    {latexContent && (
                                        <div className="mt-2 text-center overflow-x-auto p-2 bg-white/60 rounded">
                                            {/* Just output the raw latex, MathJax will find it */}
                                            <p className="math-block" dangerouslySetInnerHTML={{ __html: latexContent }}></p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}

                {/* Local Reveal Button */}
                {revealedSolutionItems < solutionSteps.length && (
                    <div className="text-center mt-4">
                        <button onClick={revealMoreSolution} className="btn" style={{ background: '#4299e1' }}>
                            ⬇️ 思考下一步 (点击查看)
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderDeepAnalysis = () => {
        const { deepAnalysis } = analysisResult;
        if (!deepAnalysis) return <div>暂无数据</div>;

        return (
            <div className="space-y-4">
                <div className="glass-panel text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <h3 className="flex items-center text-xl font-bold mb-2">
                        <Brain className="mr-2" /> 核心思想
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(deepAnalysis.mathThinkings || []).map((t, i) => (
                            <span key={i} className="bg-white/20 px-2 py-1 rounded text-sm">{t}</span>
                        ))}
                    </div>
                    <p className="opacity-90">{deepAnalysis.methodology}</p>
                </div>

                <div className="glass-panel" style={{ background: 'rgba(235, 248, 255, 0.6)' }}>
                    <h3 className="font-bold text-blue-800 mb-2">🎓 教学策略</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/50 p-3 rounded">
                            <strong className="block text-sm text-gray-500 mb-1">基础薄弱</strong>
                            <p>{deepAnalysis.teachingStrategy?.struggling}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded">
                            <strong className="block text-sm text-gray-500 mb-1">培优提升</strong>
                            <p>{deepAnalysis.teachingStrategy?.advanced}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPitfalls = () => {
        const pitfalls = analysisResult.analysis?.pitfalls || analysisResult.analysis?.deepAnalysis?.commonPitfalls || [];
        return (
            <div className="glass-panel fade-in" style={{ background: 'rgba(255, 245, 245, 0.8)', borderColor: '#feb2b2' }}>
                <h3 className="flex items-center text-xl font-bold text-red-600 mb-4">
                    <AlertTriangle className="mr-2" /> 易错警示
                </h3>
                <ul className="space-y-2">
                    {pitfalls.map((p, i) => (
                        <li key={i} className="flex items-start">
                            <span className="mr-2 text-red-500">❌</span>
                            <span>{p}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderContent = () => {
        switch (currentStep) {
            case 0: return renderSolutionStep();
            case 1: return renderDeepAnalysis();
            case 2: return renderPitfalls();
            case 3: return <ChallengeView challenge={analysisResult.challenge} />;
            case 4: return (
                <div className="text-center py-10">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold mb-4">本题复习完成！</h2>
                    <p className="mb-8 text-gray-600">你已经掌握了这道题的所有关键点。</p>
                    <div className="flex flex-col gap-4 max-w-xs mx-auto">
                        <button
                            onClick={() => window.print()}
                            className="btn bg-green-600 hover:bg-green-700"
                            style={{ background: '#48bb78' }}
                        >
                            🖨️ 下载/打印完整报告 (PDF)
                        </button>
                        <button onClick={onRestart} className="btn bg-gray-500 hover:bg-gray-600">
                            🔄 再练一题
                        </button>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <React.Fragment>
            <div className="no-print">
                {/* Progress Bar */}
                <div className="flex justify-between mb-8 px-2 sm:px-8">
                    {steps.map((s, idx) => {
                        const isActive = idx === currentStep;
                        const isPassed = idx < currentStep;
                        return (
                            <div key={idx} className="flex flex-col items-center">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all
                                    ${isActive ? 'bg-violet-600 text-white scale-110 shadow-lg' :
                                        isPassed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                                `}>
                                    <s.icon size={16} />
                                </div>
                                <span className={`text-xs ${isActive ? 'font-bold text-violet-600' : 'text-gray-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {renderContent()}
                </div>

                {/* Bottom Nav */}
                {currentStep < 4 && (
                    <div className="mt-8 flex justify-end">
                        {(currentStep !== 0 || revealedSolutionItems >= solutionSteps.length) && (
                            <button onClick={handleNext} className="btn" style={{ width: 'auto' }}>
                                下一步 <ArrowRight className="inline ml-2" size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Print Report Section (Visible only when printing) */}
            <div className="print-only">
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-8">
                    <h1 className="text-3xl font-bold mb-2">家长急救包 · 智能解题报告</h1>
                    <p className="text-gray-600">生成时间: {new Date().toLocaleString()}</p>
                </div>

                {/* Part 1 & 2: Concepts */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">一、 知识点诊脉与引导</h2>
                    {(analysisResult.questions || []).map((q, i) => (
                        <div key={i} className="mb-6 p-4 border border-gray-200 rounded">
                            <div className="font-bold mb-2">Q{i + 1}: <span dangerouslySetInnerHTML={{ __html: q.question }}></span></div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {q.options.map((opt, oid) => (
                                    <div key={oid} className={`p-2 rounded ${oid === q.correctIndex ? 'font-bold text-green-700 bg-green-50' : 'text-gray-600'}`}>
                                        {String.fromCharCode(65 + oid)}. <span dangerouslySetInnerHTML={{ __html: opt }}></span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                                <strong>解析：</strong> {q.explanation}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Part 3: Standard Solution */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold border-l-4 border-violet-600 pl-3 mb-4">二、 标准化解题步骤</h2>
                    {solutionSteps.map((step, idx) => (
                        <div key={idx} className="mb-4 break-inside-avoid">
                            <h3 className="font-bold text-violet-800 mb-1">{step.title}</h3>
                            <p className="mb-2 text-gray-800">{step.content}</p>
                            {step.latex && (
                                <div className="text-center p-2 bg-gray-50 rounded mb-2">
                                    <p className="math-block" dangerouslySetInnerHTML={{ __html: step.latex.startsWith('$') ? step.latex : `$$${step.latex}$$` }}></p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Part 4: Deep Analysis */}
                <div className="mb-8 break-inside-avoid">
                    <h2 className="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4">三、 核心思想与易错点</h2>
                    <div className="mb-4">
                        <strong>核心思想：</strong> {analysisResult.deepAnalysis?.mathThinkings?.join('、')}
                    </div>
                    <div className="mb-4">
                        <strong>方法论：</strong> {analysisResult.deepAnalysis?.methodology}
                    </div>
                    <div className="p-4 bg-red-50 rounded border border-red-100">
                        <strong>⚠️ 易错警示：</strong>
                        <ul className="list-disc pl-5 mt-2">
                            {(analysisResult.analysis?.pitfalls || []).map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>
                </div>

                {/* Part 5: Challenge */}
                <div className="mb-8 break-inside-avoid">
                    <h2 className="text-xl font-bold border-l-4 border-orange-600 pl-3 mb-4">四、 举一反三</h2>
                    <div className="p-4 border border-orange-200 rounded">
                        <p className="font-bold mb-2">问：{analysisResult.challenge?.question}</p>
                        <p className="text-orange-800">答：{analysisResult.challenge?.answer}</p>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
