import {
  VLM_SAMPLE_GO_FUNC,
  VLM_SAMPLE_JS_FUNC,
  VLM_SAMPLE_PY_FUNC,
} from '@/shared/data/vlm-sample';
import { LanguageProps } from './type';

export const languages: LanguageProps = [
  {
    name: 'Python',
    icon: '/python.svg',
  },
  {
    name: 'Golang',
    icon: '/go.svg',
  },
  {
    name: 'Javascript',
    icon: '/javascript.svg',
  },
];

export const themes: string[] = ['cobalt', 'monokai', 'twilight', 'dracula'];

export const paddings: string[] = ['1rem', '2rem', '3rem', '4rem'];

export function getLangFileName(language: string): string {
  switch (language) {
    case 'JavaScript':
      return 'index.js';
    case 'Golang':
      return 'main.go';
    case 'Python':
      return 'main.py';
    default:
      return 'index.js';
  }
}

export function getEditorCode(language: string, model: string): string {
  const VLM_SAMPLE_PY = VLM_SAMPLE_PY_FUNC(model);
  const VLM_SAMPLE_JS = VLM_SAMPLE_JS_FUNC(model);
  const VLM_SAMPLE_GO = VLM_SAMPLE_GO_FUNC(model);

  switch (language) {
    case 'JavaScript':
      return VLM_SAMPLE_JS;
    case 'Golang':
      return VLM_SAMPLE_GO;
    case 'Python':
      return VLM_SAMPLE_PY;
    default:
      return VLM_SAMPLE_JS;
  }
}
