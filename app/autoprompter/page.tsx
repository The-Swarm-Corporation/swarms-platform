import PromptOptimizer from "@/shared/components/prompt_optimizer/main";

export default function PrompterPage() {
  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-6">
        <PromptOptimizer />
      </div>
    </div>
  );
}