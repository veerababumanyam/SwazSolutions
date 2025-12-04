// Theme Type Definitions for vCard Theme System

export interface ThemeColors {
    background: string;
    backgroundSecondary: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
}

export interface ThemeTypography {
    fontFamily: string;
    headingFont: string;
    baseFontSize: string;
    headingSizes: {
        h1: string;
        h2: string;
        h3: string;
    };
    fontWeights: {
        normal: number;
        medium: number;
        bold: number;
    };
}

export interface ThemeLayout {
    maxWidth: string;
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
    };
}

export interface ThemeAvatar {
    shape: 'circle' | 'rounded' | 'square';
    size: string;
    borderWidth: string;
    borderColor: string;
    shadow: string;
}

export interface Theme {
    id?: number;
    name: string;
    category: 'professional' | 'modern' | 'creative' | 'minimal' | 'custom';
    colors: ThemeColors;
    typography: ThemeTypography;
    layout: ThemeLayout;
    avatar: ThemeAvatar;
    isSystem: boolean;
    createdAt?: string;
}

export interface ThemeSystemResponse {
    themes: Theme[];
    grouped: Record<string, Theme[]>;
    total: number;
}

export interface ThemeUserResponse {
    themes: Theme[];
    total: number;
}

export interface ThemeCreateRequest {
    name: string;
    category?: string;
    colors: ThemeColors;
    typography: ThemeTypography;
    layout: ThemeLayout;
    avatar: ThemeAvatar;
}

export interface ThemeUpdateRequest extends Partial<ThemeCreateRequest> { }

export interface ThemeApplyResponse {
    message: string;
    themeId: number;
    themeName: string;
}
