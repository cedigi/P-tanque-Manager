import React, { useState } from 'react';
import { Player, CyberImplant } from '../types/tournament';
import { CYBER_IMPLANTS, getRandomImplants, calculatePlayerRating, getImplantIcon } from '../utils/cyberImplants';
import { Zap, Eye, Brain, Cpu, Plus, X } from 'lucide-react';

interface CyberPlayerFormProps {
  onAddPlayer: (player: Player) => void;
  onCancel: () => void;
  playerLabel?: string;
}

export function CyberPlayerForm({ onAddPlayer, onCancel, playerLabel }: CyberPlayerFormProps) {
  const [name, setName] = useState('');
  const [selectedImplants, setSelectedImplants] = useState<CyberImplant[]>([]);

  const handleRandomImplants = () => {
    setSelectedImplants(getRandomImplants(2));
  };

  const handleAddImplant = (implant: CyberImplant) => {
    if (selectedImplants.length < 3 && !selectedImplants.find(i => i.id === implant.id)) {
      setSelectedImplants([...selectedImplants, implant]);
    }
  };

  const handleRemoveImplant = (implantId: string) => {
    setSelectedImplants(selectedImplants.filter(i => i.id !== implantId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const player: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        label: playerLabel,
        cyberImplants: selectedImplants,
        neuralScore: Math.floor(Math.random() * 100) + 50,
        combatRating: calculatePlayerRating(selectedImplants),
        hackingLevel: Math.floor(Math.random() * 10) + 1,
        augmentationLevel: selectedImplants.length
      };
      onAddPlayer(player);
    }
  };

  const getImplantTypeIcon = (type: string) => {
    switch (type) {
      case 'neural': return <Brain className="w-4 h-4" />;
      case 'ocular': return <Eye className="w-4 h-4" />;
      case 'motor': return <Zap className="w-4 h-4" />;
      case 'tactical': return <Cpu className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white tracking-wider">
          Nouveau joueur {playerLabel && `[${playerLabel}]`}
        </h3>
        <button
          onClick={onCancel}
          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-lg font-bold text-white mb-3 tracking-wide">
            Nom du joueur
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez le nom du joueur"
            className="glass-input w-full px-4 py-3 text-lg font-medium tracking-wide"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-lg font-bold text-white tracking-wide">
              Implants cybernétiques ({selectedImplants.length}/3)
            </label>
            <button
              type="button"
              onClick={handleRandomImplants}
              className="glass-button-secondary px-4 py-2 text-sm font-bold tracking-wide hover:scale-105 transition-all duration-300"
            >
              Aléatoire
            </button>
          </div>

          {selectedImplants.length > 0 && (
            <div className="mb-6 space-y-3">
              <h4 className="text-md font-bold text-white tracking-wide">Implants installés:</h4>
              {selectedImplants.map((implant) => (
                <div
                  key={implant.id}
                  className="glass-card p-4 flex justify-between items-center"
                  style={{ borderColor: implant.color }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2" style={{ color: implant.color }}>
                      {getImplantTypeIcon(implant.type)}
                      <span className="font-bold">{implant.name}</span>
                    </div>
                    <span className="text-white text-sm">+{implant.boost} pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImplant(implant.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CYBER_IMPLANTS.map((implant) => {
              const isSelected = selectedImplants.find(i => i.id === implant.id);
              const canAdd = selectedImplants.length < 3;
              
              return (
                <button
                  key={implant.id}
                  type="button"
                  onClick={() => handleAddImplant(implant)}
                  disabled={isSelected || !canAdd}
                  className={`glass-card p-4 text-left transition-all duration-300 ${
                    isSelected 
                      ? 'opacity-50 cursor-not-allowed' 
                      : canAdd 
                        ? 'hover:scale-105 cursor-pointer' 
                        : 'opacity-30 cursor-not-allowed'
                  }`}
                  style={{ borderColor: implant.color }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2" style={{ color: implant.color }}>
                      {getImplantTypeIcon(implant.type)}
                      <span className="font-bold text-sm">{implant.name}</span>
                    </div>
                    <span className="text-white text-xs">Niv.{implant.level}</span>
                  </div>
                  <p className="text-xs text-white/70 mb-2">{implant.description}</p>
                  <div className="text-xs font-bold" style={{ color: implant.color }}>
                    BOOST: +{implant.boost} pts
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4 bg-blue-500/10">
          <h4 className="text-lg font-bold text-white mb-3 tracking-wide">Statistiques prévues:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/80">Combat Rating:</span>
              <span className="text-white font-bold ml-2">{calculatePlayerRating(selectedImplants)}</span>
            </div>
            <div>
              <span className="text-white/80">Augmentation:</span>
              <span className="text-white font-bold ml-2">Niveau {selectedImplants.length}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="glass-button flex-1 py-3 px-6 font-bold text-lg tracking-wider hover:scale-105 transition-all duration-300"
          >
            Créer joueur
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="glass-button-secondary px-6 py-3 font-bold text-lg tracking-wider hover:scale-105 transition-all duration-300"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}