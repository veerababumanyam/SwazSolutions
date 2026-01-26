import React, { useMemo } from 'react';
import { AppearanceSettings } from '../profile/AppearancePanel';

interface ThemeRendererProps {
    settings: AppearanceSettings;
    children: React.ReactNode;
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ settings, children }) => {
    const cssVariables = useMemo(() => {
        const vars: Record<string, string> = {
            '--theme-bg': settings.backgroundColor,
            '--theme-primary': settings.buttonColor,
            '--theme-text': settings.textColor,
            '--theme-header': settings.headerColor,
            '--theme-radius': `${settings.cornerRadius}px`,
            '--theme-font': settings.fontFamily,
            '--theme-wallpaper': settings.wallpaper || settings.backgroundColor,
        };

        // Button specific vars based on style
        if (settings.buttonStyle === 'solid') {
            vars['--btn-bg'] = settings.buttonColor;
            vars['--btn-text'] = settings.textColor;
            vars['--btn-border'] = 'transparent';
        } else if (settings.buttonStyle === 'glass') {
            vars['--btn-bg'] = `${settings.buttonColor}30`;
            vars['--btn-text'] = settings.buttonColor;
            vars['--btn-border'] = `${settings.buttonColor}40`;
        } else {
            vars['--btn-bg'] = 'transparent';
            vars['--btn-text'] = settings.buttonColor;
            vars['--btn-border'] = settings.buttonColor;
        }

        return vars;
    }, [settings]);

    const styleObject = useMemo(() => {
        return cssVariables as React.CSSProperties;
    }, [cssVariables]);

    return (
        <div style={styleObject} className="theme-container min-h-full">
            <style>{`
                .theme-container {
                    font-family: var(--theme-font), system-ui, sans-serif;
                }
                .theme-btn {
                    background-color: var(--btn-bg);
                    color: var(--btn-text);
                    border: 1px solid var(--btn-border);
                    border-radius: var(--theme-radius);
                    transition: all 0.2s ease;
                }
                .theme-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
            `}</style>
            {children}
        </div>
    );
};

export default ThemeRenderer;
