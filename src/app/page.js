'use client'
import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    id: '1',
    name: 'Modern Chair',
    description: 'Comfortable modern chair for your home',
    price: 199.99,
    image: '/images/chair.jpg'
  },
  {
    id: '2',
    name: 'Coffee Table',
    description: 'Elegant coffee table for your living room',
    price: 249.99,
    image: '/images/chair.jpg'
  }
];

export default function Home() {
  return (
    <div className="container">
      <h1>Our Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <Image
            src={product.image}
            alt={product.name}
            />
           
            <h2>{product.name}</h2>
            <p>${product.price.toFixed(2)}</p>
            <Link href={`/product/${product.id}`} className="view-button">
              View Details
            </Link>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        .product-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .product-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 4px;
        }
        .view-button {
          display: inline-block;
          margin-top: 15px;
          padding: 8px 16px;
          background: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        .view-button:hover {
          background: #0366d6;
        }
      `}</style>
    </div>
  );
}