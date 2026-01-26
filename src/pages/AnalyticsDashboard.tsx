/**
 * AnalyticsDashboard - Analytics and metrics page
 * Ported from reference vCard app with adaptations for Swaz theme system
 * Features: Overview metrics (views, clicks, CTR), 7-day chart, per-link analytics
 */

import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { MOCK_ANALYTICS } from '@/constants/themes';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Calendar, Filter, Eye, MousePointer2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsDashboard: React.FC = () => {
  const { links } = useProfile();
  const totalViews = MOCK_ANALYTICS.reduce((acc, curr) => acc + curr.views, 0);
  const totalClicks = MOCK_ANALYTICS.reduce((acc, curr) => acc + curr.clicks, 0);
  const ctr = ((totalClicks / totalViews) * 100).toFixed(1);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
      <div className="flex justify-between items-end border-b border-gray-200 dark:border-white/5 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Views', value: totalViews, color: 'text-blue-500', icon: Eye },
           { label: 'Clicks', value: totalClicks, color: 'text-purple-500', icon: MousePointer2 },
           { label: 'CTR', value: `${ctr}%`, color: 'text-orange-500', icon: Activity }
         ].map((stat, i) => (
           <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl shadow-black/5"
            >
              <div className="flex items-center gap-3 mb-4 text-gray-500 dark:text-white/50 text-sm font-bold uppercase tracking-wider">
                   <div className={`p-2 rounded-full bg-gray-100 dark:bg-white/10 ${stat.color}`}><stat.icon size={16} /></div>
                   {stat.label}
              </div>
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
           </motion.div>
         ))}
      </div>

      {/* Chart */}
      <motion.div variants={item} className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[32px] border border-gray-200 dark:border-white/5 shadow-xl shadow-black/5">
         <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={MOCK_ANALYTICS}>
                  <defs>
                     <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.1)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c1e', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
