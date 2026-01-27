import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
    Bot, 
    Brain, 
    Network, 
    Shield, 
    GitBranch, 
    Database, 
    Cloud, 
    Lock, 
    Zap, 
    CheckCircle, 
    ArrowRight,
    Cpu,
    Activity,
    Server,
    Workflow,
    MessageSquare,
    BarChart3,
    Cog,
    Layers,
    Eye,
    FileCode,
    Phone
} from 'lucide-react';
import { Schema } from '../components/Schema';
import { generatePageTitle, generateMetaDescription, generateCanonicalUrl } from '../utils/seo';
import { AgenticAIContactForm } from '../components/AgenticAIContactForm';

export const AgenticAIPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const pageTitle = generatePageTitle('Agentic AI Solutions Development');
    const metaDescription = generateMetaDescription(
        'Build intelligent AI agents that think, decide, and act autonomously. Enterprise agentic AI development with multi-agent orchestration, tool integration, and secure execution environments.'
    );
    const canonicalUrl = generateCanonicalUrl('/agentic-ai');

    // Schema markup for the service
    const agenticAIServiceSchema = {
        '@type': 'Service',
        serviceType: 'Agentic AI Solutions Development',
        name: 'Agentic AI Solutions',
        description: 'Enterprise-grade autonomous AI agents for complex task automation, decision-making, and workflow orchestration',
        provider: {
            '@type': 'Organization',
            name: 'Swaz Solutions',
            url: 'https://swazdatarecovery.com'
        },
        areaServed: 'Worldwide',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Agentic AI Services',
            itemListElement: [
                {
                    '@type': 'Service',
                    name: 'Autonomous AI Agents',
                    description: 'Task-driven agents capable of planning, reasoning, and executing workflows end-to-end'
                },
                {
                    '@type': 'Service',
                    name: 'Multi-Agent Orchestration',
                    description: 'Collaborative agents that communicate, negotiate, and coordinate to achieve shared goals'
                },
                {
                    '@type': 'Service',
                    name: 'Domain-Specific Intelligence',
                    description: 'Custom knowledge models tailored to enterprise processes and compliance needs'
                }
            ]
        }
    };

    const faqSchema = {
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'What is Agentic AI?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Agentic AI refers to autonomous AI systems that can plan, make decisions, take actions, and interact with tools/APIs to achieve specific goals with minimal human intervention. Unlike traditional AI that simply responds to inputs, agentic AI can reason through complex multi-step tasks.'
                }
            },
            {
                '@type': 'Question',
                name: 'How secure are AI agents in enterprise environments?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our AI agents operate in policy-enforced sandboxed environments with comprehensive audit logging, identity and access controls, and enterprise-grade safeguards. We implement role-based permissions, data encryption, and secure API gateways to ensure agents cannot exceed authorized boundaries.'
                }
            },
            {
                '@type': 'Question',
                name: 'What LLM models do you support?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We support all major LLM ecosystems including OpenAI (GPT-4, GPT-4 Turbo), Anthropic Claude, Google Gemini, Meta Llama, and hybrid architectures. We help select the optimal model based on your use case, budget, latency requirements, and compliance needs.'
                }
            },
            {
                '@type': 'Question',
                name: 'Can agents integrate with our existing systems?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. Our agents can safely interact with databases, REST APIs, internal systems, CRMs, ERPs, and third-party applications through secure integration frameworks. We support both cloud-native and on-premises deployments with enterprise SSO and VPC configurations.'
                }
            }
        ]
    };

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
                <meta property="og:image" content="https://swazdatarecovery.com/assets/agentic-ai-og.jpg" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content="https://swazdatarecovery.com/assets/agentic-ai-twitter.jpg" />
                
                {/* Keywords */}
                <meta name="keywords" content="agentic AI, autonomous agents, AI automation, multi-agent systems, enterprise AI, AI orchestration, LLM agents, intelligent automation, AI workflow, OpenAI agents, Claude agents" />
            </Helmet>

            {/* Schema Markup */}
            <Schema type="WebApplication" data={agenticAIServiceSchema} />
            <Schema type="FAQPage" data={faqSchema} />

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
                                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                                    <span className="text-[10px] sm:text-xs font-bold text-accent uppercase tracking-wider">Enterprise AI Innovation</span>
                                </div>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-center text-primary mb-4 sm:mb-6 leading-tight">
                                Agentic AI Solutions<br />
                                <span className="text-transparent bg-clip-text bg-brand-gradient">Development</span>
                            </h1>

                            {/* Subheading */}
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center text-secondary max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2">
                                Building intelligent systems that think, decide, and act.
                            </p>

                            {/* Description */}
                            <p className="text-sm sm:text-base md:text-lg text-center text-secondary max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
                                Our Agentic AI solutions enable enterprises to <strong>automate complex tasks</strong>, enhance decision-making, and orchestrate multi-step workflows with minimal human intervention. We design and develop fully autonomous and semi-autonomous AI agents that integrate seamlessly into your business ecosystem.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 md:mb-16 px-4 sm:px-0">
                                <button
                                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="btn btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover-lift justify-center touch-target"
                                >
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> Start Your AI Journey
                                </button>
                                <Link to="/agentic-ai/resources" className="btn btn-ghost px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover-lift border-2 justify-center touch-target">
                                    <FileCode className="w-4 h-4 sm:w-5 sm:h-5" /> Resources & Docs
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-secondary">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                    <span>SOC 2 Compliant</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                    <span>Enterprise-Grade Security</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                    <span>Cloud & On-Premises</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Capabilities */}
                <section id="capabilities" className="py-12 sm:py-16 md:py-20 bg-surface border-y border-border">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Core Capabilities</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Comprehensive AI agent development powered by cutting-edge frameworks and models
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                            {[
                                {
                                    icon: Bot,
                                    title: 'Autonomous AI Agents',
                                    description: 'Task-driven agents capable of planning, reasoning, and executing workflows end-to-end with self-correction and adaptive learning.'
                                },
                                {
                                    icon: Network,
                                    title: 'Multi-Agent Orchestration',
                                    description: 'Collaborative agents that communicate, negotiate, and coordinate to achieve shared goals across distributed systems.'
                                },
                                {
                                    icon: Brain,
                                    title: 'Domain-Specific Intelligence',
                                    description: 'Custom knowledge models tailored to enterprise processes, compliance needs, and operational logic with fine-tuned accuracy.'
                                },
                                {
                                    icon: GitBranch,
                                    title: 'Tool & API Integration',
                                    description: 'Agents that safely interact with databases, APIs, internal systems, and third-party applications through secure gateways.'
                                },
                                {
                                    icon: Shield,
                                    title: 'Secure Execution Environment',
                                    description: 'Policy-enforced sandboxing, comprehensive audit logging, identity & access controls, and enterprise-grade safeguards.'
                                },
                                {
                                    icon: Eye,
                                    title: 'Observability & Monitoring',
                                    description: 'Real-time agent performance tracking, decision transparency, cost monitoring, and comprehensive logging for compliance.'
                                }
                            ].map((capability, index) => (
                                <div key={index} className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 bg-background border border-border">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                                        <capability.icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 sm:mb-3">{capability.title}</h3>
                                    <p className="text-sm sm:text-base text-secondary leading-relaxed">{capability.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* What We Build */}
                <section id="solutions" className="py-12 sm:py-16 md:py-20 bg-background">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">What We Build</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Custom AI agent solutions for every business need
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                            {[
                                {
                                    icon: MessageSquare,
                                    title: 'AI Assistants',
                                    description: 'Intelligent assistants for customer support, knowledge management, and digital operations',
                                    features: ['24/7 Customer Support', 'Knowledge Base Search', 'Ticket Routing & Escalation', 'Multi-Language Support']
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Decision-Support Agents',
                                    description: 'Data-driven agents for forecasting, analytics, and automated reporting',
                                    features: ['Predictive Analytics', 'Automated Report Generation', 'Anomaly Detection', 'Strategic Recommendations']
                                },
                                {
                                    icon: Cog,
                                    title: 'Operational Agents',
                                    description: 'IT automation, DevOps workflows, and enterprise governance agents',
                                    features: ['Infrastructure Management', 'CI/CD Automation', 'Incident Response', 'Compliance Monitoring']
                                },
                                {
                                    icon: Workflow,
                                    title: 'RPA-Enhanced Agents',
                                    description: 'Blending AI with robotic process automation for maximum productivity',
                                    features: ['Document Processing', 'Data Entry Automation', 'Legacy System Integration', 'Workflow Orchestration']
                                },
                                {
                                    icon: Layers,
                                    title: 'Custom Multi-Modal Agents',
                                    description: 'Advanced agents using text, voice, vision, and structured data models',
                                    features: ['Document Understanding', 'Image Analysis', 'Voice Recognition', 'Multi-Source Intelligence']
                                },
                                {
                                    icon: Database,
                                    title: 'Enterprise Knowledge Agents',
                                    description: 'RAG-powered agents with access to your proprietary knowledge bases',
                                    features: ['Document Retrieval', 'Contextual Answers', 'Citation Tracking', 'Version Control']
                                }
                            ].map((solution, index) => (
                                <div key={index} className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all">
                                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <solution.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1 sm:mb-2">{solution.title}</h3>
                                            <p className="text-sm sm:text-base text-secondary">{solution.description}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 sm:space-y-3">
                                        {solution.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 sm:gap-3 text-secondary">
                                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section id="why-us" className="py-12 sm:py-16 md:py-20 bg-surface border-y border-border">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Why Choose Us</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Proven expertise in enterprise AI implementation
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                            {[
                                {
                                    icon: Server,
                                    title: 'Enterprise Architecture',
                                    description: 'Strong focus on scalability, security, and enterprise integration patterns'
                                },
                                {
                                    icon: Cpu,
                                    title: 'Multi-LLM Expertise',
                                    description: 'OpenAI, Anthropic, Google Gemini, Llama, and hybrid LLM ecosystems'
                                },
                                {
                                    icon: Activity,
                                    title: 'Proven Frameworks',
                                    description: 'Observability, policy enforcement, and orchestration best practices'
                                },
                                {
                                    icon: Cloud,
                                    title: 'Flexible Deployment',
                                    description: 'On-premises, cloud, hybrid, and air-gapped environments'
                                }
                            ].map((benefit, index) => (
                                <div key={index} className="text-center p-3 sm:p-4 md:p-6">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
                                    </div>
                                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary mb-1 sm:mb-2">{benefit.title}</h3>
                                    <p className="text-xs sm:text-sm text-secondary leading-relaxed">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Approach */}
                <section id="approach" className="py-12 sm:py-16 md:py-20 bg-background">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Our Approach</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                A systematic methodology for successful AI agent deployment
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            {[
                                {
                                    step: '01',
                                    title: 'Discovery & Use-Case Assessment',
                                    description: 'Identify high-impact automation opportunities, define success metrics, and validate technical feasibility'
                                },
                                {
                                    step: '02',
                                    title: 'Architecture & Agent Design',
                                    description: 'Design agent workflows, define tool integrations, establish security boundaries, and plan scalability'
                                },
                                {
                                    step: '03',
                                    title: 'Model Selection & Fine-Tuning',
                                    description: 'Choose optimal LLMs, fine-tune on domain data, implement retrieval-augmented generation (RAG)'
                                },
                                {
                                    step: '04',
                                    title: 'API / Tool Integration',
                                    description: 'Connect agents to databases, CRMs, ERPs, and third-party services with secure authentication'
                                },
                                {
                                    step: '05',
                                    title: 'Testing, Safety Validation, and Monitoring',
                                    description: 'Comprehensive testing, red-teaming, safety guardrails, and observability implementation'
                                },
                                {
                                    step: '06',
                                    title: 'Deployment & Continuous Optimization',
                                    description: 'Production deployment, performance monitoring, user feedback loops, and iterative improvements'
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
                                        <p className="text-sm sm:text-base text-secondary leading-relaxed">{phase.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Technology Stack */}
                <section className="py-12 sm:py-16 md:py-20 bg-surface border-y border-border">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">Technology Stack</h2>
                            <p className="text-sm sm:text-base md:text-lg text-secondary max-w-2xl mx-auto px-2">
                                Built on industry-leading AI frameworks and platforms
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                                {['OpenAI', 'Anthropic', 'Google Gemini', 'Meta Llama', 'LangChain', 'LangGraph', 'AutoGen', 'CrewAI', 'Azure AI', 'AWS Bedrock', 'Hugging Face', 'Pinecone'].map((tech, index) => (
                                    <div key={index} className="glass-card p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl text-center bg-background border border-border hover:border-accent/30 transition-all hover:-translate-y-1">
                                        <div className="text-sm sm:text-base md:text-lg font-bold text-primary">{tech}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section - Professional Inquiry Form */}
                <section id="contact" className="py-12 sm:py-16 md:py-20 bg-background">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="max-w-5xl mx-auto">
                            {/* Section Header */}
                            <div className="text-center mb-8 sm:mb-10 md:mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-accent/10 mb-4 sm:mb-6">
                                    <Zap className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-accent" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-4 sm:mb-6 px-2">
                                    Ready to Transform Your Business?
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-secondary max-w-3xl mx-auto leading-relaxed px-2">
                                    Let's discuss how Agentic AI can deliver measurable impact, improved efficiency, and future-ready automation for your organization.
                                </p>
                            </div>

                            {/* Contact Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
                                <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-surface border border-border text-center hover:border-accent/30 transition-all">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                                    </div>
                                    <h3 className="font-bold text-primary text-sm sm:text-base mb-2">Call Us</h3>
                                    <a href="tel:+919701087446" className="text-accent hover:text-accent-hover font-medium text-sm sm:text-base touch-target py-1 inline-block">
                                        +91-9701087446
                                    </a>
                                    <p className="text-[10px] sm:text-xs text-muted mt-2">Mon-Fri, 9 AM - 6 PM IST</p>
                                </div>

                                <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-surface border border-border text-center hover:border-accent/30 transition-all">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                                    </div>
                                    <h3 className="font-bold text-primary text-sm sm:text-base mb-2">Email Us</h3>
                                    <a href="mailto:info@swazsolutions.com" className="text-accent hover:text-accent-hover font-medium text-xs sm:text-sm md:text-base break-all touch-target py-1 inline-block">
                                        info@swazsolutions.com
                                    </a>
                                    <p className="text-[10px] sm:text-xs text-muted mt-2">Response within 24 hours</p>
                                </div>

                                <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-surface border border-border text-center hover:border-accent/30 transition-all sm:col-span-2 md:col-span-1">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                                    </div>
                                    <h3 className="font-bold text-primary text-sm sm:text-base mb-2">Free Consultation</h3>
                                    <p className="text-secondary text-xs sm:text-sm">
                                        NDA-protected strategy session
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-muted mt-2">30-minute discovery call</p>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <AgenticAIContactForm />

                            {/* Additional Info */}
                            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
                                <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-4">
                                    <strong>Based in India</strong> · Serving clients worldwide
                                </p>
                                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                        <span>SOC 2 Type II Compliant</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                        <span>ISO 27001 Certified</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                        <span>GDPR Compliant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};
