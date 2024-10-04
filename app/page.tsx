import SliderPage from "@/components/SliderPage";

export default async function Index() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-xs md:max-w-2xl lg:max-w-5xl h-full overflow-hidden">
        <SliderPage />
      </div>
    </div>
  );
}