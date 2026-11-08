import React from 'react';
import { CampaignMusicModal } from './CampaignMusicModal';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicModal: React.FC<MusicModalProps> = ({ isOpen, onClose }) => {
  return <CampaignMusicModal isOpen={isOpen} onClose={onClose} />;
};
