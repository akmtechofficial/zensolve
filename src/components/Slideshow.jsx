import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HeroSection = () => {
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const imagesCollection = collection(db, 'images');
      const imagesSnapshot = await getDocs(imagesCollection);
      const imagesList = imagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(imagesList);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (!isHovered && images.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentSlide((currentSlide + 1) % images.length);
      }, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [currentSlide, images.length, isHovered]);

  const nextSlide = () => setCurrentSlide((currentSlide + 1) % images.length);
  const prevSlide = () => setCurrentSlide((currentSlide - 1 + images.length) % images.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div
      className="relative w-full h-[500px] bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.length > 0 ? (
        <>
          <div className="relative h-full">
            <img
              src={images[currentSlide].imageUrl}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            <div className="absolute top-1/3 left-6 md:left-12">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                {images[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl mb-6 drop-shadow-md">
                {images[currentSlide].description}
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-800 text-white px-6 py-3 rounded-full shadow-lg transition-all">
                Explore More
              </button>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 bg-white text-indigo-700 rounded-full shadow-lg hover:scale-110 transition-all"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 bg-white text-indigo-700 rounded-full shadow-lg hover:scale-110 transition-all"
          >
            <FaChevronRight />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-4 h-4 rounded-full bg-white border-2 border-indigo-700 transition-all ${
                  currentSlide === index ? 'bg-indigo-700' : 'opacity-50'
                }`}
              ></button>
            ))}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-xl">Loading images...</div>
      )}
    </div>
  );
};

export default HeroSection;
