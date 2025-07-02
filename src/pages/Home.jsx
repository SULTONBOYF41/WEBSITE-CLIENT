import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import Logo from "../assets/icons/logo.jpg"

const products = [
  { id: 1, name: "Napoleon tort", price: 85000, image: Logo },
  { id: 2, name: "Medovik tort", price: 90000, image: Logo },
  { id: 3, name: "Praga tort", price: 100000, image: Logo },
];





const Home = () => {
    return (
        <div className="home-page">
            <Navbar />
            <Hero />
            <section className="products-section">
                <h2>Mashhur tortlar</h2>
                <div className="products-list">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.image}
                        />
                    ))}
                </div>
            </section>
        </div>


    )
}

export default Home