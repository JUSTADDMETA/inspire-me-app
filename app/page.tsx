import React, { Suspense } from 'react';
import SliderPage from "@/components/SliderPage";

// Memoize the SliderPage component
const MemoizedSliderPage = React.memo(SliderPage);

export default async function Index() {
  return (
    <div className="flex justify-center items-center h-fit pt-4 md:pt-24 md:pb-24 lg:pt-32 lg:pb-64 p-4 md:p-0 lg:p-0">
      <div className="w-full md:max-w-2xl lg:max-w-5xl overflow-hidden">
        <Suspense fallback={<div>Loading Slider...</div>}>
          <MemoizedSliderPage />
        </Suspense>
      </div>
    </div>
  );
}