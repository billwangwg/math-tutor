"use client";

import Link from 'next/link';
import { Camera, ArrowRight, Zap, BookOpen, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center relative z-10 py-24">

                <div className="glass-panel w-full max-w-4xl mx-auto p-4 md:p-12 animate-fade-in-up">
                    {/* Hero Content */}
                    <div className="text-center space-y-6">

                        {/* Logo Section */}
                        <div className="mb-6 relative group">
                            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
                            <img
                                src="/final_logo.png"
                                alt="家长急救包"
                                className="w-40 md:w-56 h-auto mx-auto relative transform transition-transform duration-500 hover:scale-105"
                            />
                        </div>

                        {/* Headlines */}
                        <div className="space-y-4">
                            <h3 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight leading-tight">
                                不知道怎么解题？
                            </h3>
                            <h3 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight leading-tight">
                                不想直接看答案？
                            </h3>
                            <h3 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight leading-tight">
                                同题型永不出错？
                            </h3>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-8 pb-12">
                            <Link href="/upload">
                                <button className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:shadow-2xl hover:translate-y-[-2px] overflow-hidden">
                                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                                    <span className="relative flex items-center gap-3">
                                        <Camera className="w-6 h-6" />
                                        拍题
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </Link>

                            {/* Process Flow Text */}
                            <div className="mt-6 text-xs md:text-sm text-slate-500 font-medium tracking-wide">
                                拍题识别 <span className="mx-1">→</span> 知识点分析 <span className="mx-1">→</span> 引导解题 <span className="mx-1">→</span> 解题思路 <span className="mx-1">→</span> 深度分析
                            </div>
                        </div>

                        {/* Features / Trust */}
                        {/* Features / Trust */}
                        <div className="flex flex-row items-center justify-center gap-4 md:gap-12 text-slate-500 text-sm mt-12 border-t border-slate-200 pt-12 max-w-2xl mx-auto">
                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                </div>
                                <span>AI 智能秒级解题</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                </div>
                                <span>波利亚教学引导</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    );
}
