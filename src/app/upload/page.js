
"use client";

import React from 'react';
import { useMathTutor } from '../../hooks/useMathTutor';
import Setup from '../../components/Setup';
import Loading from '../../components/Loading';
import Quiz from '../../components/Quiz';
import Wizard from '../../components/Wizard';

export default function Home() {
    const {
        currentView,
        setCurrentView,
        processImage,
        loadingLog,
        imageData,
        quizState,
        setQuizState,
        handleQuizAnswer,
        analysisResult,
        regenerateQuiz
    } = useMathTutor();

    const renderContent = () => {
        switch (currentView) {
            case 'setup':
            case 'upload':
                return (
                    <Setup
                        onProcessImage={processImage}
                        onViewChange={setCurrentView}
                    />
                );

            case 'loading':
                return (
                    <div className="text-center">
                        {imageData && (
                            <img
                                src={imageData}
                                className="mx-auto h-48 rounded-lg shadow-md mb-8 object-contain bg-white"
                                alt="Problem"
                            />
                        )}
                        <Loading log={loadingLog} />
                    </div>
                );

            case 'quiz':
                return (
                    <>
                        <div className="mb-6 text-center">
                            {imageData && (
                                <img
                                    src={imageData}
                                    className="mx-auto h-48 rounded-lg shadow-md object-contain bg-white transition-transform hover:scale-105 cursor-zoom-in"
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                    alt="Problem Reference"
                                />
                            )}
                        </div>
                        <Quiz
                            quizState={quizState}
                            onAnswer={handleQuizAnswer}
                            onNext={() => {
                                if (quizState.currentIndex < quizState.questions.length - 1) {
                                    setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
                                } else {
                                    // Quiz Completed
                                    setCurrentView('wizard');
                                }
                            }}
                            onRetry={() => {
                                // TODO: Implement retry specific logic if needed
                            }}
                        />
                    </>
                );

            case 'wizard':
                return (
                    <Wizard
                        analysisResult={analysisResult}
                        onRestart={() => {
                            setCurrentView('upload');
                            window.scrollTo(0, 0);
                        }}
                        onRegenerate={regenerateQuiz}
                    />
                );

            default:
                return <div>Unknown View</div>;
        }
    };

    return (
        <main className="container mx-auto max-w-3xl min-h-screen py-10 px-4">
            {renderContent()}
        </main>
    );
}
