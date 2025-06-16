"use client"
import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface CampaignImagesCarouselProps {
    images?: string[];
}

const customArrowStyle: React.CSSProperties = {
    background: 'white',
    color: '#439A97',
    fontSize: 24,
    borderRadius: '50%',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    cursor: 'pointer',
    userSelect: 'none',
};

const PrevArrow = ({ onClick, disabled }: { onClick?: () => void; disabled: boolean }) => (
    <div
        onClick={disabled ? undefined : onClick}
        style={{
            ...customArrowStyle,
            left: 10,
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.3 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
        }}
    >
        <LeftOutlined />
    </div>
);

const NextArrow = ({ onClick, disabled }: { onClick?: () => void; disabled: boolean }) => (
    <div
        onClick={disabled ? undefined : onClick}
        style={{
            ...customArrowStyle,
            right: 10,
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.3 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
        }}
    >
        <RightOutlined />
    </div>
);

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

const CampaignImagesCarousel: React.FC<CampaignImagesCarouselProps> = ({ images }) => {
    const [slidesToShow, setSlidesToShow] = useState(1);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1200) setSlidesToShow(4);
            else if (width >= 992) setSlidesToShow(3);
            else if (width >= 768) setSlidesToShow(2);
            else setSlidesToShow(1);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!images || images.length === 0) {
        return <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">No images</div>;
    }

    const totalScrollableSlides = Math.max(0, images.length - slidesToShow + 1);
    const isPrevDisabled = currentSlide === 0;
    const isNextDisabled = currentSlide >= totalScrollableSlides - 1 || images.length <= slidesToShow;


    return (
        <Carousel
            autoplay={false}
            className="bg-gray-100 rounded-lg overflow-hidden relative z-10 px-[50px]"
            arrows={true}
            prevArrow={<PrevArrow disabled={isPrevDisabled} />}
            nextArrow={<NextArrow disabled={isNextDisabled} />}
            infinite={false}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
            afterChange={setCurrentSlide}
            dots={false}
        >
            {images.map((img, idx) => (
                <div key={idx} className="h-64 px-4">
                    <div className="h-full w-full overflow-hidden rounded-md">
                        <img
                            src={img}
                            alt={`Campaign image ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            ))}
        </Carousel>
    );
};

export default CampaignImagesCarousel;