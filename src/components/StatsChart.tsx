import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import type { Statistics } from '../types';

interface StatsChartProps {
  distribution: number[];
  currentGuessCount: number | null;
}

export function StatsChart({ distribution, currentGuessCount }: StatsChartProps) {
  const { colors } = useTheme();
  const maxValue = Math.max(...distribution, 1);

  const barWidths = distribution.map((count) =>
    Math.max((count / maxValue) * 200, count > 0 ? 8 : 0)
  );

  return (
    <View style={{ marginTop: 16, alignItems: 'center' }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        Tahmin Dağılımı
      </Text>
      <Svg height={6 * 28} width={260}>
        {distribution.map((count, index) => {
          const isCurrent = currentGuessCount === index + 1;
          const barColor = isCurrent ? colors.tileCorrect : colors.keyBackground;
          return (
            <React.Fragment key={index}>
              <SvgText
                x={20}
                y={index * 28 + 18}
                fill={colors.text}
                fontSize={14}
                textAnchor="end"
              >
                {index + 1}
              </SvgText>
              <Rect
                x={30}
                y={index * 28 + 4}
                width={barWidths[index]}
                height={22}
                fill={barColor}
                rx={2}
              />
              <SvgText
                x={30 + barWidths[index] - 8}
                y={index * 28 + 18}
                fill="#FFFFFF"
                fontSize={12}
                textAnchor="end"
              >
                {count}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
