import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    FileText,
    ExternalLink,
    Code2,
    Layers,
    Network,
    Bot,
    Brain,
    Shield,
    Zap,
    ArrowRight,
    Github,
    Globe,
    BookMarked,
    GraduationCap,
    Lightbulb,
    Users,
    Cpu,
    Server
} from 'lucide-react';
import { Schema } from '../components/Schema';
import { generatePageTitle, generateMetaDescription, generateCanonicalUrl } from '../utils/seo';

export const AgenticAIResourcesPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const pageTitle = generatePageTitle('Agentic AI Resources & Documentation');
    const metaDescription = generateMetaDescription(
        'Comprehensive resources for enterprise autonomous systems and multi-agent orchestration. Documentation, guides, frameworks, and best practices for building AI agents.'
    );
    const canonicalUrl = generateCanonicalUrl('/agentic-ai/resources');

    // Schema markup for the resource page
    const resourcePageSchema = {
        '@type': 'WebPage',
        name: 'Agentic AI Resources & Documentation',
        description: 'Educational resources and documentation for enterprise autonomous AI systems and multi-agent orchestration',
        provider: {
            '@type': 'Organization',
            name: 'Swaz Solutions',
            url: 'https://swazdatarecovery.com'
        },
        about: {
            '@type': 'Thing',
            name: 'Agentic AI',
            description: 'Autonomous AI systems capable of planning, reasoning, and executing complex tasks'
        }
    };

    const documentationLinks = [
        {
            category: 'LLM Providers',
            icon: Brain,
            items: [
                { name: 'OpenAI Documentation', url: 'https://platform.openai.com/docs', description: 'GPT-4, Assistants API, Function Calling' },
                { name: 'Anthropic Claude Docs', url: 'https://docs.anthropic.com', description: 'Claude models, tool use, and best practices' },
                { name: 'Google Gemini API', url: 'https://ai.google.dev/docs', description: 'Gemini models and multimodal capabilities' },
                { name: 'Meta Llama', url: 'https://llama.meta.com', description: 'Open-source LLMs for enterprise deployment' }
            ]
        },
        {
            category: 'Agent Frameworks',
            icon: Network,
            items: [
                { name: 'LangChain Documentation', url: 'https://python.langchain.com/docs', description: 'Build LLM applications with composable components' },
                { name: 'LangGraph Guide', url: 'https://langchain-ai.github.io/langgraph', description: 'Multi-actor orchestration and stateful agents' },
                { name: 'AutoGen by Microsoft', url: 'https://microsoft.github.io/autogen', description: 'Multi-agent conversation framework' },
                { name: 'CrewAI Documentation', url: 'https://docs.crewai.com', description: 'Role-based agent collaboration' }
            ]
        },
        {
            category: 'Cloud AI Platforms',
            icon: Server,
            items: [
                { name: 'AWS Bedrock', url: 'https://docs.aws.amazon.com/bedrock', description: 'Foundation models on AWS infrastructure' },
                { name: 'Azure AI Services', url: 'https://learn.microsoft.com/azure/ai-services', description: 'Enterprise AI on Microsoft Azure' },
                { name: 'Google Cloud AI', url: 'https://cloud.google.com/ai', description: 'AI and ML services on Google Cloud' },
                { name: 'Hugging Face Hub', url: 'https://huggingface.co/docs', description: 'Open-source models and datasets' }
            ]
        },
        {
            category: 'Vector Databases',
            icon: Layers,
            items: [
                { name: 'Pinecone Documentation', url: 'https://docs.pinecone.io', description: 'Managed vector database for AI' },
                { name: 'Weaviate Guides', url: 'https://weaviate.io/developers/weaviate', description: 'Open-source vector search engine' },
                { name: 'Chroma Documentation', url: 'https://docs.trychroma.com', description: 'Embedding database for AI applications' },
                { name: 'Qdrant Docs', url: 'https://qdrant.tech/documentation', description: 'Vector similarity search engine' }
            ]
        }
    ];

    const conceptGuides = [
        {
            title: 'What is Agentic AI?',
            icon: Bot,
            description: 'Agentic AI refers to autonomous systems that can reason, plan, and execute complex multi-step tasks with minimal human intervention. Unlike traditional chatbots, agents can use tools, make decisions, and adapt to changing requirements.',
            keyPoints: ['Autonomous decision-making', 'Tool and API integration', 'Multi-step reasoning', 'Self-correction capabilities']
        },
        {
            title: 'Multi-Agent Orchestration',
            icon: Network,
            description: 'Multi-agent systems involve multiple AI agents working together to solve complex problems. Each agent can specialize in specific tasks while collaborating with others through defined protocols.',
            keyPoints: ['Agent specialization', 'Communication protocols', 'Collaborative problem-solving', 'Distributed workloads']
        },
        {
            title: 'Enterprise Autonomous Systems',
            icon: Shield,
            description: 'Enterprise-grade autonomous systems require robust security, compliance, and governance. These systems operate within defined boundaries while delivering business value through automation.',
            keyPoints: ['Security boundaries', 'Audit logging', 'Policy enforcement', 'Compliance frameworks']
        },
        {
            title: 'Retrieval-Augmented Generation (RAG)',
            icon: Brain,
            description: 'RAG combines LLM capabilities with external knowledge retrieval. This pattern enables AI agents to access up-to-date information and proprietary data while maintaining accuracy.',
            keyPoints: ['Knowledge retrieval', 'Contextual responses', 'Domain-specific data', 'Reduced hallucinations']
        }
    ];

    const bestPractices = [
        {
            title: 'Security First Design',
            icon: Shield,
            description: 'Implement sandboxing, access controls, and comprehensive audit logging from day one.'
        },
        {
            title: 'Observability',
            icon: Cpu,
            description: 'Track agent decisions, costs, and performance with detailed telemetry and monitoring.'
        },
        {
            title: 'Human-in-the-Loop',
            icon: Users,
            description: 'Design approval workflows for critical decisions and high-stakes operations.'
        },
        {
            title: 'Iterative Deployment',
            icon: Zap,
            description: 'Start with narrow use cases, validate thoroughly, then expand scope gradually.'
        }
    ];

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="website" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />

                {/* Keywords */}
                <meta name="keywords" content="agentic AI resources, autonomous systems documentation, multi-agent orchestration, AI agent frameworks, LangChain, LangGraph, enterprise AI, RAG, AI development" />
            </Helmet>

            {/* Schema Markup */}
            <Schema type="WebPage" data={resourcePageSchema} />

            <main className="min-h-screen bg-background relative overflow-hidden">
                {/* Background Gradient */}
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-background to-background"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent-orange/5 via-transparent to-transparent"></div>
                </div>

                {/* Hero Section */}
                <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-24 lg:pt-32 md:pb-20">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-6xl mx-auto">
                            {/* Badge */}
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 border border-accent/20">
                                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                                    <span className="text-[10px] sm:text-xs font-bold text-accent uppercase tracking-wider">Resources & Documentation</span>
                                </div>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-center text-primary mb-4 sm:mb-6 leading-tight">
                                Agentic AI<br />
                                <span className="text-transparent bg-clip-text bg-brand-gradient">Resources</span>
                            </h1>

                            {/* Subheading */}
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center text-secondary max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2">
                                Everything you need to build enterprise autonomous systems
                            </p>

                            {/* Description */}
                            <p className="text-sm sm:text-base md:text-lg text-center text-secondary max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
                                Explore comprehensive documentation, frameworks, and best practices for developing intelligent AI agents. From LLM providers to orchestration frameworks, find the resources you need for your agentic AI journey.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 md:mb-16 px-4 sm:px-0">
                                <Link
                                    to="/agentic-ai"
                                    className="btn btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover-lift justify-center touch-target"
                                >
                                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> Our AI Solutions
                                </Link>
                                <button
                                    onClick={() => document.getElementById('documentation')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="btn btn-ghost px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover-lift border-2 justify-center touch-target"
                                >
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Browse Documentation
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Concepts Section */}
                <section id="concepts" className="py-12 sm:py-16 md:py-20 bg-surface border-y border-border">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Key Concepts</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Understanding the fundamentals of autonomous AI systems
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                            {conceptGuides.map((concept, index) => (
                                <div key={index} className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-background border border-border hover:border-accent/30 transition-all">
                                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <concept.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1 sm:mb-2">{concept.title}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm sm:text-base text-secondary mb-4 sm:mb-6 leading-relaxed">{concept.description}</p>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {concept.keyPoints.map((point, idx) => (
                                            <li key={idx} className="flex items-center gap-2 sm:gap-3 text-secondary">
                                                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                                                <span className="text-xs sm:text-sm font-medium">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Documentation Links Section */}
                <section id="documentation" className="py-12 sm:py-16 md:py-20 bg-background">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Documentation & Resources</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Essential links for building AI agent systems
                            </p>
                        </div>

                        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 md:space-y-12">
                            {documentationLinks.map((category, categoryIndex) => (
                                <div key={categoryIndex}>
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center">
                                            <category.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{category.category}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                        {category.items.map((item, itemIndex) => (
                                            <a
                                                key={itemIndex}
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="glass-card p-4 sm:p-5 rounded-lg sm:rounded-xl bg-surface border border-border hover:border-accent/30 transition-all hover:-translate-y-1 group"
                                            >
                                                <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                    <h4 className="text-sm sm:text-base font-bold text-primary group-hover:text-accent transition-colors">{item.name}</h4>
                                                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted group-hover:text-accent transition-colors flex-shrink-0 ml-2" />
                                                </div>
                                                <p className="text-xs sm:text-sm text-secondary leading-relaxed">{item.description}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Best Practices Section */}
                <section id="best-practices" className="py-12 sm:py-16 md:py-20 bg-surface border-y border-border">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Best Practices</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Guidelines for successful AI agent deployments
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                            {bestPractices.map((practice, index) => (
                                <div key={index} className="text-center p-3 sm:p-4 md:p-6">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <practice.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
                                    </div>
                                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary mb-1 sm:mb-2">{practice.title}</h3>
                                    <p className="text-xs sm:text-sm text-secondary leading-relaxed">{practice.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Learning Path Section */}
                <section id="learning-path" className="py-12 sm:py-16 md:py-20 bg-background">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Learning Path</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                A structured approach to mastering agentic AI
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            {[
                                {
                                    step: '01',
                                    title: 'Foundation: LLM Fundamentals',
                                    description: 'Start with understanding how Large Language Models work, including prompt engineering, tokenization, and model capabilities.',
                                    resources: ['OpenAI Documentation', 'Anthropic Prompt Engineering Guide']
                                },
                                {
                                    step: '02',
                                    title: 'Tool Use & Function Calling',
                                    description: 'Learn how to extend LLMs with external tools, APIs, and function calling to enable agents to take actions.',
                                    resources: ['OpenAI Function Calling', 'Claude Tool Use Documentation']
                                },
                                {
                                    step: '03',
                                    title: 'Agent Frameworks',
                                    description: 'Explore frameworks like LangChain and LangGraph to build structured, composable agent applications.',
                                    resources: ['LangChain Documentation', 'LangGraph Tutorials']
                                },
                                {
                                    step: '04',
                                    title: 'Multi-Agent Systems',
                                    description: 'Design systems with multiple specialized agents that collaborate, delegate, and coordinate on complex tasks.',
                                    resources: ['AutoGen Framework', 'CrewAI Documentation']
                                },
                                {
                                    step: '05',
                                    title: 'RAG & Knowledge Integration',
                                    description: 'Implement retrieval-augmented generation to give agents access to your organization\'s knowledge bases.',
                                    resources: ['Pinecone Tutorials', 'LangChain RAG Guide']
                                },
                                {
                                    step: '06',
                                    title: 'Enterprise Deployment',
                                    description: 'Deploy agents in production with proper security, monitoring, and governance frameworks.',
                                    resources: ['AWS Bedrock', 'Azure AI Services']
                                }
                            ].map((phase, index) => (
                                <div key={index} className="flex gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center border-2 border-accent/20 group-hover:border-accent transition-colors flex-shrink-0">
                                            <span className="text-base sm:text-lg md:text-xl font-black text-accent">{phase.step}</span>
                                        </div>
                                        {index < 5 && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-accent/30 to-transparent mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4 sm:pb-6 md:pb-8">
                                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary mb-1 sm:mb-2 group-hover:text-accent transition-colors">
                                            {phase.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-secondary leading-relaxed mb-2 sm:mb-3">{phase.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {phase.resources.map((resource, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-accent/10 text-[10px] sm:text-xs font-medium text-accent">
                                                    <BookMarked className="w-3 h-3" />
                                                    {resource}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 sm:py-16 md:py-20 bg-surface border-t border-border">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-accent/10 mb-4 sm:mb-6">
                                <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-accent" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-4 sm:mb-6 px-2">
                                Ready to Build with AI Agents?
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-secondary max-w-3xl mx-auto leading-relaxed px-2 mb-8 sm:mb-10">
                                Let our team help you navigate the world of agentic AI. From strategy to implementation, we're here to support your autonomous systems journey.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                                <Link
                                    to="/agentic-ai"
                                    className="btn btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover-lift justify-center touch-target"
                                >
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Explore Our Solutions
                                </Link>
                                <Link
                                    to="/contact"
                                    className="btn btn-ghost px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover-lift border-2 justify-center touch-target"
                                >
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /> Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};
