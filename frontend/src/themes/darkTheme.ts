import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C83FD', // Indigo Mist - 青紫の中間色
      light: '#A3A8FD', // Lavender Glow - 優しい光沢感
      dark: '#4953B8', // Deep Indigo - 深みを演出
    },
    secondary: {
      main: '#00BFA6', // Cyan Steel - 清潔感＋未来感
      light: '#4DD0BF', // Aqua Mist - 軽やかで透明感（調整）
      dark: '#00897B', // Teal Depth - モダンなコントラスト
    },
    success: {
      main: '#4CAF50', // Emerald - 優しい緑
    },
    warning: {
      main: '#FFA726', // Amber - 落ち着いた暖トーン（調整）
    },
    error: {
      main: '#E57373', // Soft Red - 柔らかい赤
    },
    info: {
      main: '#64B5F6', // Ice Blue - 穏やかな青
    },
    background: {
      default: '#0D1117', // Night Ash - ほぼ黒に近い炭グレー
      paper: '#161B22', // Graphite - 階層感強化（調整）
    },
    text: {
      primary: '#F0F2F5', // Mist White - 可読性向上（調整）
      secondary: '#A8B0B8', // Slate Gray - 上品な補助文字（調整）
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none', // ダークモードのグラデーション除去
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#30363D', // ダークモード用のボーダー色
        },
      },
    },
  },
});
