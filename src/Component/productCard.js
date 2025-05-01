export default function ProductCard({ product, onViewAR }) {
    return (
      <div className="product-card">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-details">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price">${product.price.toFixed(2)}</div>
          <button onClick={onViewAR} className="ar-button">
            View in AR
          </button>
        </div>
        
        <style jsx>{`
          .product-card {
            display: flex;
            gap: 40px;
            margin-top: 40px;
          }
          .product-image {
            flex: 1;
          }
          .product-image img {
            width: 100%;
            height: auto;
            border-radius: 8px;
          }
          .product-details {
            flex: 1;
          }
          .price {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }
          .ar-button {
            background: #0070f3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .ar-button:hover {
            background: #0366d6;
          }
        `}</style>
      </div>
    );
  }