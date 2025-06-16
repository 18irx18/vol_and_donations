'use client';

import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import ActivityCard from '@/components/activity-card';
import { ActivityType } from '@/interfaces';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface ActivityCardsCarouselProps {
  activities: ActivityType[];
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

export default function ActivityCardsCarousel({ activities }: ActivityCardsCarouselProps) {
  const [numberOfCards, setNumberOfCards] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setNumberOfCards(6);
      else if (width >= 1024) setNumberOfCards(4);
      else if (width >= 768) setNumberOfCards(3);
      else if (width >= 640) setNumberOfCards(2);
      else setNumberOfCards(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chunks = chunkArray(activities, numberOfCards);

  const isPrevDisabled = currentSlide === 0;
  const isNextDisabled = currentSlide === chunks.length - 1;

  return (
    <Carousel
      arrows
      prevArrow={<PrevArrow disabled={isPrevDisabled} />}
      nextArrow={<NextArrow disabled={isNextDisabled} />}
      infinite={false}
      afterChange={setCurrentSlide}
      className="relative z-10"
    >
      {chunks.map((chunk, index) => (
        <div key={index}>
          <div className="relative px-12">
            <div
              className="grid gap-3 p-3 m-3"
              style={{
                gridTemplateColumns: `repeat(${chunk.length}, minmax(0, 1fr))`,
              }}
            >
              {chunk.map((activity) => (
                <ActivityCard key={activity._id.toString()} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
}
