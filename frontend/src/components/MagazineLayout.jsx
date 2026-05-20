import React from 'react';
import { magazineData } from '../data/magazineData';

// Fungsi untuk mencocokkan nama channel dari sidebar dengan data di magazineData.js
const formatChannelId = (rawId) => {
  if (!rawId) return '';
  return rawId.toLowerCase().replace(/\s+/g, '-');
};

const MagazineLayout = ({ channelId }) => {
  const currentKey = formatChannelId(channelId);
  const articles = magazineData[currentKey] || [];

  // Kalau datanya kosong / channel belum ada beritanya
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg font-medium">Belum ada edisi majalah untuk channel ini.</p>
      </div>
    );
  }

  // Pisahkan Berita Utama (index 0) dan Berita Sampingan (index 1-4)
  const headline = articles[0];
  const subArticles = articles.slice(1);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      {/* Header Nama Majalah */}
      <div className="mb-8 border-b-4 border-slate-800 pb-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
          {headline.author}
        </h1>
        <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-sm">
          Arsip Kajian Independen • Edisi 2026
        </p>
      </div>

      {/* Grid Editorial Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* BERITA UTAMA / HEADLINE (Sebelah Kiri - Porsi Besar) */}
        <div className="lg:col-span-8 group cursor-pointer">
          <div className="relative overflow-hidden rounded-xl shadow-md aspect-[16/9] mb-5">
            <img 
              src={headline.cover} 
              alt={headline.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase rounded shadow">
              Sorotan Utama
            </div>
          </div>
          <p className="text-sm font-bold text-red-600 mb-2 uppercase">{headline.date}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4 group-hover:text-red-600 transition-colors">
            {headline.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-4">
            {headline.desc}
          </p>
        </div>

        {/* BERITA SAMPINGAN / SUB-ARTICLES (Sebelah Kanan - Berjejer 4 ke bawah) */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:pl-6 lg:border-l border-slate-200">
          <h3 className="text-lg font-bold border-b border-slate-300 pb-2 text-slate-800 uppercase">Edisi Lainnya</h3>
          
          <div className="flex flex-col gap-5">
            {subArticles.map((article) => (
              <div key={article.id} className="group cursor-pointer flex gap-4 items-center">
                <div className="relative overflow-hidden rounded-lg w-32 h-24 flex-shrink-0 shadow-sm">
                  <img 
                    src={article.cover} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{article.date}</p>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                    {article.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MagazineLayout;