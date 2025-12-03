
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'calendar': 'event',
  'paintbrush.fill': 'brush',
  'sportscourt.fill': 'sports-soccer',
  'music.note': 'music-note',
  'theatermasks.fill': 'theater-comedy',
  'magnifyingglass': 'search',
  'ticket.fill': 'confirmation-number',
  'person.fill': 'person',
  'mappin': 'place',
  'mappin.fill': 'place',
  'chevron.down': 'keyboard-arrow-down',
  'slider.horizontal.3': 'tune',
  'hand.thumbsup.fill': 'thumb-up',
  'arrow.right': 'arrow-forward',
  'checkmark': 'check',
  'bell.fill': 'notifications',
  'chevron.left': 'chevron-left',
  'bookmark': 'bookmark-border',
  'bookmark.fill': 'bookmark',
  'info.circle': 'info',
  'qrcode': 'qr-code',
  'arrow.right.square.fill': 'logout',
  'clock': 'access-time',
  'xmark.circle.fill': 'cancel',
  'figure.run': 'directions-run',
  'laptopcomputer': 'laptop',
  'fork.knife': 'restaurant',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'apple.logo': 'apple',
  'g.circle.fill': 'g-translate',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'person.circle.fill': 'account-circle',
  'cart.fill': 'shopping-cart',
  'creditcard.fill': 'credit-card',
  'questionmark.circle.fill': 'help-outline',
  'doc.text.fill': 'description',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
