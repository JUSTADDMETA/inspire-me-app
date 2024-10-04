import React, { Suspense } from 'react';
import SliderPage from "@/components/SliderPage";

// Memoize the SliderPage component
const MemoizedSliderPage = React.memo(SliderPage);

export default async function Index() {
  return (
    <div className="flex justify-center items-center h-fit md:h-screen">
      <div className="w-full max-w-xs md:max-w-2xl lg:max-w-5xl overflow-hidden">
        <Suspense fallback={<div>Loading Slider...</div>}>
          <MemoizedSliderPage />
        </Suspense>
      </div>
    </div>
  );
}