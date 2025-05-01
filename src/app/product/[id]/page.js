"use client";
import ARViewer from '../../../Component/ARViewer';
import ProductCard from '../../../Component/productCard';
import { notFound } from 'next/navigation';
import { useState } from 'react';

const products = {
  '1': {
    id: '1',
    name: 'Modern Chair',
    description: 'Comfortable modern chair for your home',
    price: 199.99,
    image: '/images/chair.jpg',
    model: '/models/sofa.glb'
  },
  '2': {
    id: '2',
    name: 'Coffee Table',
    description: 'Elegant coffee table for your living room',
    price: 249.99,
    image: '/images/chair.jpg',
    model: '/models/sofa.glb'
  }
};

export default function ProductPage({ params }) {
  const product = products[params.id];
  const [showAR, setShowAR] = useState(false);

  if (!product) return notFound();

  return showAR ? (
    <ARViewer modelUrl= "https://modelviewer.dev/shared-assets/models/Astronaut.glb"/> //{product.model}
  ) : (
    <div className="container">
      <ProductCard 
        product={product} 
        onViewAR={() => setShowAR(true)}
      />
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}
