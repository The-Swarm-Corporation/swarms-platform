import React, { useEffect } from 'react';
import mermaid, { MermaidConfig } from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  theme?: any;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  theme = 'light',
}) => {
  useEffect(() => {
    const config: MermaidConfig = {
      startOnLoad: true,
      theme: theme,
      flowchart: {
        useMaxWidth: false,
      },
    };

    if (theme === 'dark') {
      config.theme = 'dark';
      config.themeVariables = {
        primaryColor: '#333',
        primaryTextColor: '#fff',
        primaryBorderColor: '#fff',
        lineColor: '#ccc',
        secondaryColor: '#006100',
        tertiaryColor: '#fff',
      };
    } else {
      config.theme = 'default';
      config.themeVariables = {
        primaryColor: '#f5f5f5',
        primaryTextColor: '#000',
        primaryBorderColor: '#888',
        lineColor: '#888',
        secondaryColor: '#006100',
        tertiaryColor: '#fff',
      };
    }

    mermaid.initialize({ ...config, startOnLoad: true });
    mermaid.contentLoaded();
  }, [theme]);

  return <div className="mermaid">{chart}</div>;
};

export default MermaidDiagram;
