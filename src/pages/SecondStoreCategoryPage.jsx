// src/pages/SecondStoreCategoryPage.jsx
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconShoppingBag } from '@tabler/icons-react';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../utils/theme';

export default function SecondStoreCategoryPage({ storeData, onBack }) {
  const { categoryId } = useParams();

  const category = useMemo(() =>
    (storeData?.categories || []).find(c => c.id === categoryId),
    [storeData, categoryId]
  );

  const products = useMemo(() =>
    (storeData?.products || []).filter(p => p.categoryId === categoryId),
    [storeData, categoryId]
  );

  if (!category) {
    return (
      <div className="main-content" style={{ padding: 40, textAlign: 'center' }}>
        <IconShoppingBag size={48} color={COLORS.borderLight} />
        <p style={{ color: COLORS.textMuted, marginTop: 16 }}>Categoria no encontrada</p>
      </div>
    );
  }

  const hasImage = !!category.image;

  return (
    <div className="main-content">
      {/* Banner with clear background image */}
      <div style={{
        position: 'relative', width: '100%', height: 200, overflow: 'hidden',
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyDark} 100%)`,
      }}>
        {hasImage && (
          <motion.img src={category.image} alt={category.name}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              position: 'absolute', inset: 0,
            }}
          />
        )}

        {/* Light bottom gradient only */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: hasImage
            ? 'linear-gradient(0deg, rgba(26,39,68,0.8) 0%, rgba(26,39,68,0.15) 50%, transparent 100%)'
            : 'linear-gradient(0deg, rgba(26,39,68,0.5) 0%, transparent 60%)',
        }} />

        {/* Decorative corners */}
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, width: 20, height: 20,
          borderTop: '2px solid rgba(247,103,7,0.3)', borderRight: '2px solid rgba(247,103,7,0.3)', borderRadius: '0 5px 0 0',
        }} />
        <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 2, width: 20, height: 20,
          borderBottom: '2px solid rgba(247,103,7,0.3)', borderLeft: '2px solid rgba(247,103,7,0.3)', borderRadius: '0 0 0 5px',
        }} />

        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 22, gap: 6, zIndex: 3,
        }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.4rem, 5vw, 1.7rem)',
              fontWeight: 700, color: COLORS.white, textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {category.name}
          </motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{ width: 40, height: 2, borderRadius: 1, background: `linear-gradient(90deg, transparent, ${COLORS.orange}, transparent)` }}
          />
          <span style={{
            fontFamily: '"Outfit", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)',
            letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {products.length} productos
          </span>
        </div>
      </div>

      {/* Products */}
      <section style={{ padding: '28px 16px 32px', background: 'rgba(255,255,255,0.9)' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <IconShoppingBag size={48} color={COLORS.borderLight} />
            </motion.div>
            <p style={{ fontFamily: '"Playfair Display", serif', color: COLORS.textMuted, marginTop: 16 }}>Proximamente</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
