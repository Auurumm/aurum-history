type ProductFeatureProps = {
  title: string
  description: string
  image: string
  color: "red" | "green" | "blue"
}

export default function ProductFeature({ title, description, image, color }: ProductFeatureProps) {
  const colorMap = {
    red: "text-red-500 dark:text-red-400",
    green: "text-green-500 dark:text-green-400",
    blue: "text-cyan-500 dark:text-cyan-400",
  }

  return (
    <div className="w-full bg-white dark:bg-black transition-colors duration-300 px-4 py-40 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-14">
        {/* 텍스트 영역 */}
        <div className="flex-1 text-left space-y-5 max-w-lg md:pl-6">
          <h2 className={`text-4xl md:text-5xl font-bold ${colorMap[color]} leading-tight`}>
            {title}
          </h2>
          <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* 이미지 영역 */}
        <div className="flex-1 flex justify-center items-center min-h-[250px] bg-transparent">
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