import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#81C784', // Moss Green - 穏やかな緑
      light: '#C8E6C9', // Mint - 柔らかいトーン
      dark: '#388E3C', // Deep Green - 深み
    },
    secondary: {
      main: '#FFB74D', // Coral - 暖かみのある補色
      light: '#FFE0B2', // Apricot - 柔らかいオレンジ系
      dark: '#F57C00', // Amber - 強調用
    },
    success: {
      main: '#81C784', // 成功時も優しい緑系で統一
    },
    warning: {
      main: '#FFD54F', // 柔らかい黄色
    },
    error: {
      main: '#E57373', // きつくない赤
    },
    info: {
      main: '#64B5F6', // 水色寄り・清潔感
    },
    background: {
      default: '#FAFAFA', // 明るく優しいグレー
      paper: '#FFFFFF', // 紙のような白
    },
    text: {
      primary: '#37474F', // グレーがかった黒・目に優しい
      secondary: '#757575', // 控えめな文字
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#37474F',
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
        },
      },
    },
  },
});
