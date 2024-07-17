import { UserUsage } from '@/shared/utils/api/usage';

export const modelColors = [
  '#36A2EB', // Blue
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#8A2BE2', // BlueViolet
  '#00FF7F', // SpringGreen
  '#1E90FF', // DodgerBlue
];

export const getColorForModel = (
  modelName: string,
  usageData: UserUsage | null,
) => {
  const index = Object.keys(usageData?.dailyCosts[0]?.model || {}).indexOf(
    modelName,
  );
  return (
    modelColors[index % modelColors.length] ||
    modelColors[modelColors.length - 1]
  );
};
