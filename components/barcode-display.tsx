import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ViewStyle, Platform } from 'react-native';
import { generateBarcodeData } from '@/utils/barcode';
import { EventuColors } from '@/constants/theme';
import Svg, { Rect } from 'react-native-svg';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  token: string; // Token dinámico que cambia periódicamente (igual que QR)
  width?: number;
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
  format?: 'CODE128' | 'EAN13' | 'CODE39';
}

interface Bar {
  x: number;
  width: number;
  height: number;
}

/**
 * Extrae las barras de un SVG generado por jsbarcode
 */
function extractBarsFromSvg(svgString: string, containerWidth: number, containerHeight: number): Bar[] {
  const bars: Bar[] = [];
  
  try {
    // Parsear el SVG string para extraer los rectángulos
    const rectMatches = svgString.matchAll(/<rect[^>]*>/g);
    
    for (const match of rectMatches) {
      const rectTag = match[0];
      const xMatch = rectTag.match(/x="([^"]+)"/);
      const yMatch = rectTag.match(/y="([^"]+)"/);
      const widthMatch = rectTag.match(/width="([^"]+)"/);
      const heightMatch = rectTag.match(/height="([^"]+)"/);
      
      if (xMatch && widthMatch && heightMatch) {
        const x = parseFloat(xMatch[1]);
        const width = parseFloat(widthMatch[1]);
        const height = parseFloat(heightMatch[1]);
        
        // Solo incluir barras (no espacios en blanco)
        if (width > 0 && height > 0) {
          bars.push({
            x: x,
            width: width,
            height: height,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error extracting bars from SVG:', error);
  }
  
  return bars;
}

export function BarcodeDisplay({
  token,
  width = 200,
  height = 60,
  showLabel = true,
  style,
  format = 'CODE128',
}: BarcodeDisplayProps) {
  const barcodeData = useMemo(() => generateBarcodeData(token), [token]);
  const [bars, setBars] = React.useState<Bar[]>([]);
  const [svgString, setSvgString] = React.useState<string>('');
  
  useEffect(() => {
    // Para web, usar jsbarcode directamente con DOM
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      
      try {
        JsBarcode(svg, barcodeData, {
          format: format,
          width: 2,
          height: height - 30,
          displayValue: true,
          fontSize: 12,
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
        
        setSvgString(svg.outerHTML);
        const extractedBars = extractBarsFromSvg(svg.outerHTML, width, height);
        setBars(extractedBars);
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    } else {
      // Para React Native, usar el generador Code128
      try {
        const { generateCode128Modules } = require('@/utils/code128-generator');
        const generatedBars = generateCode128Modules(barcodeData, width, height - 30);
        setBars(generatedBars);
      } catch (error) {
        console.error('Error generating barcode for RN:', error);
        // Fallback: generar barras básicas
        setBars([]);
      }
    }
  }, [barcodeData, width, height, format]);
  
  // Si estamos en web y tenemos SVG, renderizarlo directamente
  if (Platform.OS === 'web' && svgString) {
    return (
      <View style={[styles.container, style]}>
        {showLabel && (
          <Text style={styles.label}>Código de Barras</Text>
        )}
        <View style={[styles.barcodeWrapper, { width, minHeight: height }]}>
          <div
            dangerouslySetInnerHTML={{ __html: svgString }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </View>
        {showLabel && (
          <Text style={styles.barcodeText}>{barcodeData}</Text>
        )}
      </View>
    );
  }
  
  // Para React Native, usar SVG nativo
  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={styles.label}>Código de Barras</Text>
      )}
      <View style={[styles.barcodeWrapper, { width, minHeight: height }]}>
        {bars.length > 0 ? (
          <>
            <Svg 
              width={width - 20} 
              height={height - 30} 
              viewBox={`0 0 ${width - 20} ${height - 30}`}
              style={styles.svg}
            >
              {bars.map((bar, index) => (
                <Rect
                  key={`bar-${index}`}
                  x={bar.x}
                  y={0}
                  width={Math.max(bar.width, 1)}
                  height={bar.height}
                  fill="#000000"
                />
              ))}
            </Svg>
            {/* Números del código de barras */}
            <View style={styles.barcodeNumbers}>
              <Text style={styles.barcodeNumberText}>{barcodeData}</Text>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generando código...</Text>
          </View>
        )}
      </View>
      {showLabel && (
        <Text style={styles.barcodeText}>{barcodeData}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: EventuColors.mediumGray,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barcodeWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    minHeight: 60,
    overflow: 'hidden',
  },
  svg: {
    marginBottom: 4,
  },
  barcodeNumbers: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  barcodeNumberText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: EventuColors.black,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  barcodeText: {
    fontSize: 10,
    color: EventuColors.mediumGray,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
});
