import { useState } from "react";

function ProductCard({ name, price, image }) {
  const [like, setLike] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div className="product-card">
      <img src={image} alt={name} width={120} />
      <h3>{name}</h3>
      <p>{price} so‘m</p>
      <button
        className={like ? "liked" : "notliked"}
        onClick={() => setLike(!like)}
        style={{ marginBottom: "8px" }}
      >
        {like ? "❤️ Yoqdi" : "🤍 Like"}
      </button>
      {/* <div>
        <button onClick={() => setCount(count - 1)} disabled={count === 0}>-</button>
        <span style={{ margin: "0 8px" }}>{count}</span>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div> */}
      <button className="order-btn btn--secondary" onClick={() => alert(`${name} buyurtma qilindi!`)}>
        Buyurtma berish
      </button>
    </div>
  );
}

export default ProductCard;
