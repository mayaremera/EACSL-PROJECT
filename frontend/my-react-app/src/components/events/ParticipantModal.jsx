import React from 'react';
import { X, Linkedin } from 'lucide-react';
import ImagePlaceholder from '../ui/ImagePlaceholder';

const ParticipantModal = ({ participant, onClose }) => {
  if (!participant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Participant Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image and Name */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <ImagePlaceholder
                src={participant.imageUrl}
                alt={participant.name}
                name={participant.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-100 hover:border-gray-200 transition-colors"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{participant.name}</h3>
          </div>

          {/* Bio */}
          {participant.bio && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Biography</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{participant.bio}</p>
            </div>
          )}

          {/* LinkedIn Link */}
          {participant.linkedinUrl && (
            <div>
              <a
                href={participant.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0077b5] text-white rounded-lg hover:bg-[#006399] transition-colors font-semibold"
              >
                <Linkedin size={20} />
                View LinkedIn Profile
              </a>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;

