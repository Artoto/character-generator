import Image from "next/image";
interface ViewImageProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ViewImage({ imageUrl, onClose }: ViewImageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <button
        className="absolute top-[8px] right-[18px] text-4xl text-white"
        onClick={onClose}
      >
        &times;
      </button>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-6 w-[95%] md:w-7xl h-full rounded-lg shadow-lg z-60 text-center">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Generated Character"
            width={512}
            height={512}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        )}
      </div>
    </div>
  );
}
