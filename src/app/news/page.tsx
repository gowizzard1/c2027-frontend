'use client';

import { useEffect, useState } from 'react';

type Tab = 'statement' | 'photo' | 'event';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  type: string;
  emoji?: string;
  image?: string;
  time?: string;
  location?: string;
}

import PageHeader from '@/components/PageHeader';

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('statement');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/content/news?type=${activeTab}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="bg-white text-brand-black">
      <PageHeader label="Media & Updates" title="News & Events" subtitle="Statements, campaign photos, and upcoming events." />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tabs — horizontally scrollable on small screens */}
        <div className="flex border-b-2 border-gray-100 mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {(['statement','photo','event'] as Tab[]).map((tab, i) => {
            const labels = ['📋 Statements','📸 Photos','📅 Events'];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? 'border-brand-yellow text-brand-black'
                    : 'border-transparent text-gray-400 hover:text-brand-black'
                }`}>{labels[i]}</button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">No {activeTab}s posted yet. Check back soon!</p>
          </div>
        )}

        {/* Statements Tab */}
        {!loading && activeTab === 'statement' && items.length > 0 && (
          <div className="space-y-6">
            {items.map((item) => (
              <article key={item.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-brand-green bg-brand-yellow/10 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
                <button
                  className="mt-4 text-sm text-brand-green font-medium hover:text-brand-green"
                  onClick={() => {
                    navigator.share?.({
                      title: item.title,
                      text: item.content?.slice(0, 100) + '...',
                      url: window.location.href,
                    });
                  }}
                >
                  📤 Share this statement
                </button>
              </article>
            ))}
          </div>
        )}

        {/* Photos Tab */}
        {!loading && activeTab === 'photo' && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((photo) => (
              <div key={photo.id} className="card hover:shadow-lg transition-shadow text-center">
                <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-3">
                  {photo.image ? (
                    <img src={photo.image} alt={photo.title} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-5xl">{photo.emoji || '📸'}</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{photo.title}</h3>
                <p className="text-xs text-gray-500">{new Date(photo.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {!loading && activeTab === 'event' && items.length > 0 && (
          <div className="space-y-4">
            {items.map((event) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="bg-primary-100 rounded-lg p-4 text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-brand-green">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-xs text-brand-green font-medium">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{event.content}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {event.time && <span>🕐 {event.time}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <button className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
                    RSVP
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}