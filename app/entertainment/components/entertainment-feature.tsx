type ProductFeatureProps = {
  title: string
  description: string
  image: string
  color: "red" | "green" | "blue"
}

export default function ProductFeature({ title, description, image, color }: ProductFeatureProps) {
  const colorMap = {
    red: "text-rose-300",
    green: "text-amber-200",
    blue: "text-purple-300",
  }

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300 px-4 py-80 flex flex-col items-center justify-center">
      {/* ✅ 본문 영역 */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1 text-left space-y-6 max-w-lg md:pl-6">
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${colorMap[color]} leading-tight`}>
            {title}
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl leading-loose text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {description}
          </p>
        </div>

        <div className="flex-1 flex justify-center items-center min-h-[200px] bg-transparent">
          <img
            src={image}
            alt={title}
            className="w-auto h-72 max-h-80 object-contain"
          />
        </div>
      </div>
    </div>
  )
}