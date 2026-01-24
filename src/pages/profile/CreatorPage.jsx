"use client";
import React from "react";
import { 
  Github, 
  Instagram, 
  Send, 
  Globe, 
  Code2, 
  Cpu, 
  Layers,
  ExternalLink,
  Mail,
  Database,
  FileText
} from "lucide-react";

export function CreatorPage() {


const creatorData = {
    name: "Мирбек Атанбеков",
    role: "Fullstack Developer",
    bio: "Я создаю современные веб-приложения с фокусом на чистоту кода и удобство пользователя. Этот проект был разработан, чтобы помочь студентам эффективно готовиться к тестам.",
    avatar: "https://avatars.githubusercontent.com/u/184377146?v=4",
    socials: [
      { icon: <Github size={20} />, label: "GitHub", link: "https://github.com/mirbek10", color: "hover:bg-slate-900" },
      { icon: <Instagram size={20} />, label: "Instagram", link: "https://instagram.com/bad.b0y10  ", color: "hover:bg-pink-600" },
      { icon: <Send size={20} />, label: "Telegram", link: "https://t.me/atabekov_mirbek", color: "hover:bg-blue-500" },
      { icon: <Mail size={20} />, label: "Email", link: "mailto:mirbekbook@gmail.com", color: "hover:bg-indigo-600" },
      { icon: <FileText size={20} />, label: "Портфолио", link: "https://portfolio-omega-lake-87.vercel.app/", color: "hover:bg-amber-600" }
    ],
    skills: [
      { name: "Frontend", tools: "React, Next.js, Tailwind, React Native", icon: <Layers className="text-indigo-500" /> },
      { name: "Backend", tools: "Node.js, Express, MongoDB", icon: <Database className="text-violet-500" /> },
      { name: "Design", tools: "Figma, Framer Motion", icon: <Cpu className="text-pink-500" /> },
    ]
};

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-20">
      {/* Декоративные пятна на фоне в стиле Dashboard */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 -right-24 w-64 h-64 bg-pink-100/30 rounded-full blur-3xl -z-10"></div>

      {/* ГЛАВНАЯ КАРТОЧКА */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          
          {/* Фото профиля */}
          <div className="relative shrink-0">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rotate-3 shadow-2xl">
              <img
                src={creatorData.avatar}
                alt="Creator"
                className="w-full h-full rounded-[2.2rem] object-cover border-4 border-white -rotate-3 transition-transform hover:rotate-0 duration-500"
              />
            </div>
          </div>

          {/* Инфо */}
          <div className="flex-1 text-center md:text-left">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
              Creator & Developer
            </span>
            <h1 className="text-5xl font-black mt-4 text-slate-800 tracking-tight">
              {creatorData.name}
            </h1>
            <p className="text-xl font-medium text-indigo-500 mt-2 italic">
              {creatorData.role}
            </p>
            <p className="mt-6 text-slate-500 leading-relaxed font-medium max-w-lg">
              {creatorData.bio}
            </p>

            {/* Соцсети */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
              {creatorData.socials.map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold transition-all duration-300 hover:text-white ${social.color} hover:-translate-y-1 shadow-sm`}
                >
                  {social.icon}
                  <span className="text-sm">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* СЕКЦИЯ СТЕКА / НАВЫКОВ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-2">
        {creatorData.skills.map((skill, i) => (
          <div 
            key={i} 
            className="bg-white/60 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300"
          >
            <div className="mb-4 p-4 bg-white rounded-2xl shadow-md group-hover:scale-110 transition-transform">
              {skill.icon}
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">{skill.name}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
              {skill.tools}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}