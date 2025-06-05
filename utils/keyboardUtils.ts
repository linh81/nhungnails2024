import { Keyboard } from 'react-native';

/**
 * Dismisses the keyboard and blurs multiple text field refs
 * @param refs Array of React refs for text fields to blur
 */
export const dismissKeyboardAndBlurFields = (refs: React.RefObject<any>[]) => {
    Keyboard.dismiss();
    refs.forEach(ref => {
        ref.current?.blur();
    });
};

/**
 * Simple keyboard dismiss
 */
export const dismissKeyboard = () => {
    Keyboard.dismiss();
};

/**
 * Creates a keyboard dismiss handler for TouchableWithoutFeedback
 * @param refs Optional array of text field refs to blur
 * @returns Function to be used in onPress
 */
export const createKeyboardDismissHandler = (refs?: React.RefObject<any>[]) => {
    return () => {
        if (refs) {
            dismissKeyboardAndBlurFields(refs);
        } else {
            dismissKeyboard();
        }
    };
}; 