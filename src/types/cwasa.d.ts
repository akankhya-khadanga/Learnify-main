/**
 * CWASA (Communication With Avatars - Signing Avatars) Type Definitions
 * 
 * Official CWASA library from University of East Anglia
 * https://vh.cmp.uea.ac.uk/
 */

interface CWASASigningAvatarOptions {
  containerDiv: HTMLElement;
  avatarName?: 'Marc' | 'Anna' | 'Luna' | 'Siggi' | 'Francoise';
  avatarSizePx?: number;
  backgroundColour?: string;
  playSpeed?: number;
}

interface CWASASigningAvatar {
  new (options: CWASASigningAvatarOptions): CWASASigningAvatar;
  
  /**
   * Play text as sign language
   * @param text - The text to sign
   * @param callback - Called when signing completes
   */
  playText(text: string, callback?: () => void): void;
  
  /**
   * Play SiGML (Signing Gesture Markup Language) directly
   * @param sigml - The SiGML XML string
   * @param callback - Called when signing completes
   */
  playSiGML(sigml: string, callback?: () => void): void;
  
  /**
   * Stop current animation
   */
  stop(): void;
  
  /**
   * Pause current animation
   */
  pause(): void;
  
  /**
   * Resume paused animation
   */
  resume(): void;
  
  /**
   * Set playback speed
   * @param speed - Speed multiplier (0.5 = half speed, 2.0 = double speed)
   */
  setSpeed(speed: number): void;
  
  /**
   * Change avatar
   * @param avatarName - Name of the avatar to switch to
   */
  setAvatar(avatarName: 'Marc' | 'Anna' | 'Luna' | 'Siggi' | 'Francoise'): void;
  
  /**
   * Destroy avatar instance and free resources
   */
  destroy(): void;
}

declare global {
  interface Window {
    CWASASigningAvatar: CWASASigningAvatar;
  }
}

export {};
