const elements = [
  {
    icon: "📸",
    title: "Capture",
    description: "Use your camera to photograph text",
  },
  {
    icon: "✂️",
    title: "Crop",
    description: "Select the exact fragment you want",
  },
  {
    icon: "🤖",
    title: "Recognize",
    description: "Automatically extract the quotes",
  },
];

export const IndexCards = () => {
  return (
    <div className="flex sm:flex-row flex-col gap-4">
      {elements.map((element) => (
        <div
          className="bg-background-elevated flex flex-col items-center text-center p-4 rounded-lg border-border border gap-2"
          key={element.title}
        >
          <div className="flex flex-col gap-2">
            <span className="text-3xl">{element.icon}</span>
            <h2 className="font-semibold">{element.title}</h2>
          </div>
          <p className="text-sm md:max-w-[16ch]">{element.description}</p>
        </div>
      ))}
    </div>
  );
};
