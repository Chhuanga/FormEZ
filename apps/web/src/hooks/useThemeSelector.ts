import { useFormStore } from '@/store/form';
import { prebuiltThemes, PrebuiltTheme } from '@/lib/themes';

export function useThemeSelector() {
  const { theme, setTheme, resetTheme } = useFormStore();

  // Get current selected prebuilt theme (if any)
  const getCurrentPrebuiltTheme = (): PrebuiltTheme | null => {
    return prebuiltThemes.find(prebuiltTheme => 
      theme.backgroundColor === prebuiltTheme.backgroundColor &&
      theme.formBackgroundColor === prebuiltTheme.formBackgroundColor &&
      theme.primaryColor === prebuiltTheme.primaryColor &&
      theme.questionTextColor === prebuiltTheme.questionTextColor
    ) || null;
  };

  // Apply a prebuilt theme
  const applyPrebuiltTheme = (prebuiltTheme: PrebuiltTheme) => {
    setTheme({
      backgroundColor: prebuiltTheme.backgroundColor,
      formBackgroundColor: prebuiltTheme.formBackgroundColor,
      questionTextColor: prebuiltTheme.questionTextColor,
      answerTextColor: prebuiltTheme.answerTextColor,
      primaryColor: prebuiltTheme.primaryColor,
      buttonTextColor: prebuiltTheme.buttonTextColor,
      fontFamily: prebuiltTheme.fontFamily,
      borderColor: prebuiltTheme.borderColor,
      borderWidth: prebuiltTheme.borderWidth,
      borderRadius: prebuiltTheme.borderRadius,
      textColor: prebuiltTheme.textColor,
    });
  };

  // Check if a prebuilt theme is currently selected
  const isPrebuiltThemeSelected = (prebuiltTheme: PrebuiltTheme): boolean => {
    return (
      theme.backgroundColor === prebuiltTheme.backgroundColor &&
      theme.formBackgroundColor === prebuiltTheme.formBackgroundColor &&
      theme.primaryColor === prebuiltTheme.primaryColor &&
      theme.questionTextColor === prebuiltTheme.questionTextColor
    );
  };

  return {
    theme,
    setTheme,
    resetTheme,
    getCurrentPrebuiltTheme,
    applyPrebuiltTheme,
    isPrebuiltThemeSelected,
  };
}
