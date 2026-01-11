
import { useState, useRef, useCallback } from 'react';

const LOADING_MESSAGES = [
    "🚀 正在扫描图片内容...",
    "📐 识别几何图形与条件...",
    "🧠 检索相关的数学定理...",
    "⚡️ 构建解题逻辑路径...",
    "✍️ 生成针对性的练习题...",
    "🎓 制定教学引导策略...",
    "✨ 即将完成..."
];

export function useMathTutor() {
    // Views: 'setup', 'upload', 'loading', 'quiz', 'wizard'
    const [currentView, setCurrentView] = useState('setup');
    const [apiKey, setApiKey] = useState('');
    const [modelName, setModelName] = useState('gemini-3-flash-preview');

    // Data State
    const [currentFile, setCurrentFile] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);

    // Quiz State
    const [quizState, setQuizState] = useState({
        questions: [],
        currentIndex: 0,
        mistakes: [],
        score: 0,
        isCompleted: false
    });

    // Loading State
    const [loadingLog, setLoadingLog] = useState(LOADING_MESSAGES[0]);
    const loadingIntervalRef = useRef(null);

    const startLoadingAnimation = useCallback(() => {
        let step = 0;
        setLoadingLog(LOADING_MESSAGES[0]);
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);

        loadingIntervalRef.current = setInterval(() => {
            step = (step + 1) % LOADING_MESSAGES.length;
            setLoadingLog(LOADING_MESSAGES[step]);
        }, 2000);
    }, []);

    const stopLoadingAnimation = useCallback(() => {
        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
    }, []);

    const processImage = async (file) => {
        setCurrentFile(file);
        setCurrentView('loading');
        startLoadingAnimation();

        try {
            // 1. Convert to Base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
            });
            reader.readAsDataURL(file);
            const base64Data = await base64Promise;
            setImageData(`data:${file.type};base64,${base64Data}`);

            // 2. Call API
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData: base64Data,
                    modelName: modelName // Optional if handled by server env defaults
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server Error');
            }

            const data = await response.json();

            // 3. Process Data (Merge Questions)
            const mergedQuestions = [
                ...(data.knowledge_checks || []).map(q => ({
                    ...q, type: 'knowledge', correctIndex: q.correct_index, explanation: q.explanation
                })),
                ...(data.scaffolding_questions || []).map(q => ({
                    ...q, type: 'scaffolding', correctIndex: q.correct_index, explanation: q.explanation || q.hint
                }))
            ].map((q, i) => ({ ...q, id: i + 1 }));

            // Polyfill for UI
            data.questions = mergedQuestions;
            data.finalSolution = data.solution_steps;
            if (data.analysis) {
                data.deepAnalysis = data.analysis.deepAnalysis || {};
                data.challenge = data.analysis.challenge;
            }

            setAnalysisResult(data);
            setQuizState({
                questions: mergedQuestions,
                currentIndex: 0,
                mistakes: [],
                score: 0,
                isCompleted: false
            });

            stopLoadingAnimation();
            setCurrentView('quiz');

        } catch (error) {
            console.error(error);
            stopLoadingAnimation();
            alert(`Error: ${error.message}`);
            setCurrentView('upload');
        }
    };

    const handleQuizAnswer = (selectedIndex) => {
        const currentQ = quizState.questions[quizState.currentIndex];
        const isCorrect = selectedIndex === currentQ.correctIndex;

        // Record Mistake if wrong
        if (!isCorrect) {
            const analysis = (currentQ.option_analysis || []).find(a => a.idx === selectedIndex);
            const mistake = {
                questionId: currentQ.id,
                question: currentQ.question,
                wrongAnswer: currentQ.options[selectedIndex],
                correctAnswer: currentQ.options[currentQ.correctIndex],
                explanation: currentQ.explanation,
                errorTag: analysis ? analysis.tag : '未知'
            };
            setQuizState(prev => ({
                ...prev,
                mistakes: [...prev.mistakes, mistake]
            }));
        } else {
            setQuizState(prev => ({ ...prev, score: prev.score + 1 }));
        }
        return isCorrect;
    };

    return {
        currentView,
        setCurrentView,
        processImage,
        loadingLog,
        imageData,
        analysisResult,
        quizState,
        setQuizState,
        handleQuizAnswer
    };
}
