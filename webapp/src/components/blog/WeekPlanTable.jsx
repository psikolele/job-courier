import React from 'react';
import { motion } from 'framer-motion';

const WeekPlanTable = ({ weeks = [] }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 1,
        background: 'rgba(5,11,43,0.08)',
        border: '1px solid rgba(5,11,43,0.08)',
        marginBottom: 14,
      }}
    >
      {weeks.map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          style={{ background: '#fff', padding: '18px 20px' }}
        >
          <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-fuchsia)' }}>
            {w.week}
          </span>
          <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 18, color: 'var(--brand-navy)', margin: '4px 0 10px' }}>
            {w.title}
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {w.items.map((item, k) => (
              <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                <span style={{ width: 6, height: 6, marginTop: 8, background: 'var(--brand-fuchsia)', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.7, color: 'var(--brand-navy)', opacity: 0.85 }}>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
};

export default WeekPlanTable;
