import React from 'react';
import { View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRPayload } from '@/utils/qrCode';
import { EventuColors } from '@/constants/theme';

interface QRCodeDisplayProps {
  payload: QRPayload | string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  showLogo?: boolean;
  logoSize?: number;
  validated?: boolean;
  scanned?: boolean;
  style?: ViewStyle;
}

export function QRCodeDisplay({
  payload,
  size = 160,
  color,
  backgroundColor,
  showLogo = true,
  logoSize = 40,
  validated = false,
  scanned = false,
  style,
}: QRCodeDisplayProps) {
  
  
  const qrColor = color || (validated ? '#10B981' : scanned ? '#F59E0B' : '#000000');
  const qrBackground = backgroundColor || (validated ? 'rgba(16, 185, 129, 0.08)' : scanned ? 'rgba(245, 158, 11, 0.05)' : '#FFFFFF');
  
  
  
  
  
  let qrValue: string;
  if (typeof payload === 'string') {
    qrValue = payload;
  } else if (payload && typeof payload === 'object') {
    
    if ('url' in payload && typeof payload.url === 'string') {
      qrValue = payload.url;
    } else {
      qrValue = JSON.stringify(payload);
    }
  } else {
    qrValue = '';
  }
  
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.qrWrapper,
          validated && styles.qrValidated,
          scanned && !validated && styles.qrScanned,
        ]}
      >
        <QRCode
          value={qrValue}
          size={size}
          color={qrColor}
          backgroundColor={qrBackground}
          logo={showLogo ? require('@/assets/images/iconqr.png') : undefined}
          logoSize={logoSize}
          logoBackgroundColor="transparent"
          logoMargin={2}
          quietZone={10}
          ecl="M" 
        />
      </View>
    </View>
  );
}

interface QRCodeDisplayWithLoadingProps extends QRCodeDisplayProps {
  loading?: boolean;
  error?: string | null;
}

export function QRCodeDisplayWithLoading({
  loading = false,
  error = null,
  ...props
}: QRCodeDisplayWithLoadingProps) {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, props.style]}>
        <ActivityIndicator size="large" color={EventuColors.magenta} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, props.style]}>
        {}
      </View>
    );
  }
  
  return <QRCodeDisplay {...props} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  qrValidated: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 16,
  },
  qrScanned: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 16,
  },
  loadingContainer: {
    padding: 40,
  },
  errorContainer: {
    padding: 40,
  },
});

