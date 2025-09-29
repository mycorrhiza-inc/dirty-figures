import html2canvas from 'html2canvas-pro';

export const exportChartAsSVG = async (containerRef: React.RefObject<HTMLDivElement>, filename: string) => {
  if (!containerRef.current) {
    console.error('Chart container not found');
    return;
  }

  try {
    // Create canvas from the entire container (chart + legend)
    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: 'white',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convert canvas to SVG
    const svgString = canvasToSVG(canvas);

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log(`Chart exported as ${filename}.svg`);
  } catch (error) {
    console.error('Error exporting SVG:', error);
  }
};

const canvasToSVG = (canvas: HTMLCanvasElement): string => {
  const { width, height } = canvas;
  const dataURL = canvas.toDataURL('image/png');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image x="0" y="0" width="${width}" height="${height}" xlink:href="${dataURL}" />
</svg>`;
};